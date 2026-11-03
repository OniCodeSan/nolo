#!/bin/sh
# Stage locale: build del codice locale esattamente come per il deploy
# (build:seo = vite build + sitemap + prerender) in .docker/stage-dist, servita
# dal servizio compose `stage` su http://localhost:8083 con lo stesso nginx di prod.
# NB: legge (sitemap/prerender) e, dall'admin, scrive sul DB Supabase di PRODUZIONE.
#   sh scripts/build-stage.sh && docker compose up -d stage
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/.docker/stage-dist"
cd "$ROOT"

# build:seo richiede Node >= 20 (vedi memoria deploy): forza quello di Homebrew.
export PATH="/opt/homebrew/bin:$PATH"
set -a; . ./.env; set +a

npm run build:seo

TMP="$DEST.tmp"
rm -rf "$TMP" && cp -R dist "$TMP"
chmod -R a+rX "$TMP"
# Sincronizza DENTRO la cartella esistente: il container la monta in bind,
# sostituirla con mv lo lascerebbe agganciato alla vecchia (cancellata).
mkdir -p "$DEST"
rsync -a --delete "$TMP/" "$DEST/"
rm -rf "$TMP"

echo "Stage in $DEST ($(find "$DEST" -type f | wc -l | tr -d ' ') file)"
