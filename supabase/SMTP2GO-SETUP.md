# SMTP2GO Setup — MoviQ Email transazionali

Guida per attivare le email transazionali brand-MoviQ via SMTP2GO. Free tier: 1000 email/mese, sufficienti per il lancio.

---

## Architettura

```
Trigger evento (subscription, booking, magic-link, ...)
       │
       ▼
Edge Function (es. stripe-webhook, booking-events)
       │  chiama sendMail(template, vars)
       ▼
_shared/email.ts  ──renderTemplate──▶ _shared/email-templates.ts
       │
       │   POST /v3/email/send  (HTTPS, API key)
       ▼
   SMTP2GO API ─── invia ───▶ Destinatario
       │
       │   webhook delivered/bounced/opened
       ▼
Edge Function smtp2go-webhook
       │
       ▼
   email_log (audit GDPR + diagnostica deliverability)
```

Nessuna libreria di terze parti per il rendering: i template sono stringhe HTML con `{{placeholder}}`, sostituiti da `renderTemplate()`. Zero dipendenze, zero magic.

---

## Step 1 — Account SMTP2GO

1. Registrazione su [smtp2go.com](https://smtp2go.com) con `cotugnomariano@gmail.com`
2. Verifica email account
3. Plan free (200/giorno - 1000/mese). Upgrade quando arriva volume reale.

## Step 2 — Aggiungi e verifica il dominio `moviq.it`

Dashboard SMTP2GO → **Settings → Sender Domains** → "Add Sender Domain":

- Domain: `moviq.it`
- SMTP2GO genera **3-4 record DNS** da aggiungere su Cloudflare:
  - 2× `CNAME` per DKIM (es. `s1._domainkey.moviq.it`, `s2._domainkey.moviq.it`)
  - 1× `TXT` per SPF (oppure modifica l'SPF esistente — vedi sotto)
  - 1× `TXT` per Return-Path (opzionale ma raccomandato)

### Su Cloudflare DNS

Vai a `dash.cloudflare.com → moviq.it → DNS → Records` e aggiungi i record forniti da SMTP2GO. Importante:

- I record DKIM/CNAME devono essere **DNS only (grigio)**, non proxied
- Se hai già un TXT SPF, **non crearne un secondo**: combinali in uno solo. Esempio:
  ```
  v=spf1 include:_spf.mx.cloudflare.net include:spf.smtp2go.com ~all
  ```
- Aggiungi anche un DMARC TXT per `_dmarc.moviq.it`:
  ```
  v=DMARC1; p=none; rua=mailto:dmarc@moviq.it; ruf=mailto:dmarc@moviq.it; fo=1
  ```
  (Tieni `p=none` finché monitori, poi passa a `p=quarantine` dopo 2 settimane di dati puliti)

Torna su SMTP2GO e clicca "Verify domain". Possono volerci 5-15 minuti perché Cloudflare propaghi.

## Step 3 — Crea l'API Key

Dashboard SMTP2GO → **Settings → API Keys** → "Add API Key":

- Name: `moviq-edge-functions`
- Scope: solo `send email` (niente più del necessario)
- Copia la chiave: inizia con `api-...`. Te la mostra una sola volta — salvala subito.

## Step 4 — Configura webhook eventi (consigliato)

Dashboard SMTP2GO → **Settings → Webhooks** → "Add Webhook":

- URL: `https://<TUO_SUPABASE_REF>.supabase.co/functions/v1/smtp2go-webhook?secret=<RANDOM_STRING>`
  - Genera una stringa random forte (es. `openssl rand -hex 32`) e mettila come `?secret=...`
  - Conserverai questa stringa anche come `SMTP2GO_WEBHOOK_SECRET` su Supabase
- Events: seleziona `delivered`, `bounce`, `spam`, `rejected`, `opened` (opzionale)
- Format: JSON

## Step 5 — Migration Postgres

Dashboard Supabase → **SQL Editor** → New query → incolla [supabase/email-log-schema.sql](email-log-schema.sql) → Run.

Verifica che la tabella `email_log` sia creata e abbia le policy RLS.

## Step 6 — Imposta secrets sulle Edge Functions

```bash
supabase secrets set SMTP2GO_API_KEY=api-xxxxxxxxxxxxxxxxxxxx
supabase secrets set SMTP2GO_WEBHOOK_SECRET=<la_stringa_random_di_step_4>
supabase secrets set EMAIL_FROM='MoviQ <hello@moviq.it>'
supabase secrets set EMAIL_REPLY_TO='support@moviq.it'
```

## Step 7 — Deploy delle Edge Functions

```bash
supabase functions deploy send-email
supabase functions deploy smtp2go-webhook --no-verify-jwt

# Il stripe-webhook va re-deployato perché ora chiama sendMail()
supabase functions deploy stripe-webhook --no-verify-jwt
```

## Step 8 — Test

Da un terminale, manda una mail di test:

```bash
curl -X POST 'https://<REF>.supabase.co/functions/v1/send-email' \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "cotugnomariano@gmail.com",
    "template": "host_welcome",
    "vars": { "host_name": "Mario Rossi", "backoffice_url": "https://moviq.it/noleggia" }
  }'
```

Atteso: `{ "ok": true, "id": "<uuid>" }` e l'email arriva entro 30 secondi. Verifica:

1. Casella Gmail di test → ricevuta? Apri "Visualizza originale" → SPF=PASS, DKIM=PASS, DMARC=PASS
2. Dashboard SMTP2GO → Reports → vedi l'invio + status
3. Supabase Dashboard → Table editor → `email_log` → riga con `status=sent`, `provider_message_id`

Aspetta qualche secondo poi controlla che il webhook abbia aggiornato `status=delivered`.

## Step 9 — Magic-link branding (opzionale ma raccomandato)

Le email magic-link di default le manda Supabase Auth con template generico. Per usare il nostro template `magic_link`:

**Opzione A — Custom SMTP** (più semplice):
Dashboard Supabase → **Authentication → Email Templates → SMTP Settings** → abilita "Enable Custom SMTP" e inserisci:
- Host: `mail.smtp2go.com`
- Port: `587`
- Username: trovi le credenziali SMTP in SMTP2GO → Settings → SMTP Users
- Sender email: `hello@moviq.it`
- Sender name: `MoviQ`

Poi in **Email Templates → Magic Link** sostituisci il template HTML con il nostro (copialo da `email-templates.ts`, sezione `magic_link`).

**Opzione B — Auth Hook** (più complesso ma migliore log):
Configura un Auth Hook "Send Email" che chiami la nostra Edge Function `send-email`. Documentazione: [supabase.com/docs/guides/auth/auth-hooks](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook).

---

## Template disponibili oggi

Tutti in `supabase/functions/_shared/email-templates.ts`. Si chiamano col loro `TemplateKey`:

| Template | Quando viene mandata |
|---|---|
| `magic_link` | Login utente / noleggiatore |
| `host_welcome` | Primo `subscription.created` (trial inizia) |
| `host_subscription_trial_ending` | 3 giorni prima del fine-trial (`trial_will_end`) |
| `host_subscription_payment_failed` | `invoice.payment_failed` |
| `host_subscription_canceled` | `subscription.deleted` |
| `booking_request_host` | Cliente prenota → al noleggiatore |
| `booking_confirmed_user` | Noleggiatore conferma → al cliente |
| `booking_rejected_user` | Noleggiatore rifiuta → al cliente |
| `booking_reminder_24h` | 24h prima del ritiro → al cliente |
| `review_request` | 24h dopo la riconsegna → al cliente |

Gli ultimi 5 (booking) non sono ancora agganciati a un trigger automatico — lo facciamo quando hai un caso d'uso reale.

---

## Variabili d'ambiente — checklist completa

| Secret | Quando viene letta | Valore atteso |
|---|---|---|
| `SMTP2GO_API_KEY` | send-email | `api-...` |
| `SMTP2GO_WEBHOOK_SECRET` | smtp2go-webhook | stringa random forte |
| `EMAIL_FROM` | tutti i sender | `MoviQ <hello@moviq.it>` |
| `EMAIL_REPLY_TO` | tutti i sender | `support@moviq.it` |

(Le secret Stripe restano come da `STRIPE-SETUP.md`.)

---

## GDPR e log invii

La tabella `email_log` traccia per ogni invio: destinatario, template, subject, status, provider_message_id, payload (sanitizzato — i token magic-link sono troncati). RLS:

- L'utente vede solo le proprie email (`to_user_id = auth.uid()`) → soddisfa diritto art. 15
- L'admin vede tutto (claim `app_metadata.role = admin`)
- Le scritture le fa solo il service_role (Edge Functions)

Retention raccomandata: 24 mesi dalla data di invio (allineata alla Privacy Policy). Un job di pulizia periodica si può aggiungere come Supabase pg_cron in una seconda fase.

---

## Troubleshooting

**SPF=FAIL / DKIM=FAIL** → controlla che i record DNS su Cloudflare non siano "Proxied" (devono essere DNS only, grigi). Dopo modifiche aspetta 15-30 minuti.

**Tutte le mail finiscono in spam** → manca il DMARC TXT, oppure il sender domain non è verificato su SMTP2GO. Verifica entrambi.

**`{ ok: false, error: "SMTP2GO_API_KEY non configurata" }`** → `supabase secrets list` per controllare; riprova `supabase functions deploy send-email` dopo aver settato le secrets.

**Webhook non aggiorna `email_log`** → controlla `?secret=...` nell'URL configurato su SMTP2GO. Se sbagliato, la function risponde 403 silenziosamente.
