// POST /functions/v1/magazine-webhook
// Riceve dal tool AI di contenuti articoli e categorie del magazine e li
// crea/modifica (solo italiano). Non elimina né archivia nulla, e non tocca
// gli articoli creati dall'admin. Logica in SQL: supabase/magazine-webhook.sql.
//
// Deploy:  supabase functions deploy magazine-webhook --project-ref togcwgymwrnhiihduapb
// Secret:  supabase secrets set MAGAZINE_WEBHOOK_SECRET=<token lungo casuale>
// Auth:    header `Authorization: Bearer <secret>` oppure `X-Webhook-Secret: <secret>`
//
// Payload accettati (JSON):
//   { "articles": [ {...}, ... ], "categories": [ {...}, ... ] }
//   { "data": { "articles": [...] } }           (formato "event + data")
//   { "title": ..., "content_html": ... }        (articolo singolo)
// Articolo: id|external_id, title, slug, content_html|content_markdown|content_md|content,
//   excerpt|summary, cover_image_url|image_url|featured_image, tags (array o "a, b"),
//   category (nome o slug, creata se non esiste), status (draft|published, default published),
//   meta_title|seo_title, meta_description|seo_description.
// Categoria: { name, slug?, description? } oppure semplicemente "Nome".

import { jsonResponse } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/stripe.ts';
import { safeEqual } from '../_shared/security.ts';

const WEBHOOK_SECRET = Deno.env.get('MAGAZINE_WEBHOOK_SECRET') ?? '';
const SITE_URL = 'https://moviq.it';
const MAX_ITEMS = 50;
const MAX_CONTENT_CHARS = 300_000;

type Obj = Record<string, unknown>;

// Primo valore stringa non vuoto tra le chiavi alias. undefined = non inviato.
function pick(o: Obj, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim() !== '') return v;
    if (typeof v === 'number') return String(v);
  }
  return undefined;
}

function toTags(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.map(t => String(typeof t === 'object' && t ? (t as Obj).name ?? '' : t).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map(t => t.trim()).filter(Boolean);
  return undefined;
}

function toCategory(a: Obj): string | undefined {
  const c = a.category ?? a.category_slug ?? a.category_name;
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object') return pick(c as Obj, 'name', 'slug');
  return undefined;
}

function toStatus(a: Obj): string | undefined {
  if (typeof a.published === 'boolean') return a.published ? 'published' : 'draft';
  const s = pick(a, 'status')?.toLowerCase();
  if (s === 'publish' || s === 'live') return 'published';
  return s;
}

// Errori di validazione sollevati dalle nostre RPC (22023/23505): il messaggio
// è nostro e utile al tool. Tutto il resto resta nei log.
function rpcError(scope: string, err: { code?: string; message?: string }) {
  if (err.code === '22023' || err.code === '23505') {
    return { error: err.message ?? 'richiesta non valida', conflict: err.code === '23505' };
  }
  console.error(`[magazine-webhook] ${scope}`, err);
  return { error: 'errore interno' };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const provided = req.headers.get('x-webhook-secret') ?? bearer;
  if (!WEBHOOK_SECRET || !(await safeEqual(provided, WEBHOOK_SECRET))) {
    return jsonResponse({ error: 'forbidden' }, 403);
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return jsonResponse({ error: 'invalid json' }, 400); }

  const root = (body && typeof body === 'object' && !Array.isArray(body) && (body as Obj).data && typeof (body as Obj).data === 'object')
    ? (body as Obj).data as Obj | Obj[]
    : body as Obj | Obj[];

  let articles: Obj[] = [];
  let categories: unknown[] = [];
  if (Array.isArray(root)) articles = root as Obj[];
  else if (root && typeof root === 'object') {
    if (Array.isArray(root.articles)) articles = root.articles as Obj[];
    else if (root.article && typeof root.article === 'object') articles = [root.article as Obj];
    else if (pick(root, 'title')) articles = [root];
    if (Array.isArray(root.categories)) categories = root.categories;
  }

  // Ping/test dal tool in fase di configurazione: nessun contenuto → ok.
  if (!articles.length && !categories.length) {
    return jsonResponse({ ok: true, message: 'nessun articolo o categoria nel payload' });
  }
  if (articles.length + categories.length > MAX_ITEMS) {
    return jsonResponse({ error: `massimo ${MAX_ITEMS} elementi per richiesta` }, 413);
  }

  const db = getServiceClient();
  const results: { categories: Obj[]; articles: Obj[] } = { categories: [], articles: [] };

  for (const raw of categories) {
    const c: Obj = typeof raw === 'string' ? { name: raw } : (raw as Obj) ?? {};
    const { data, error } = await db.rpc('webhook_upsert_blog_category', {
      p_name: pick(c, 'name') ?? null,
      p_slug: pick(c, 'slug') ?? null,
      p_description: pick(c, 'description') ?? null,
    });
    results.categories.push(error
      ? { ok: false, name: c.name ?? null, ...rpcError('category', error) }
      : { ok: true, id: data.id, slug: data.slug, name: data.name });
  }

  for (const a of articles) {
    const externalId = pick(a, 'external_id', 'id');
    const content = pick(a, 'content_html', 'html', 'content_md', 'content_markdown', 'markdown', 'content', 'body');
    if (content && content.length > MAX_CONTENT_CHARS) {
      results.articles.push({ ok: false, external_id: externalId ?? null, error: 'contenuto troppo lungo' });
      continue;
    }
    const { data, error } = await db.rpc('webhook_upsert_blog_article', {
      p_external_id: externalId ?? null,
      p_title: pick(a, 'title') ?? null,
      p_content: content ?? null,
      p_slug: pick(a, 'slug') ?? null,
      p_excerpt: pick(a, 'excerpt', 'summary', 'description') ?? null,
      p_cover_image_url: pick(a, 'cover_image_url', 'image_url', 'featured_image', 'image') ?? null,
      p_tags: toTags(a.tags) ?? null,
      p_category: toCategory(a) ?? null,
      p_status: toStatus(a) ?? null,
      p_meta_title: pick(a, 'meta_title', 'seo_title') ?? null,
      p_meta_description: pick(a, 'meta_description', 'seo_description') ?? null,
    });
    results.articles.push(error
      ? { ok: false, external_id: externalId ?? null, ...rpcError('article', error) }
      : { ok: true, external_id: externalId ?? data.slug, ...data, url: `${SITE_URL}/blog/${data.slug}` });
  }

  const all = [...results.categories, ...results.articles];
  const failed = all.filter(r => !r.ok);
  const status = !failed.length ? 200 : failed.every(r => r.conflict) ? 409 : 422;
  return jsonResponse({ ok: !failed.length, ...results }, status);
});
