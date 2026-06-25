// Genera dist/sitemap.xml dinamicamente fetchando auto/host attivi da Supabase.
// Si esegue dopo `vite build`. Si attiva solo se SITEMAP_FETCH=1 e le env Supabase sono presenti.
// Senza env, lascia il sitemap statico già copiato da public/.
//
// Esempio in Vercel: aggiungi un Vercel Cron o trigger via npm script:
//   "build": "vite build && node scripts/generate-sitemap.js"

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://moviq.it';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const OUTPUT = resolve(process.cwd(), 'dist/sitemap.xml');

if (process.env.SITEMAP_FETCH !== '1' || !SUPABASE_URL || !SUPABASE_KEY) {
  console.log('[sitemap] skip — set SITEMAP_FETCH=1 e Supabase env per generare dinamicamente.');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CITIES = ['milano', 'roma', 'napoli', 'torino', 'bologna', 'firenze', 'venezia', 'bari', 'palermo', 'catania'];
const CATEGORIES = ['citycar', 'suv', 'elettrica', 'cabrio', 'furgone'];

// Lingue del sito (allineato a src/i18n/langs.js). IT = default a root.
const LANGS = ['it', 'en', 'es', 'de', 'pt', 'fr'];
const DEFAULT_LANG = 'it';
// path con prefisso lingua: IT resta a root; '/' diventa '/xx' (senza slash finale).
const withLang = (lang, path) => (lang === DEFAULT_LANG ? path : `/${lang}${path === '/' ? '' : path}`);

async function fetchCarSlugs() {
  const { data, error } = await supabase
    .from('cars')
    .select('id, updated_at')
    .eq('status', 'active')
    .limit(5000);
  if (error) {
    console.warn('[sitemap] fetch cars error:', error.message);
    return [];
  }
  return data;
}

async function fetchBlogSlugs() {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('slug, lang, updated_at, cover_image_url')
    .eq('status', 'published')
    .limit(5000);
  if (error) {
    console.warn('[sitemap] fetch blog error:', error.message);
    return [];
  }
  // Raggruppa per slug: lingue disponibili + lastmod/cover.
  const bySlug = new Map();
  for (const r of (data || [])) {
    const cur = bySlug.get(r.slug) || { slug: r.slug, langs: [], updated_at: r.updated_at, cover_image_url: r.cover_image_url };
    cur.langs.push(r.lang);
    if (r.updated_at && (!cur.updated_at || r.updated_at > cur.updated_at)) cur.updated_at = r.updated_at;
    if (!cur.cover_image_url && r.cover_image_url) cur.cover_image_url = r.cover_image_url;
    bySlug.set(r.slug, cur);
  }
  // Ordina le lingue con IT primo, per output stabile.
  for (const v of bySlug.values()) v.langs = LANGS.filter(l => v.langs.includes(l));
  return [...bySlug.values()];
}

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function urlNode(loc, opts = {}) {
  const { lastmod, changefreq, priority, images, alternates } = opts;
  return [
    '  <url>',
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    ...(alternates || []).map(a => `    <xhtml:link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}"/>`),
    ...(images || []).filter(Boolean).map(u => `    <image:image><image:loc>${esc(u)}</image:loc></image:image>`),
    '  </url>',
  ].filter(Boolean).join('\n');
}

// Genera un blocco di <url> (uno per lingua) per un percorso neutro, con i
// rel="alternate" hreflang verso tutte le lingue disponibili + x-default (IT).
// `langs`: lingue in cui la pagina esiste davvero (default: tutte).
function localizedUrls(neutralPath, opts = {}, langs = LANGS) {
  const alternates = [
    ...langs.map(l => ({ hreflang: l, href: `${SITE_URL}${withLang(l, neutralPath)}` })),
    { hreflang: 'x-default', href: `${SITE_URL}${withLang(DEFAULT_LANG, neutralPath)}` },
  ];
  return langs.map(l => urlNode(`${SITE_URL}${withLang(l, neutralPath)}`, { ...opts, alternates }));
}

async function main() {
  const [cars, blog] = await Promise.all([fetchCarSlugs(), fetchBlogSlugs()]);

  const urls = [
    // Pagine localizzate in tutte le lingue → un <url> per lingua + hreflang.
    ...localizedUrls('/', { changefreq: 'weekly', priority: '1.0' }),
    ...localizedUrls('/cerca', { changefreq: 'daily', priority: '0.9' }),
    ...localizedUrls('/blog', { changefreq: 'weekly', priority: '0.8' }),
    ...localizedUrls('/aiuto', { changefreq: 'monthly', priority: '0.5' }),
    ...CITIES.flatMap(c => localizedUrls(`/auto-noleggio-${c}`, { priority: '0.8' })),
    // Categorie: query string, solo IT per non moltiplicare URL con parametri.
    ...CATEGORIES.map(c => urlNode(`${SITE_URL}/cerca?cat=${c}`, { priority: '0.7' })),
    // Articoli Magazine: un <url> per lingua effettivamente tradotta + hreflang.
    ...blog.flatMap(b => localizedUrls(`/blog/${b.slug}`, {
      lastmod: b.updated_at?.slice(0, 10),
      changefreq: 'monthly',
      priority: '0.7',
      images: b.cover_image_url ? [b.cover_image_url] : [],
    }, b.langs)),
    // Schede auto: dati di catalogo (IT), non tradotte → un solo URL.
    ...cars.map(car => urlNode(`${SITE_URL}/auto/${car.id}`, {
      lastmod: car.updated_at?.slice(0, 10),
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

  if (!existsSync(resolve(process.cwd(), 'dist'))) {
    console.error('[sitemap] dist/ not found — run vite build first');
    process.exit(1);
  }
  writeFileSync(OUTPUT, xml);
  console.log(`[sitemap] wrote ${OUTPUT} (${urls.length} URL)`);
}

main().catch(e => { console.error('[sitemap]', e); process.exit(1); });
