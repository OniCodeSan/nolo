// Pipeline di traduzione AI: IT → en/es/de/pt/fr con Claude.
// Preserva struttura/chiavi/placeholder/URL; traduce solo i valori stringa.
//
// Uso (la chiave va in .env, gitignored):
//   set -a; . ./.env; set +a
//   node scripts/translate-i18n.js static   # pagine statiche → src/data/static-pages.<lang>.json
//   node scripts/translate-i18n.js ui       # interfaccia    → src/i18n/locales/<lang>.json
//   node scripts/translate-i18n.js all
//
// Idempotente: rigenera i file di destinazione. Traduce per blocco di primo
// livello (slug/namespace) per restare sotto i limiti di token.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { STATIC_PAGES } from '../src/data/static-pages.js';

const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error('❌ Manca ANTHROPIC_API_KEY (mettila in .env). '); process.exit(1); }

const MODEL = process.env.TRANSLATE_MODEL || 'claude-sonnet-4-6';
const TARGETS = [
  { code: 'en', name: 'inglese' },
  { code: 'es', name: 'spagnolo' },
  { code: 'de', name: 'tedesco' },
  { code: 'pt', name: 'portoghese (Portogallo)' },
  { code: 'fr', name: 'francese' },
];

const sys = (langName) => `Sei un traduttore professionista madrelingua. Traduci TUTTI i valori stringa del JSON dall'italiano al ${langName}.
REGOLE FERREE:
- Mantieni invariate le CHIAVI del JSON, la struttura e l'annidamento.
- NON tradurre: il nome del brand "MoviQ", i placeholder come {{nome}} o {count}, i tag HTML, gli URL e i percorsi (es. /cerca, /blog).
- Tono naturale e idiomatico per un sito di noleggio auto tra privati e autonoleggi indipendenti.
- Mantieni la stessa punteggiatura/maiuscole dove sensato.
Rispondi ESCLUSIVAMENTE con il JSON tradotto valido, nessun testo prima o dopo, niente \`\`\`.`;

async function translateChunk(obj, langName) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 8192, system: sys(langName), messages: [{ role: 'user', content: JSON.stringify(obj) }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const text = (j?.content?.[0]?.text || '').trim();
  const s = text.indexOf('{'); const e = text.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('risposta non JSON');
  return JSON.parse(text.slice(s, e + 1));
}

// Traduce un oggetto iterando le chiavi di primo livello (un chunk per chiamata).
async function translateByTopKey(obj, langName) {
  const out = {};
  for (const k of Object.keys(obj)) {
    process.stdout.write(`    · ${k}\n`);
    out[k] = await translateChunk(obj[k], langName);
  }
  return out;
}

async function doStatic() {
  for (const t of TARGETS) {
    console.log(`\n[static] → ${t.code} (${t.name})`);
    const translated = await translateByTopKey(STATIC_PAGES, t.name);
    const file = resolve(process.cwd(), `src/data/static-pages.${t.code}.json`);
    writeFileSync(file, JSON.stringify(translated, null, 2) + '\n');
    console.log(`[static] ✓ scritto ${file}`);
  }
}

async function doUi() {
  const it = JSON.parse(readFileSync(resolve(process.cwd(), 'src/i18n/locales/it.json'), 'utf8'));
  for (const t of TARGETS) {
    console.log(`\n[ui] → ${t.code} (${t.name})`);
    const translated = await translateByTopKey(it, t.name);
    const file = resolve(process.cwd(), `src/i18n/locales/${t.code}.json`);
    writeFileSync(file, JSON.stringify(translated, null, 2) + '\n');
    console.log(`[ui] ✓ scritto ${file}`);
  }
}

const what = process.argv[2] || 'all';
const run = async () => {
  if (what === 'static' || what === 'all') await doStatic();
  if (what === 'ui' || what === 'all') await doUi();
  console.log('\n✅ Traduzione completata.');
};
run().catch(e => { console.error('❌', e.message); process.exit(1); });
