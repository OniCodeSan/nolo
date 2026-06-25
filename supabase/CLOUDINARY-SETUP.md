# Cloudinary Setup — hardening upload preset

L'upload Cloudinary è **unsigned** (client-side senza secret), quindi l'upload preset è pubblico per design. **Senza restrizioni sul preset chiunque può caricare contenuti arbitrari nel tuo account Cloudinary.**

Configura il preset con queste restrizioni **prima** di esporre l'app a traffico reale.

## Creazione preset

1. Dashboard Cloudinary → **Settings** → **Upload** → **Add upload preset**
2. **Preset name**: `moviq_cars_unsigned` (o quello che vuoi, poi va in `VITE_CLOUDINARY_UPLOAD_PRESET`)
3. **Signing Mode**: **Unsigned** ⚠️

## Restrizioni OBBLIGATORIE

Nella tab **Upload manipulations** + **Upload Control**:

| Campo | Valore | Perché |
|---|---|---|
| **Folder** | `noleggio/cars` | Tutti gli upload finiscono qui — impedisce l'abuso di altre folder |
| **Use filename or externally defined Public ID** | OFF | Niente public_id custom dal client |
| **Unique filename** | ON | Cloudinary genera nomi univoci |
| **Resource type** | `Image` | Niente video, raw, pdf |
| **Allowed formats** | `jpg, jpeg, png, webp, heic, heif` | Solo formati immagine moderni |
| **Max file size** | `10485760` (10 MB) | Anti DoS / spam |
| **Max image width** | `4000` | Resize auto se eccede |
| **Max image height** | `4000` | Idem |
| **Format** | `auto` | Cloudinary converte a WebP/AVIF in delivery |
| **Quality** | `auto:good` | Compressione adattiva |

## Restrizioni FORTEMENTE consigliate

| Campo | Valore | Perché |
|---|---|---|
| **Moderation** | `aws_rek_async` o `webpurify` | Filtra automaticamente contenuti NSFW/violenti. Costo: ~$1/1000 immagini |
| **Notification URL** | `https://moviq.it/api/cloudinary-webhook` (futuro) | Quando attivi, riceverai webhook su upload — utile per audit |
| **Eager transformations** | `c_fill,w_400,h_300,f_auto,q_auto` | Pre-genera la thumbnail al momento dell'upload |

## Restrizioni FACOLTATIVE (più conservative)

Se vuoi blindare ulteriormente:

| Campo | Valore | Effetto |
|---|---|---|
| **Allowed referrers** | `moviq.it, *.vercel.app, localhost` | Cloudinary rifiuta upload da altri domini |
| **Max uploads per IP** | configurabile via API | Rate limit lato Cloudinary |

⚠️ **Attenzione**: "Allowed referrers" può bloccare upload da preview Vercel; testa prima di abilitare.

## Verifica

Dopo configurazione, prova in console browser:

```js
// Questo deve FALLIRE (file troppo grande)
const fd = new FormData();
fd.append('file', new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'image/png' }));
fd.append('upload_preset', 'moviq_cars_unsigned');
fetch('https://api.cloudinary.com/v1_1/<cloud>/image/upload', { method: 'POST', body: fd })
  .then(r => r.json()).then(console.log);
// Atteso: { error: { message: "File size too large..." } }

// Questo deve FALLIRE (formato non permesso)
fd.set('file', new Blob(['test'], { type: 'application/pdf' }));
// idem POST → atteso error
```

Se entrambi non danno errore = preset troppo permissivo.

## Backup plan: revoca

Se scopri abuso del preset:
1. Cloudinary dashboard → Settings → Upload → trovi il preset → **Disable**
2. Crea un nuovo preset con nome diverso
3. Update `VITE_CLOUDINARY_UPLOAD_PRESET` su Vercel env
4. Redeploy
5. Le immagini già caricate restano accessibili via CDN

## Cleanup contenuti abusivi (manuale)

- Tab **Media Library** → filtra folder `moviq/cars` → ordina per data → identifica e cancella
- API alternativa: `DELETE /resources/image/upload?public_ids[]=...` con admin API key
- Per moderation a posteriori: `aws_rek_async` sull'esistente con job batch

---

## Cleanup automatico orfani (scale-ready)

Quando un host **cancella un veicolo** o **rimuove una foto**, MoviQ enqueue il `public_id` in `image_cleanup_queue` (tabella SQL alimentata da trigger). Un GitHub Action cron orario drena la coda chiamando l'**Admin API** di Cloudinary.

### Setup una tantum

1. **Cloudinary Admin API credentials**:
   - Dashboard Cloudinary → Settings → API Keys
   - Copia `Cloud name`, `API Key`, `API Secret` (è sensibile, mai client-side)

2. **Supabase service role**:
   - Dashboard Supabase → Project Settings → API → service_role secret (JWT)
   - **CRITICO**: questa key bypassa RLS. Custodiscila come password root.

3. **GitHub repository secrets** (Settings → Secrets and variables → Actions → New):

   | Secret | Valore |
   |---|---|
   | `SUPABASE_URL` | `https://YOUR_REF.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role JWT |
   | `CLOUDINARY_CLOUD_NAME` | `moviq` |
   | `CLOUDINARY_API_KEY` | da Cloudinary Settings |
   | `CLOUDINARY_API_SECRET` | da Cloudinary Settings |

4. **Verifica workflow**:
   - GitHub → Actions tab → "Cleanup Cloudinary images" → Run workflow (manuale)
   - Logs devono mostrare `[cleanup] queue vuota` (al primo run) o `processed: N`

### Frequenza cron

Default: ogni ora alle :15 ([cleanup-images.yml](../.github/workflows/cleanup-images.yml)). Se il volume sale a >10k cancellazioni/ora, aumenta:

```yaml
schedule:
  - cron: '*/15 * * * *'  # ogni 15 minuti
```

### Quota per host

[image-cleanup-schema.sql](image-cleanup-schema.sql) aggiunge `hosts.max_images` (default **100 immagini totali per host**). Il trigger `check_host_image_quota` blocca lato DB i tentativi di sforare. Per host VIP:

```sql
update hosts set max_images = 500 where id = 'super-host-id';
```

### Dashboard admin

Vai su `/admin/immagini` per:
- KPI: totali, upload 24h/30g, byte caricati 30g, coda pending/errori
- Top 10 host per quota usata (con progress bar)
- Coda cleanup con filtri (pending/errori/processati)
- Link a Cloudinary console

### Failure modes

| Sintomo | Cause | Fix |
|---|---|---|
| Riga rimane in coda con `attempts ≥ 3` | API Secret sbagliata o `public_id` malformato | Verifica secrets GitHub, ispeziona `last_error` su `/admin/immagini` |
| Quota error all'upload | Host ha raggiunto `max_images` | Aumenta `hosts.max_images` per quell'host |
| Cron non si avvia | Repo privato senza Action enable | Settings → Actions → Allow all actions |
| `webhook.site` o IP esterno usano la API_KEY | API_SECRET leaked | **Ruota subito** API Secret da Cloudinary Settings |

---

## Auto-moderation (consigliato a volume)

Quando hai >100 host attivi, l'attesa di una segnalazione manuale è troppo lenta. Attiva moderation automatica:

### Opzione A: AWS Rekognition (più accurato)

1. Settings → Upload → Add-ons → Enable **AWS Rekognition AI Moderation**
2. Settings → Upload Presets → modifica `moviq_cars_unsigned`:
   - Tab **Moderation**: select `aws_rek` (sync) o `aws_rek_async` (async, più scalabile)
3. Costo: ~$1/1000 immagini

Quando un'immagine viene flaggata come NSFW/violenza:
- Upload completa ma `moderation: rejected`
- L'immagine resta in `pending_moderation` finché admin non override

### Opzione B: WebPurify (più economico)

- ~$0.50/1000 immagini
- Filtra NSFW, abusivo, contenuti minori

### Webhook moderation outcome

Configura `Notification URL` sul preset → Cloudinary chiama `https://moviq.it/api/cloudinary-webhook` con il risultato. Endpoint Vercel/Supabase Edge Function da implementare quando attivi moderation.

---

## Stima costi a volume

| Scala | Storage | Bandwidth/mese | Cloudinary plan | Costo |
|---|---|---|---|---|
| 100 host × 5 foto | ~0.5 GB | ~2 GB | Free | 0€ |
| 1.000 host × 5 foto | ~5 GB | ~20 GB | Free | 0€ |
| 5.000 host × 5 foto | ~25 GB | ~100 GB | Plus | $89/mo |
| 10.000 host × 8 foto | ~80 GB | ~300 GB | Advanced | $224/mo |
| 50.000 host × 8 foto | ~400 GB | ~1.5 TB | Custom | ~$700+/mo |

**Soglia di cambio CDN**: oltre il piano Plus, considera **Cloudflare R2 + Cloudflare Images** (~$5 flat + bandwidth molto economico) o **Bunny CDN** ($0.005/GB). La migrazione richiede 1-2 giorni di lavoro: cambiare upload endpoint + script `migrate-cloudinary-to-r2.js` che copia gli asset in background.
