# Playwright e2e — MoviQ

## Cosa testano

| File | Cosa | Auth richiesta |
|---|---|---|
| `01-search-flow.spec.js` | Home → Search → Listing → Vehicle + 404 | no |
| `02-booking-flow.spec.js` | Vehicle → Booking, gate AuthModal | no |
| `03-host-accept.spec.js` | Host backoffice accessibile, accept request | sì (E2E_HOST_STORAGE_STATE) |
| `04-magic-link-restore.spec.js` | localStorage persistence + hash error toast | no |

I test girano contro la build production (`npm run build && npm run preview`).
Playwright config la lancia automaticamente.

## Run locale (host macOS / Linux non Alpine)

```bash
npm run test:e2e:install     # una volta sola
npm run test:e2e             # tutti i browser
npm run test:e2e:ui          # UI mode interattivo
npm run test:e2e:headed      # con browser visibile
```

**NON funziona dentro il container Docker `node:20-alpine`** — mancano dipendenze native dei browser. Usa l'host nativo o la CI GitHub Actions.

## Run su CI

Già configurato in `.github/workflows/ci.yml`. Runs su ogni push/PR.
Secret opzionali:
- `E2E_SUPABASE_URL` — Supabase di staging/test (NON prod)
- `E2E_SUPABASE_ANON_KEY` — anon key dello stesso

Senza questi secret i test girano in modalità proto-data (offline mock) e i test che richiedono auth reale vengono skippati automaticamente.

## Aggiungere un test authed (host accept)

1. Genera storage state:
   ```bash
   npx playwright codegen http://localhost:8080 \
     --save-storage=tests/.auth/host.json
   ```
   Fai login come host, poi chiudi il browser. Il file contiene cookie + localStorage.

2. Esporta il path:
   ```bash
   export E2E_HOST_STORAGE_STATE=tests/.auth/host.json
   npm run test:e2e -- 03-host-accept
   ```

3. **Non committare** `tests/.auth/` (è in `.gitignore` se aggiunto, altrimenti aggiungilo).

## Selettori usati

Strategia: nessun `data-testid` invasivo. Si usano in ordine:
1. `getByRole('button', { name: /.../ })` — accessibile e stabile
2. `getByText(/.../)` — copy-based, regge ai refactor di stile
3. `getByPlaceholder(/.../)` — per gli input

Se in futuro un selettore diventa instabile (label tradotta, ecc), si può aggiungere `data-testid` puntuale.
