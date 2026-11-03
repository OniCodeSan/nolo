// POST /functions/v1/magazine-webhook — canale Webhook di R-Pie.
// Guida: https://rpie-test-0315d086.vercel.app/docs/webhook
//
// R-Pie pubblica sul magazine (solo italiano) con richieste firmate:
//   X-RPie-Signature: t=<unix>,v1=<hmac>[,v1=<hmac chiave precedente>]
//   X-RPie-Event:     ping | article.publish
//   X-RPie-Delivery:  id della consegna, uguale in tutti i tentativi
// Risposte: 200 { id, url } pubblicato · 401 firma non valida o vecchia (R-Pie
// disattiva il canale) · 4xx errore definitivo · 5xx R-Pie riprova (max 5).
//
// Crea e modifica soltanto: action=update trova l'articolo da target_url e
// tocca solo articoli nati da R-Pie (external_id "rpie:<delivery>"), mai quelli
// dell'admin. Lo slug di un articolo esistente non cambia. L'immagine viene
// copiata su Cloudinary (l'URL di R-Pie scade). Le faq finiscono in coda al
// testo. Logica SQL: supabase/magazine-webhook.sql. Log: supabase/admin-logs.sql
// (/admin/log), senza il testo degli articoli.
//
// Deploy:  supabase functions deploy magazine-webhook --project-ref togcwgymwrnhiihduapb
// Secret:  supabase secrets set RPIE_WEBHOOK_SECRET=whsec_… \
//            CLOUDINARY_CLOUD_NAME=… CLOUDINARY_UPLOAD_PRESET=…

import { jsonResponse } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/stripe.ts';
import { safeEqual } from '../_shared/security.ts';

const SECRET = Deno.env.get('RPIE_WEBHOOK_SECRET') ?? '';
const CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME') ?? '';
const UPLOAD_PRESET = Deno.env.get('CLOUDINARY_UPLOAD_PRESET') ?? '';
const SITE_URL = 'https://moviq.it';
const TOLERANCE_S = 300;
const MAX_BODY_BYTES = 1_000_000;
const SLUG_ATTEMPTS = 5;

type Obj = Record<string, unknown>;

type LogEntry = {
  event?: string | null;
  delivery_id?: string | null;
  articles?: number;
  failed?: number;
  error?: string | null;
  items?: Obj[] | null;
};

const enc = new TextEncoder();

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
  return Array.from(sig, b => b.toString(16).padStart(2, '0')).join('');
}

// null = firma valida, altrimenti il motivo del rifiuto (per il log).
async function signatureError(header: string, raw: string): Promise<string | null> {
  if (!SECRET) return 'RPIE_WEBHOOK_SECRET non configurata';
  let t = NaN;
  const sigs: string[] = [];
  for (const part of header.split(',')) {
    const [k, v] = part.trim().split('=');
    if (k === 't') t = Number(v);
    if (k === 'v1' && v) sigs.push(v);
  }
  if (!Number.isInteger(t) || !sigs.length) return 'firma mancante';
  if (Math.abs(Date.now() / 1000 - t) > TOLERANCE_S) return 'firma scaduta (oltre 5 minuti)';
  const expected = await hmacHex(SECRET, `${t}.${raw}`);
  for (const s of sigs) if (await safeEqual(s, expected)) return null;
  return 'firma non valida';
}

// Risponde a R-Pie e registra la chiamata. Un errore del log non deve mai
// cambiare la risposta.
async function respond(req: Request, status: number, body: Obj, log: LogEntry = {}) {
  try {
    const { error } = await getServiceClient().from('magazine_webhook_log').insert({
      http_status: status,
      ok: status === 200,
      event: log.event ?? null,
      delivery_id: log.delivery_id ?? null,
      articles: log.articles ?? 0,
      failed: log.failed ?? 0,
      error: log.error ?? null,
      items: log.items ?? null,
      ip: (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null,
      user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
    });
    if (error) console.error('[magazine-webhook] log', error);
  } catch (err) {
    console.error('[magazine-webhook] log', err);
  }
  return jsonResponse(body, status);
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() !== '' ? v : null);

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function faqHtml(faq: unknown): string {
  if (!Array.isArray(faq)) return '';
  const items = faq
    .map(f => (f ?? {}) as Obj)
    .filter(f => str(f.question) && str(f.answer))
    .map(f => `<h3>${escapeHtml(String(f.question))}</h3>\n<p>${escapeHtml(String(f.answer))}</p>`);
  return items.length ? `\n<h2>Domande frequenti</h2>\n${items.join('\n')}` : '';
}

// Ultimo pezzo del percorso: /magazine/<slug>, /en/magazine/<slug>, /blog/<slug>.
function slugFromUrl(u: string): string | null {
  try {
    const parts = new URL(u).pathname.split('/').filter(Boolean);
    return parts.length ? decodeURIComponent(parts[parts.length - 1]) : null;
  } catch {
    return null;
  }
}

// Copia l'immagine su Cloudinary (che la scarica dall'URL di R-Pie).
async function storeImage(url: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary non configurato');
  const fd = new FormData();
  fd.append('file', url);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'noleggio/blog');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({})) as Obj;
  if (!res.ok || !str(json.secure_url)) {
    throw new Error(`upload immagine fallito: ${(json.error as Obj)?.message ?? `HTTP ${res.status}`}`);
  }
  return json.secure_url as string;
}

const articleUrl = (slug: string) => `${SITE_URL}/magazine/${slug}`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  // La firma si verifica sul corpo GREZZO, prima di decodificare il JSON.
  const raw = await req.text();
  const base: LogEntry = { event: req.headers.get('x-rpie-event'), delivery_id: req.headers.get('x-rpie-delivery') };

  if (enc.encode(raw).length > MAX_BODY_BYTES) {
    return respond(req, 413, { error: 'richiesta troppo grande' }, { ...base, error: 'oltre 1 MB' });
  }
  const sigErr = await signatureError(req.headers.get('x-rpie-signature') ?? '', raw);
  if (sigErr) return respond(req, 401, { error: 'firma non valida' }, { ...base, error: sigErr });

  let body: Obj;
  try { body = JSON.parse(raw); }
  catch { return respond(req, 400, { error: 'invalid json' }, { ...base, error: 'JSON non valido' }); }

  const event = base.event ?? str(body.event);
  const deliveryId = base.delivery_id ?? str(body.delivery_id);
  const logBase: LogEntry = { event, delivery_id: deliveryId };

  if (event === 'ping') return respond(req, 200, { ok: true }, logBase);
  if (event !== 'article.publish') {
    return respond(req, 400, { error: 'evento sconosciuto' }, { ...logBase, error: `evento sconosciuto: ${event ?? '—'}` });
  }

  const a = (body.article ?? {}) as Obj;
  const title = str(a.title);
  const isUpdate = a.action === 'update';
  const item: Obj = { type: 'article', title, action: isUpdate ? 'update' : 'create' };
  const done = (status: number, out: Obj, it: Obj, error: string | null = null) =>
    respond(req, status, out, { ...logBase, articles: 1, failed: error ? 1 : 0, error, items: [{ ...item, ...it, ok: !error, error }] });
  const fail = (status: number, error: string, out: Obj = { error }) => done(status, out, {}, error);

  if (!deliveryId) return fail(400, 'X-RPie-Delivery mancante');
  if (str(a.language) && a.language !== 'it') return fail(422, `lingua non supportata: ${a.language} (solo it)`);

  try {
    const db = getServiceClient();
    let externalId: string;
    let slugs: (string | null)[];

    if (isUpdate) {
      const target = str(a.target_url);
      const targetSlug = target && slugFromUrl(target);
      if (!targetSlug) return fail(422, 'target_url mancante o non valido');
      const { data: row, error } = await db.from('blog_articles')
        .select('external_id').eq('slug', targetSlug).eq('lang', 'it').maybeSingle();
      if (error) throw error;
      if (!row) return fail(422, `articolo da aggiornare non trovato: ${targetSlug}`);
      if (!row.external_id) return fail(422, 'articolo creato dall\'admin: R-Pie non può modificarlo');
      externalId = row.external_id;
      slugs = [null];   // lo slug di un articolo pubblicato non cambia
    } else {
      externalId = `rpie:${deliveryId}`;
      // Stessa consegna ricevuta di nuovo: stessa risposta, nessun doppione.
      const { data: prev, error } = await db.from('blog_articles')
        .select('id, slug').eq('external_id', externalId).eq('lang', 'it').maybeSingle();
      if (error) throw error;
      if (prev) return done(200, { id: prev.id, url: articleUrl(prev.slug) }, { slug: prev.slug, action: 'duplicate' });
      // Lo slug di R-Pie è un suggerimento: se è occupato aggiungiamo -2, -3, …
      const s = str(a.slug) ?? title ?? '';
      slugs = Array.from({ length: SLUG_ATTEMPTS }, (_, i) => (i ? `${s}-${i + 1}` : s));
    }

    const image = (a.featured_image ?? null) as Obj | null;
    const cover = image && str(image.url) ? await storeImage(image.url as string) : null;
    const html = str(a.content_html);

    for (const [i, slug] of slugs.entries()) {
      const { data, error } = await db.rpc('webhook_upsert_blog_article', {
        p_external_id: externalId,
        p_title: title,
        p_content: html ? html + faqHtml(a.faq) : null,
        p_slug: slug,
        p_excerpt: str(a.excerpt),
        p_cover_image_url: cover,
        p_tags: null,
        p_category: null,
        p_status: a.status === 'draft' ? 'draft' : 'published',
        p_meta_title: str(a.meta_title),
        p_meta_description: str(a.meta_description),
      });
      if (error?.code === '23505' && i < slugs.length - 1) continue;
      if (error?.code === '22023' || error?.code === '23505') return fail(422, error.message);
      if (error) throw error;
      return done(200, { id: data.id, url: articleUrl(data.slug) }, { slug: data.slug, action: data.action, status: data.status });
    }
    return fail(422, 'slug non disponibile');
  } catch (err) {
    // 5xx: R-Pie riprova più tardi con lo stesso X-RPie-Delivery.
    console.error('[magazine-webhook]', err);
    const msg = err instanceof Error ? err.message : (err as Obj)?.message as string ?? 'errore interno';
    return fail(500, msg, { error: 'salvataggio non riuscito' });
  }
});
