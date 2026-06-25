# Supabase setup

## 1. Crea il progetto
- Vai su https://supabase.com → New project
- Annota PROJECT_URL e ANON_KEY (Settings → API)

## 2. Configura l'app
Nella root del repo:
```sh
cp .env.example .env
```
Riempi `.env` con `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## 3. Crea tabelle
Apri **SQL Editor** in Supabase dashboard:
1. Incolla [`schema.sql`](schema.sql) e esegui — crea tabelle, indici e RLS policies (read pubblico).
2. Incolla [`seed.sql`](seed.sql) e esegui — popola con i dati del prototipo.

## 4. Riavvia il container dev
```sh
docker compose restart dev
```
Le env vars `VITE_*` sono iniettate dal `.env` via Vite. Senza credenziali, l'app continua a usare i dati statici di [`src/data/proto-data.js`](../src/data/proto-data.js).

## Verifica
Apri il browser su http://localhost:8080 e in DevTools console controlla:
- `[MoviQ] Supabase non configurato …` → vuol dire che `.env` non è stato letto, ricontrolla il file e riavvia.
- Nessun messaggio → Supabase attivo. Le tabelle vengono interrogate via PostgREST.

## Schema
Le tabelle: `hosts`, `categories`, `cars`, `locations`, `nearest_hosts`, `reviews`. Tutte con RLS attivo e policy `select using (true)` (chiunque può leggere con la anon key, nessuno può scrivere senza service role).
