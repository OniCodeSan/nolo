// Prerender statico delle pagine blog DOPO `vite build`.
// Serve la dist con vite preview, la apre con Chromium (Playwright), aspetta il
// render React e salva l'HTML completo in dist/blog/<slug>/index.html. Così
// nginx serve ai crawler una pagina già renderizzata (testo + meta + JSON-LD),
// senza bisogno che eseguano il JS. La SPA si re-idrata normalmente per gli utenti.
//
// Attivazione: PRERENDER=1 (richiede le env VITE_SUPABASE_* per l'elenco articoli
// e il browser Chromium di Playwright installato: `npx playwright install chromium`).
//
//   "build:seo": "vite build && node scripts/generate-sitemap.js && PRERENDER=1 node scripts/prerender.js"

import { preview } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const PORT = Number(process.env.PRERENDER_PORT || 4181);

if (process.env.PRERENDER !== '1') {
  console.log('[prerender] skip — set PRERENDER=1 per generare l\'HTML statico del blog.');
  process.exit(0);
}
if (!existsSync(resolve(process.cwd(), 'dist/index.html'))) {
  console.error('[prerender] dist/ non trovata — esegui prima `vite build`.');
  process.exit(1);
}

// Lingue del sito (deve restare allineato a src/i18n/langs.js).
// IT è la lingua di default e vive a root ('' = nessun prefisso).
const LANGS = ['it', 'en', 'es', 'de', 'pt', 'fr'];
const base = (lang) => (lang === 'it' ? '' : `/${lang}`);

// Pagine statiche localizzate in TUTTE le lingue (home, pagine info, aiuto).
const STATIC_ALL_LANGS = ['/', '/manifesto', '/come-funziona', '/per-noleggiatori', '/sicurezza', '/contatti', '/aiuto'];
// Pagine legali: contenuto reale solo IT + EN (le altre userebbero il fallback IT
// → non le prerenderizziamo nelle altre lingue per non creare duplicate content).
const STATIC_IT_EN = ['/privacy', '/termini', '/cookie'];
// Landing SEO città (route /auto-noleggio-:citta). Allineato a generate-sitemap.js.
const CITIES = ['milano', 'roma', 'napoli', 'torino', 'bologna', 'firenze', 'venezia', 'bari', 'palermo', 'catania'];

// path con prefisso lingua: IT a root; '/' → '/xx' (senza slash finale).
const withLang = (lang, path) => (path === '/' ? (base(lang) || '/') : `${base(lang)}${path}`);

// Per ogni lingua prerendiamo: home + pagine statiche + landing città + lista
// /blog e SOLO gli slug che hanno una versione pubblicata in quella lingua
// (per IT: tutti; per le altre: solo i tradotti). Così i crawler ricevono il
// contenuto reale tradotto, senza pagine /xx/... che sarebbero fallback IT.
async function collectRoutes() {
  const routes = [];
  const sb = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  for (const lang of LANGS) {
    for (const p of STATIC_ALL_LANGS) routes.push(withLang(lang, p));
    if (lang === 'it' || lang === 'en') for (const p of STATIC_IT_EN) routes.push(withLang(lang, p));
    for (const c of CITIES) routes.push(withLang(lang, `/auto-noleggio-${c}`));
    routes.push(`${base(lang)}/blog`);
    if (!sb) continue;
    try {
      const { data, error } = await sb
        .from('blog_articles')
        .select('slug')
        .eq('status', 'published')
        .eq('lang', lang)
        .limit(2000);
      if (error) throw error;
      for (const a of (data || [])) routes.push(`${base(lang)}/blog/${a.slug}`);
    } catch (e) {
      console.warn(`[prerender] elenco articoli (${lang}) non disponibile:`, e.message);
    }
  }
  return routes;
}

async function main() {
  const routes = await collectRoutes();
  const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'silent' });

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let ok = 0;
  for (const route of routes) {
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      // attende che la SPA sia montata (root con figli) — universale per ogni rotta
      await page.waitForFunction(() => document.querySelector('#root')?.children.length > 0, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(400);
      const html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
      // Output come file .html servito da nginx via `try_files $uri.html`. La home
      // ('/' o '/<lang>') va in index.html / <lang>.html.
      const outFile = resolve(process.cwd(), route === '/' ? 'dist/index.html' : 'dist' + route + '.html');
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, html);
      ok++;
      console.log('[prerender]', route, '→', route === '/' ? 'dist/index.html' : 'dist' + route + '.html');
    } catch (e) {
      console.warn('[prerender] errore su', route, '—', e.message);
    }
  }

  await browser.close();
  await server.close?.() ?? server.httpServer?.close();
  console.log(`[prerender] generate ${ok}/${routes.length} pagine.`);
}

main().catch(e => { console.error('[prerender]', e); process.exit(1); });
