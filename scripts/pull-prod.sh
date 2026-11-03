#!/bin/sh
# Scarica la dist attualmente live su moviq.it (Hetzner) in .docker/prod-dist,
# servita dal servizio compose `prod` → copia locale identica alla produzione
# (pagine prerenderizzate, sitemap e asset inclusi). Sul server è sola lettura.
#   sh scripts/pull-prod.sh && docker compose up -d
set -eu

HOST="root@178.104.218.61"
REMOTE_DIST="/var/www/moviq.it/dist"
DEST="$(cd "$(dirname "$0")/.." && pwd)/.docker/prod-dist"

TMP="$DEST.tmp"
rm -rf "$TMP" && mkdir -p "$TMP"
ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes "$HOST" "tar -czf - -C $REMOTE_DIST ." | tar -xzf - -C "$TMP"
# Mode leggibili per il worker nginx del container.
chmod -R a+rX "$TMP"
# Sincronizza DENTRO la cartella esistente: il container la monta in bind,
# sostituirla con mv lo lascerebbe agganciato alla vecchia (cancellata).
mkdir -p "$DEST"
rsync -a --delete "$TMP/" "$DEST/"
rm -rf "$TMP"

echo "Copia prod in $DEST ($(find "$DEST" -type f | wc -l | tr -d ' ') file)"
