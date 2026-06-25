# Stripe Setup — MoviQ Subscriptions

Guida operativa per portare in produzione l'abbonamento dei noleggiatori (49 €/mese, trial 30 giorni, rinnovo automatico).

---

## Architettura

```
Browser noleggiatore
       │
       │  Bearer JWT Supabase
       ▼
Supabase Edge Functions (Deno, serverless EU)
   ├─ create-checkout    → Stripe Checkout Session (subscription, trial 30gg)
   ├─ billing-portal     → Stripe Customer Portal
   └─ stripe-webhook     ← Stripe push events (firmati HMAC)
       │
       ▼
Supabase Postgres
   └─ host_subscriptions (RLS: host read-only, service_role write)
```

Il **frontend** non parla mai direttamente con l'API segreta di Stripe — solo via Edge Functions. Stripe non vede mai il database — solo via webhook firmato.

---

## Pricing model

- **Prodotto**: "Abbonamento noleggiatore MoviQ"
- **Prezzo**: 49 € + IVA (22%) / mese, ricorrente
- **Trial**: 30 giorni dal momento del checkout, carta richiesta upfront
- **Behavior trial → paid**: addebito automatico al termine. Se carta non valida → `subscription.canceled`
- **Cancel**: in qualsiasi momento dal Customer Portal, resta attivo fino a `current_period_end`

---

## Step 1 — Crea l'account Stripe

1. Vai su [stripe.com](https://stripe.com) → "Sign up" con `cotugnomariano@gmail.com`
2. Inserisci dati società (anche se ancora in costituzione, va bene una persona fisica con P.IVA temporanea — l'account passa in modalità live solo dopo KYC completo)
3. Imposta paese **Italia**, valuta **EUR**

Per il primo deploy si lavora in **modalità test** (chiavi che iniziano con `sk_test_…` / `pk_test_…`). I pagamenti test sono finti, addebiti zero, ma il flusso è identico alla produzione.

## Step 2 — Crea il Product + Price

Dashboard Stripe → **Products** → "Add product":

- **Name**: `Abbonamento noleggiatore MoviQ`
- **Description**: `Pubblicazione su moviq.it della flotta noleggio. Trial 30 giorni gratuiti, rinnovo automatico mensile.`
- **Pricing model**: `Standard pricing`
- **Price**: `49.00 EUR`
- **Billing period**: `Monthly`
- **Tax behavior**: `Exclusive` (l'IVA è aggiunta sopra il prezzo)

Salva e copia il **Price ID** (es. `price_1Q…`).

## Step 3 — Configura Tax (importante per IVA italiana)

Dashboard Stripe → **Tax** → **Settings**:

1. Abilita **Stripe Tax**
2. **Origin address**: la sede legale italiana
3. **Default tax category**: `digital services` per la sub (è un SaaS B2B)
4. Reverse-charge **on** per clienti UE con P.IVA valida (Stripe gestisce automaticamente)
5. Soglia obbligo VIES: già gestita da Stripe

In `create-checkout/index.ts` è già attivo `automatic_tax: { enabled: true }` e `tax_id_collection: { enabled: true }`. Stripe chiederà al noleggiatore la P.IVA in fase di checkout e applicherà l'IVA corretta (22% per IT, reverse-charge per altri stati UE B2B).

## Step 4 — Configura il Customer Portal

Dashboard Stripe → **Settings → Billing → Customer portal**:

- **Functionality**: abilita `Customer can update payment methods`, `Customer can view invoices`, `Customer can cancel subscriptions`
- **Cancellation**: "Cancel at end of billing period" (no immediate refund — abbiamo già pagato il mese in corso)
- **Subscriptions**: lascia disabilitato il "Pause" se non lo vuoi
- **Business information**: nome `MoviQ`, supporto `support@moviq.it`, privacy link `https://moviq.it/privacy`, terms `https://moviq.it/termini`

Salva.

## Step 5 — Configura il Webhook

Dashboard Stripe → **Developers → Webhooks** → "Add endpoint":

- **Endpoint URL**: `https://<YOUR_SUPABASE_REF>.supabase.co/functions/v1/stripe-webhook`
- **Events to send** (clicca "Select events" e seleziona SOLO questi):
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.paused`
  - `customer.subscription.resumed`
  - `customer.subscription.trial_will_end`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.deleted`

Salva. Copia il **Signing secret** (inizia con `whsec_…`). Lo useremo come `STRIPE_WEBHOOK_SECRET`.

## Step 6 — Applica la migration Postgres

Sul Supabase project del MoviQ → SQL Editor → incolla e esegui:

```bash
# se lavori in locale con Supabase CLI
supabase db push

# OPPURE direttamente dal dashboard
# Dashboard → SQL Editor → New query → incolla supabase/host-subscriptions-schema.sql
```

Verifica che la tabella `host_subscriptions` e la view `host_subscription_status` siano create.

## Step 7 — Configura le secrets sulle Edge Functions

Dal terminal locale (richiede [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
# Login una tantum
supabase login
supabase link --project-ref <YOUR_SUPABASE_REF>

# Carica le secret (NON committarle in git)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
supabase secrets set STRIPE_PRICE_ID=price_xxxxxxxxxxxx
supabase secrets set APP_URL=https://moviq.it

# (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY sono già auto-iniettate
#  dal runtime: NON impostarle manualmente)
```

In alternativa, sul dashboard Supabase → **Edge Functions → Secrets** puoi inserirle dalla UI.

## Step 8 — Deploya le 3 Edge Functions

```bash
supabase functions deploy create-checkout
supabase functions deploy billing-portal

# IMPORTANTE: il webhook NON deve verificare il JWT di Supabase,
# perché Stripe non manda un Bearer token (verifica firma HMAC).
supabase functions deploy stripe-webhook --no-verify-jwt
```

Verifica:

```bash
curl -X POST https://<REF>.supabase.co/functions/v1/stripe-webhook
# atteso: 400 missing signature (=la function è up)
```

## Step 9 — Test end-to-end

1. Apri MoviQ → entra come noleggiatore → vai a `/noleggia/abbonamento`
2. Click "Attiva ora — 30 giorni gratuiti"
3. Stripe Checkout → usa carta di test `4242 4242 4242 4242`, CVC `123`, qualsiasi data futura
4. Inserisci P.IVA test italiana se richiesta (es. `IT12345678901`)
5. Torna a `/noleggia/abbonamento?checkout=success` → dopo 2-3s la card mostra "Periodo di prova attivo, 30 giorni rimanenti"
6. Dashboard Stripe → Customers → vedi cliente + subscription in `trialing`
7. Dashboard Supabase → host_subscriptions → riga aggiornata con status=trialing

### Test webhook con Stripe CLI (opzionale)

Per simulare in locale:

```bash
stripe login
stripe listen --forward-to https://<REF>.supabase.co/functions/v1/stripe-webhook

# In un altro terminale, fa partire eventi:
stripe trigger customer.subscription.trial_will_end
stripe trigger invoice.payment_failed
```

## Step 10 — Passa in live

Quando KYC è completo e vuoi accettare pagamenti reali:

1. Dashboard Stripe → bottone in alto a destra "View test data" → switcha a **Live**
2. Ricrea Product/Price/Webhook in live (sono separati da test)
3. Aggiorna le secret con le chiavi `sk_live_…`, `pk_live_…`, `whsec_…` live
4. Redeploya le 3 functions con `supabase functions deploy ...`
5. Primo cliente reale: monitora dashboard Stripe + tabella `host_subscriptions`

---

## Checklist secrets

| Variabile | Dove | Esempio |
|---|---|---|
| `STRIPE_SECRET_KEY` | Supabase secrets | `sk_test_…` / `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | Supabase secrets | `whsec_…` |
| `STRIPE_PRICE_ID` | Supabase secrets | `price_1Q…` |
| `APP_URL` | Supabase secrets | `https://moviq.it` |
| `VITE_SUPABASE_URL` | `.env` build frontend | già configurato |
| `VITE_SUPABASE_ANON_KEY` | `.env` build frontend | già configurato |

⚠️ La `STRIPE_SECRET_KEY` non deve **mai** finire nel bundle frontend o in git. Solo dentro Supabase secrets.

---

## Troubleshooting

**Checkout 401** → il JWT del frontend è scaduto, l'utente deve riloggarsi.
**Checkout 403** → l'utente loggato non è `owner_user_id` dell'host_id passato.
**Webhook 400 `invalid signature`** → `STRIPE_WEBHOOK_SECRET` errato o il body è stato modificato in transito (no proxy che ricomprime).
**Webhook 200 ma riga DB non aggiornata** → controlla i log della function con `supabase functions logs stripe-webhook` — di solito è un `host_id` mancante nei metadata della subscription.
**Status resta `incomplete` per sempre** → l'utente non ha completato l'SCA (3D Secure) al checkout. Mandalo nel Customer Portal a completare il pagamento.

---

## Diritti GDPR e cancellazione account

Quando un noleggiatore chiude l'account MoviQ:

1. Il backend marca `host_subscriptions.status = canceled`
2. La Edge Function chiama anche `stripe.subscriptions.cancel(sub_id)` per evitare addebiti futuri
3. Il record stripe customer resta (per legge fiscale 10 anni sulle fatture) ma viene anonimizzato (`name`, `email` rimossi)

Non implementato in questa versione: lo aggiungiamo quando arrivano i primi cancel reali.
