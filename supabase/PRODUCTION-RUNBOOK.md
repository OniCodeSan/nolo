# Supabase Production Runbook — MoviQ

Esegui questi step **una sola volta** sul progetto Supabase di produzione (separato da quello di sviluppo).

---

## 1. Creazione progetto

1. Vai su [supabase.com](https://supabase.com) → New project
2. Nome: `moviq-prod`
3. Region: **EU West (Ireland) / Frankfurt** (latenza minima da IT)
4. DB password: salva su 1Password / Bitwarden
5. Plan: Free per ora (upgrade quando supera limiti)

---

## 2. Esecuzione SQL

**Ordine OBBLIGATORIO** — ogni file dipende dai precedenti.

Apri **SQL Editor** sul dashboard Supabase. Per ogni file:
1. Apri il file da `supabase/<nome>.sql` nel repo
2. Copia tutto il contenuto
3. Incolla nell'editor
4. Click **Run**
5. Verifica che non ci siano errori rossi prima di passare al successivo

| # | File | Cosa fa |
|---|---|---|
| 1 | `schema.sql` | Schema base: cars, hosts, reviews |
| 2 | `seed.sql` | Dati demo iniziali (skip se vuoi DB vuoto) |
| 3 | `seed-extended.sql` | Auto extra per demo (skip se vuoto) |
| 4 | `auth-schema.sql` | profiles, bookings, saved_cars + RLS |
| 5 | `host-backoffice-schema.sql` | Estensione hosts: termini, IBAN, pagamento |
| 6 | `host-vehicles-schema.sql` | cars.status (draft/active/archived) |
| 7 | `host-vehicles-notes.sql` | cars.internal_notes |
| 8 | `car-catalog-schema.sql` | Tabelle brand/model |
| 9 | `car-catalog-seed.sql` | ~70 brand, ~470 modelli IT |
| 10 | `host-bookings-schema.sql` | RPC accept/decline |
| 11 | `host-bookings-complete.sql` | RPC complete + cancel_booking |
| 12 | `host-stats-schema.sql` | car_views + host_stats + market_stats RPC |
| 13 | `messages-notifications-schema.sql` | messages, notifications, 3 trigger |
| 14 | `host-vehicles-images.sql` | cars.images jsonb (Cloudinary) |
| 15 | `moderation-schema.sql` | profiles.is_admin, host status, reports, admin RPCs |
| 16 | `security-pii-isolation.sql` | **⚠️ critical security**: views cars_public/hosts_public + RLS hardening |
| 17 | `security-rate-limit-audit.sql` | Rate limit reports + audit_log table + RPC wrap |
| 18 | `image-cleanup-schema.sql` | Cleanup queue + upload log + per-host quota (vedi [CLOUDINARY-SETUP.md](CLOUDINARY-SETUP.md#cleanup-automatico-orfani-scale-ready)) |

**Se decidi di NON importare i seed**: salta 2 e 3, il resto NO.

---

## 3. Auth configuration

**Authentication → Providers → Email**:
- ✅ Enable email provider
- ✅ Enable Email confirmations
- ⛔ Disable "Confirm email" (passiamo a magic-link, niente password)
- Magic link expiry: **3600 sec (1h)** — default va bene

**Authentication → URL Configuration**:

| Campo | Valore |
|---|---|
| Site URL | `https://moviq.it` (o tuo dominio finale) |
| Redirect URLs | `https://moviq.it/**`<br>`https://*.vercel.app/**` (preview deploy)<br>`http://localhost:8080/**` (dev locale) |

**Importante**: i pattern `/**` permettono il redirect a qualsiasi path. Senza questi, il magic-link ritorna sempre alla root e perdi il deep-link al veicolo/booking.

**Authentication → Email Templates → Magic Link**:
Personalizza opzionalmente il template HTML (logo, colori, italiano). Default in inglese è OK per partire.

---

## 4. Storage (per Cloudinary subentriamo dopo)

Phase 4 useremo Cloudinary, quindi per ora **niente bucket Supabase Storage**.

---

## 5. Smoke test post-deploy

Dopo aver collegato Vercel con le env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), apri l'app e verifica:

### 5.1 Flusso anonimo
- [ ] Home carica senza errori console
- [ ] `/cerca` mostra auto dal DB
- [ ] `/auto/:id` apre un veicolo (clicca da listing)
- [ ] `/cerca/dove` permette di scegliere città

### 5.2 Flusso login
- [ ] Click "Accedi" → AuthModal apre
- [ ] Inserisci email reale → "Controlla la mail"
- [ ] Email arriva entro 30 sec (controlla spam)
- [ ] Click link → torna sull'app autenticato
- [ ] Toast "Accesso effettuato" visibile
- [ ] `/profilo` mostra profilo (creato automaticamente)

### 5.3 Booking flow
- [ ] Da `/auto/:id`, click "Richiedi prenotazione"
- [ ] Form `/prenota/:id` compilabile
- [ ] Submit → `/conferma` mostra summary
- [ ] `/prenotazioni` mostra la nuova prenotazione
- [ ] Lo stato è "In attesa"

### 5.4 Magic-link resilient
- [ ] Inizia prenotazione → richiedi login
- [ ] Chiudi tab
- [ ] Apri email da nuova tab → click link
- [ ] Devi tornare **esattamente** sulla pagina prenotazione con date e auto già selezionate

### 5.5 Magic-link scaduto
- [ ] Richiedi magic-link
- [ ] Aspetta 65 minuti (o usa un link vecchio)
- [ ] Click → app mostra toast "Il link di accesso è scaduto"

### 5.6 Host flow
- [ ] Promuovi un utente a host (SQL: `update profiles set is_host = true where email = '...'`)
- [ ] `/noleggia` carica HostDashboard
- [ ] Crea un veicolo → appare in `/noleggia/veicoli`
- [ ] Pubblica → diventa visibile in `/cerca`
- [ ] Con un altro account, prenota quel veicolo
- [ ] Tornando come host → `/noleggia/richieste` mostra la richiesta
- [ ] Accept → la prenotazione passa ad "Accettata"
- [ ] Notifica appare sia per cliente che host
- [ ] Chat funziona in `/profilo/messaggi`

### 5.7 RLS check
Con un utente A loggato, prova a leggere prenotazioni di utente B via Supabase REST:
```bash
curl 'https://YOUR_REF.supabase.co/rest/v1/bookings?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_A_JWT"
```
Devi ricevere **solo** le prenotazioni di A (o un array vuoto se non ne ha). Se vedi prenotazioni di B → RLS è rotta, **NON deployare**.

---

## 6. Backup automatico

Supabase Free fa snapshot giornalieri 7gg. Sufficiente per MVP.
Per essere safe, **prima** di ogni cambio schema rilevante:
1. Database → Backups → Download
2. Salva in `~/Documents/moviq-backups/YYYY-MM-DD.dump`

---

## 7. Variabili Vercel

Dashboard Vercel → Project → Settings → Environment Variables.

### Production
| Key | Value | Scope |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://YOUR_REF.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (anon public, NON service_role) | Production |
| `VITE_SENTRY_DSN` | (vuoto fino a setup Sentry) | Production |

### Preview
Stessi valori, scope **Preview** (così i preview deploy puntano alla stessa prod DB).

**NO `service_role` key in Vercel.** Solo `anon` public. Service role compromessa = DB compromesso.

---

## 8. Failure modes noti

| Problema | Causa | Fix |
|---|---|---|
| Magic-link torna sempre a `/` | Manca pattern `/**` in Redirect URLs | Aggiungilo |
| "Email rate limit exceeded" | Free plan = 4 mail/h | Aspetta o aggiungi SMTP provider (Resend) |
| "RLS policy violation" su insert | Trigger o policy mancanti | Re-esegui SQL in ordine |
| Notifiche non arrivano | Trigger mancante | Esegui `messages-notifications-schema.sql` |
| Statistiche vuote | RPC mancante | Esegui `host-stats-schema.sql` |
| Brand/model picker vuoto | Catalog seed mancante | Esegui `car-catalog-seed.sql` |

---

## 9. Hardening post-MVP (NON ora)

Da fare quando si supera il traffico Free:
- SMTP custom (Resend/Postmark) per delivery email
- Connection pooler (PgBouncer) attivo
- Read replica
- Edge function per delete account vero (oggi soft delete)
