// POST /functions/v1/admin-ai
// Modulo AI admin: gestione chiavi cloud (Vault) + generazione articoli blog
// con Claude. Solo admin (profiles.is_admin). Le chiavi non escono MAI dalla
// funzione: si leggono dal Vault server-side e si usano per le chiamate API.
//
// Azioni:
//   { action: 'status' }                              → quali chiavi sono impostate + config
//   { action: 'set_key', name, value }                → salva una chiave in Vault
//   { action: 'delete_key', name }                    → rimuove una chiave
//   { action: 'test_key', name }                      → verifica che la chiave funzioni
//   { action: 'set_config', key, value }              → salva config non-segreta
//   { action: 'generate_article', topic, tone?, length? } → bozza articolo (Markdown)
//
// La bozza generata viene RESTITUITA alla UI, che la salva via
// admin_save_blog_article (col JWT admin) per impostare author_id e revisione.

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import { getServiceClient, getUserClient } from '../_shared/stripe.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';
const ALLOWED_KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'CAR_IMAGE_API_KEY'];
const MODELS = ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5-20251001'];

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('unauthorized');
  const client = getUserClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('unauthorized');
  const admin = getServiceClient();
  const { data: prof } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!prof?.is_admin) throw new Error('forbidden');
  return { user, admin };
}

async function anthropic(key: string, model: string, maxTokens: number, content: string) {
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content }] }),
  });
  return r;
}

// Genera un'immagine con OpenAI (DALL·E 3, 16:9 panoramico, ritorna base64).
async function openaiImage(key: string, prompt: string) {
  return await fetch(OPENAI_IMAGE_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'dall-e-3', prompt, size: '1792x1024', quality: 'hd', n: 1, response_format: 'b64_json' }),
  });
}

// Prompt copertina (fotografia editoriale 16:9 con zona testo sfumata).
function coverPrompt(title: string) {
  return `Crea un'immagine di copertina per un articolo blog intitolato:

"${title}"

L'immagine deve rappresentare in modo immediato e concreto il tema espresso dal titolo. La scena, i soggetti, gli oggetti e l'ambientazione devono essere strettamente collegati all'argomento dell'articolo, senza elementi generici o puramente decorativi.

Stile visivo:
- fotografia editoriale contemporanea;
- resa fotorealistica, pulita e credibile;
- composizione professionale da copertina blog;
- luce naturale o cinematografica, coerente con il soggetto;
- colori equilibrati e realistici;
- nessuna illustrazione, nessun collage e nessun effetto 3D artificiale.

Lo sfondo deve avere una transizione morbida e naturale: una parte dell'immagine deve risultare opaca, sfumata e leggermente desaturata, mentre l'altra parte deve diventare progressivamente più nitida e fotorealistica. Il passaggio non deve sembrare una divisione netta, ma una fusione graduale tra area grafica e scena fotografica.

La zona opaca deve lasciare spazio libero e leggibile per il titolo. Inserisci pochissimo testo: usa esclusivamente una headline molto breve, composta da un massimo di 3-5 parole, ricavata dal titolo dell'articolo. Non inserire sottotitoli, paragrafi, numeri, elenchi, etichette, didascalie o call to action.

Il testo deve essere:
- grande e immediatamente leggibile;
- scritto con un carattere sans serif moderno e deciso;
- posizionato nella zona più opaca dell'immagine;
- perfettamente integrato nella composizione;
- senza effetti vistosi, ombre pesanti o contorni decorativi.

Non creare infografiche. Non inserire grafici, diagrammi, icone informative, frecce, schemi, confronti visivi, tabelle, percentuali o sequenze numerate.

La composizione deve avere un solo soggetto visivo principale e pochi elementi secondari. Evita immagini affollate, stock photo generiche, pose artificiali e oggetti non collegati al titolo.

Formato orizzontale panoramico, rapporto 16:9, adatto alla copertina di un articolo blog. Mantieni il soggetto principale su un lato e l'area opaca destinata al testo sul lato opposto.`;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { admin } = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    // ── stato chiavi + config (non rivela i valori) ──
    if (action === 'status') {
      const keys: Record<string, boolean> = {};
      for (const n of ALLOWED_KEYS) {
        // Verifica presenza leggendo dal Vault col service_role (ai_secret_status
        // richiede is_admin(), che è false per il service_role → falso negativo).
        // Il valore resta server-side: alla UI mandiamo solo il booleano.
        const { data, error } = await admin.rpc('ai_read_secret', { p_name: n });
        if (error) console.error('[admin-ai] status read error', n, error.message);
        keys[n] = !!data;
      }
      const { data: cfg } = await admin.from('admin_ai_config').select('key, value');
      const config: Record<string, unknown> = {};
      for (const r of (cfg || [])) config[r.key] = r.value;
      return jsonResponse({ keys, config, models: MODELS });
    }

    // ── salva una chiave nel Vault ──
    if (action === 'set_key') {
      const name = String(body.name || '');
      const value = String(body.value || '');
      if (!ALLOWED_KEYS.includes(name)) return jsonResponse({ error: 'chiave non consentita' }, 400);
      if (value.length < 8) return jsonResponse({ error: 'valore chiave non valido' }, 400);
      const { error } = await admin.rpc('ai_store_secret', { p_name: name, p_value: value });
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    // ── rimuovi una chiave ──
    if (action === 'delete_key') {
      const name = String(body.name || '');
      if (!ALLOWED_KEYS.includes(name)) return jsonResponse({ error: 'chiave non consentita' }, 400);
      const { error } = await admin.rpc('ai_delete_secret', { p_name: name });
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    // ── config non-segreta (es. modello) ──
    if (action === 'set_config') {
      const key = String(body.key || '');
      if (!key) return jsonResponse({ error: 'key richiesta' }, 400);
      const { error } = await admin.from('admin_ai_config')
        .upsert({ key, value: body.value ?? {}, updated_at: new Date().toISOString() });
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    // ── test chiave ──
    if (action === 'test_key') {
      const name = String(body.name || '');
      const { data: key } = await admin.rpc('ai_read_secret', { p_name: name });
      if (!key) return jsonResponse({ ok: false, error: 'chiave non impostata' });
      if (name === 'ANTHROPIC_API_KEY') {
        const r = await anthropic(key, 'claude-haiku-4-5-20251001', 8, 'Rispondi solo: ok');
        return jsonResponse({ ok: r.ok, status: r.status });
      }
      if (name === 'OPENAI_API_KEY') {
        // Verifica gratuita: lista modelli (non genera immagini).
        const r = await fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': `Bearer ${key}` } });
        return jsonResponse({ ok: r.ok, status: r.status });
      }
      return jsonResponse({ ok: true, note: 'presenza verificata (nessun test attivo per questa chiave)' });
    }

    // ── genera bozza articolo con Claude ──
    if (action === 'generate_article') {
      const topic = String(body.topic || '').trim();
      if (!topic) return jsonResponse({ error: 'argomento richiesto' }, 400);
      const tone = String(body.tone || 'informativo e amichevole');
      const length = String(body.length || 'medio (700-1000 parole)');

      const { data: key } = await admin.rpc('ai_read_secret', { p_name: 'ANTHROPIC_API_KEY' });
      if (!key) return jsonResponse({ error: 'Chiave Anthropic non configurata. Inseriscila nel modulo AI.' }, 400);

      const { data: cfgRow } = await admin.from('admin_ai_config').select('value').eq('key', 'model').maybeSingle();
      const model = (cfgRow?.value as { article?: string } | null)?.article || 'claude-sonnet-4-6';

      const prompt = `Sei un copywriter SEO per MoviQ, marketplace italiano di noleggio auto tra autonoleggi indipendenti e clienti (paghi direttamente il noleggiatore, niente commissioni nascoste).

Scrivi un articolo di blog in ITALIANO sull'argomento: "${topic}".
Tono: ${tone}. Lunghezza: ${length}.
Requisiti: utile e concreto (consigli pratici), ottimizzato SEO ma naturale, struttura con sottotitoli (## in Markdown), niente promesse legali/garanzie non verificabili, niente prezzi inventati. Cita MoviQ con naturalezza dove pertinente.

IMPORTANTE — link interni (SEO): inserisci nel corpo, in modo NATURALE e contestuale, 2-3 link Markdown a percorsi RELATIVI del sito MoviQ scegliendo tra questi (NON inventarne altri):
- [cerca un'auto](/cerca)
- pagine città quando pertinenti, es. [noleggio a Milano](/auto-noleggio-milano), [noleggio a Roma](/auto-noleggio-roma), [Napoli](/auto-noleggio-napoli), [Torino](/auto-noleggio-torino), [Firenze](/auto-noleggio-firenze), [Bologna](/auto-noleggio-bologna)
- [come funziona MoviQ](/come-funziona)
- per i noleggiatori: [pubblica la tua flotta](/benvenuti)
Usa solo i link davvero pertinenti all'argomento; non forzarli.

FORMATTAZIONE del corpo (IMPORTANTISSIMO): restituisci HTML PULITO, NON Markdown. Niente simboli #, *, _, niente backtick. Usa SOLO questi tag:
- <h2> per i titoli di sezione, <h3> per eventuali sottosezioni (NIENTE <h1>: il titolo è a parte)
- <p> per i paragrafi (prosa continua, non andare a capo a ogni frase; ogni concetto un paragrafo)
- <strong> per il grassetto, <em> per il corsivo (con parsimonia)
- <ul>/<ol> con <li> SOLO quando elencano informazioni parallele; ogni <li> è una frase completa con iniziale maiuscola e punto finale
- <a href="..."> con testo descrittivo (mai "clicca qui"); per i link interni usa percorsi relativi
Niente attributi di stile, niente classi, niente <div>/<span>. Spaziatura pulita: nessun doppio spazio, nessuna riga vuota multipla.

Rispondi ESATTAMENTE in questo formato a blocchi (nessun altro testo prima o dopo, NIENTE JSON, niente \`\`\`):
TITOLO: <titolo accattivante meno di 70 caratteri>
SLUG: <slug-url-minuscolo-con-trattini>
ESTRATTO: <riassunto 1-2 frasi per la card e i risultati Google>
META: <meta description SEO circa 155 caratteri>
TAG: <da 3 a 5 tag minuscoli separati da virgola>
===CONTENUTO===
<corpo dell'articolo in HTML pulito (h2,h3,p,strong,em,ul,ol,li,a) — NIENTE Markdown, NIENTE \`\`\`>

I primi cinque campi su UNA riga ciascuno. Tutto ciò che segue ===CONTENUTO=== è il corpo HTML.`;

      const r = await anthropic(key, model, 8192, prompt);
      if (!r.ok) {
        const t = await r.text();
        console.error('[admin-ai] anthropic error', r.status, t.slice(0, 800));
        // Propaga un messaggio più utile (status + dettaglio breve) per il debug.
        let detail = '';
        try { detail = (JSON.parse(t)?.error?.message as string) || ''; } catch { detail = t.slice(0, 200); }
        return jsonResponse({ error: `Errore dal modello AI (${r.status}). ${detail}`.trim() }, 502);
      }
      const j = await r.json();
      const text: string = j?.content?.[0]?.text || '';
      const stopReason: string = j?.stop_reason || '';

      // Parsing a blocchi (NO JSON): i metadati sono righe "CHIAVE: valore",
      // il corpo è tutto ciò che segue ===CONTENUTO===. Così l'HTML può contenere
      // virgolette/parentesi senza rompere nulla.
      const marker = '===CONTENUTO===';
      const mi = text.indexOf(marker);
      const head = mi >= 0 ? text.slice(0, mi) : text;
      let contentHtml = (mi >= 0 ? text.slice(mi + marker.length) : '').trim();
      // toglie eventuali fence ```html ... ```
      contentHtml = contentHtml.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();

      const field = (re: RegExp) => { const m = head.match(re); return m ? m[1].trim() : ''; };
      const title = field(/TITOLO:\s*(.+)/i);
      const tagsLine = field(/TAG:\s*(.+)/i);
      const article = {
        title,
        slug: field(/SLUG:\s*(.+)/i),
        excerpt: field(/ESTRATTO:\s*(.+)/i),
        meta_description: field(/META:\s*(.+)/i),
        tags: tagsLine ? tagsLine.split(',').map((t) => t.trim()).filter(Boolean) : [],
        content_html: contentHtml,
      };

      if (!title || !contentHtml) {
        const hint = stopReason === 'max_tokens' ? ' (risposta troncata: riprova)' : '';
        console.error('[admin-ai] parse fail, stop_reason=', stopReason, 'text=', text.slice(0, 400));
        return jsonResponse({ error: `Risposta AI incompleta${hint}. Riprova.` }, 502);
      }
      return jsonResponse({ article, model });
    }

    // ── genera banner copertina con OpenAI (gpt-image-1) ──
    if (action === 'generate_image') {
      const topic = String(body.topic || '').trim();
      if (!topic) return jsonResponse({ error: 'argomento/titolo richiesto' }, 400);

      const { data: key } = await admin.rpc('ai_read_secret', { p_name: 'OPENAI_API_KEY' });
      if (!key) return jsonResponse({ error: 'Chiave OpenAI non configurata. Inseriscila nel modulo AI.' }, 400);

      const r = await openaiImage(key, coverPrompt(topic));
      if (!r.ok) {
        const t = await r.text();
        console.error('[admin-ai] openai image error', r.status, t.slice(0, 800));
        let detail = '';
        try { detail = (JSON.parse(t)?.error?.message as string) || ''; } catch { detail = t.slice(0, 200); }
        return jsonResponse({ error: `Errore generazione immagine (${r.status}). ${detail}`.trim() }, 502);
      }
      const j = await r.json();
      const b64: string = j?.data?.[0]?.b64_json || '';
      if (!b64) return jsonResponse({ error: 'Nessuna immagine restituita da OpenAI.' }, 502);
      return jsonResponse({ b64, model: 'gpt-image-1' });
    }

    return jsonResponse({ error: 'azione sconosciuta' }, 400);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'unauthorized') return jsonResponse({ error: msg }, 401);
    if (msg === 'forbidden') return jsonResponse({ error: msg }, 403);
    return internalError('admin-ai', err);
  }
});
