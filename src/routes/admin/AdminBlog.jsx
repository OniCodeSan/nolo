import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminListBlogArticles, adminSaveBlogArticle, adminDeleteBlogArticle, BLOG_STATUSES } from '../../services/blog.js';
import { aiGenerateArticle, aiGenerateImage } from '../../services/ai.js';
import { uploadImage, validateImageFile, cldUrl, hasCloudinary } from '../../lib/cloudinary.js';
import { RichEditor } from '../../components/RichEditor.jsx';
import { toEditorHtml } from '../../lib/contentHtml.js';
import { useToast } from '../../state/ToastContext.jsx';
import { H, Txt, Button, Badge } from '../../components/ui.jsx';

const EMPTY = {
  id: null, slug: '', title: '', excerpt: '', contentMd: '', coverImageUrl: '',
  tags: '', status: 'draft', metaTitle: '', metaDescription: '',
};

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function inputStyle(T) {
  return {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.sm,
    fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
  };
}
function labelStyle(T) {
  return { fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 };
}

export function AdminBlog() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [articles, setArticles] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const PER_PAGE = 9;
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [aiTopics, setAiTopics] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiProgress, setAiProgress] = useState(null); // { done, total, current }
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef(null);

  // Carica un file su Cloudinary (cartella noleggio/blog) e ritorna l'URL
  // ottimizzato (f_auto, q_auto). Riusa l'infrastruttura immagini esistente.
  const upload = async (file, width) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return null; }
    setUploading(true);
    try {
      const res = await uploadImage(file, { folder: 'noleggio/blog' });
      return cldUrl(res.public_id, { w: width }) || res.url;
    } catch (e) { toast.error(e.message); return null; }
    finally { setUploading(false); }
  };

  const onCoverFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    const url = await upload(file, 1200);
    if (url) { setForm(f => ({ ...f, coverImageUrl: url })); toast.success('Copertina caricata.'); }
  };

  // Genera la copertina con OpenAI (banner dal titolo/topic) → Cloudinary → cover.
  const onGenerateCover = async () => {
    const topic = (form.title || '').trim();
    if (!topic) { toast.error('Scrivi prima il titolo: la copertina si genera da quello.'); return; }
    setUploading(true);
    try {
      const { b64 } = await aiGenerateImage({ topic });
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const blob = new Blob([arr], { type: 'image/png' });
      const res = await uploadImage(blob, { folder: 'noleggio/blog' });
      const url = cldUrl(res.public_id, { w: 1200 }) || res.url;
      setForm(f => ({ ...f, coverImageUrl: url }));
      toast.success('Copertina generata.');
    } catch (e) { toast.error(e.message); }
    finally { setUploading(false); }
  };


  const refresh = () => {
    adminListBlogArticles({ status: filter === 'all' ? null : filter })
      .then(setArticles)
      .catch(e => toast.error(e.message));
  };
  useEffect(() => { refresh(); setPage(0); }, [filter]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const editing = !!form.id;

  const onTitle = (v) => setForm(f => ({
    ...f, title: v,
    slug: (!f.id && (!f.slug || f.slug === slugify(f.title))) ? slugify(v) : f.slug,
  }));

  const reset = () => setForm(EMPTY);

  // Genera in sequenza un articolo per ogni riga (topic) e lo salva come BOZZA.
  // Uno alla volta: ogni bozza pronta compare subito nella lista.
  const onGenerateBatch = async () => {
    const topics = aiTopics.split('\n').map(t => t.trim()).filter(Boolean);
    if (!topics.length) { toast.error('Inserisci almeno un argomento (uno per riga).'); return; }
    setAiBusy(true);
    let ok = 0;
    for (let i = 0; i < topics.length; i++) {
      setAiProgress({ done: i, total: topics.length, current: topics[i] });
      try {
        const a = await aiGenerateArticle({ topic: topics[i] });
        await adminSaveBlogArticle({
          id: null,
          slug: a.slug || slugify(a.title || topics[i]),
          title: a.title || topics[i],
          excerpt: a.excerpt || '',
          contentMd: a.content_html || a.content_md || '',
          coverImageUrl: '',
          tags: Array.isArray(a.tags) ? a.tags : (a.tags ? String(a.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
          status: 'draft',
          metaDescription: a.meta_description || '',
          aiGenerated: true,
        });
        ok++;
        refresh();
      } catch (e) {
        toast.error(`"${topics[i].slice(0, 40)}": ${e.message}`);
      }
    }
    setAiProgress(null);
    setAiBusy(false);
    setAiTopics('');
    toast.success(`${ok}/${topics.length} bozze create. Rivedile e pubblicale dalla lista.`);
    refresh();
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) { toast.error('Titolo e slug sono obbligatori.'); return; }
    setBusy(true);
    try {
      await adminSaveBlogArticle({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast.success(editing ? 'Articolo aggiornato.' : 'Articolo creato.');
      reset();
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  const onEdit = (a) => {
    setForm({
      id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt || '',
      contentMd: toEditorHtml(a.content_md || ''), coverImageUrl: a.cover_image_url || '',
      tags: (a.tags || []).join(', '), status: a.status,
      metaTitle: a.meta_title || '', metaDescription: a.meta_description || '',
    });
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (a) => {
    if (!window.confirm(`Eliminare definitivamente "${a.title}"?`)) return;
    try {
      await adminDeleteBlogArticle(a.id);
      toast.success('Articolo eliminato.');
      if (form.id === a.id) reset();
      refresh();
    } catch (err) { toast.error(err.message); }
  };

  const statusTone = (s) => BLOG_STATUSES.find(x => x.id === s)?.tone || 'neutral';
  const statusLabel = (s) => BLOG_STATUSES.find(x => x.id === s)?.l || s;

  const totalPages = Math.max(1, Math.ceil((articles?.length || 0) / PER_PAGE));
  const curPage = Math.min(page, totalPages - 1);

  return (
    <div style={{ padding: isDesktop ? '28px 32px 60px' : '18px 16px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 4 }}>Magazine</H>
      <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', marginBottom: 20 }}>Scrivi, modifica e pubblica gli articoli del magazine MoviQ.</Txt>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0, 2fr) minmax(0, 1fr)' : '1fr', gap: 22 }}>
        {/* ─── Editor (2/3) ─── */}
        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 18, height: 'fit-content' }}>
          <H T={T} size="h4">{editing ? 'Modifica articolo' : 'Nuovo articolo'}</H>

          {!editing && (
            <div style={{ padding: 12, background: T.surfaceAlt, border: `1px dashed ${T.line}`, borderRadius: T.r.md, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Txt T={T} size={12} weight={600} color={T.ink2}>✨ Genera bozze con AI (Claude)</Txt>
              <textarea
                value={aiTopics}
                onChange={e => setAiTopics(e.target.value)}
                disabled={aiBusy}
                rows={4}
                placeholder={'Un argomento per riga, es.\nconsigli per noleggiare a Roma\ncome scegliere un SUV a noleggio\nnoleggio a lungo termine: conviene?'}
                style={{ ...inputStyle(T), resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button T={T} variant="accent" size="md" onClick={onGenerateBatch} disabled={aiBusy} type="button">
                  {aiBusy ? 'Genero…' : 'Genera bozze'}
                </Button>
                {aiProgress && (
                  <Txt T={T} size={12} color={T.ink2}>
                    {aiProgress.done + 1}/{aiProgress.total} — {aiProgress.current.slice(0, 38)}…
                  </Txt>
                )}
              </div>
              <Txt T={T} size={11} color={T.ink3}>Ogni riga viene sviluppata <strong>una alla volta</strong> e salvata come <strong>bozza</strong>. Poi rivedi e pubblica dalla lista a destra. Richiede la chiave Anthropic nel modulo <strong>AI</strong>.</Txt>
            </div>
          )}

          <label>
            <span style={labelStyle(T)}>Titolo</span>
            <input value={form.title} onChange={e => onTitle(e.target.value)} placeholder="Es. 10 consigli per noleggiare a Milano" style={inputStyle(T)} />
          </label>
          <label>
            <span style={labelStyle(T)}>Slug (URL)</span>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="consigli-noleggio-milano" style={inputStyle(T)} />
          </label>
          <label>
            <span style={labelStyle(T)}>Estratto (anteprima)</span>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Breve riassunto mostrato nella lista e nei risultati Google" rows={2} style={{ ...inputStyle(T), resize: 'vertical' }} />
          </label>
          <div>
            <span style={labelStyle(T)}>Contenuto</span>
            <RichEditor T={T} value={form.contentMd} onChange={(html) => set('contentMd', html)} />
          </div>
          <label>
            <span style={labelStyle(T)}>Immagine di copertina</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={form.coverImageUrl} onChange={e => set('coverImageUrl', e.target.value)} placeholder="URL, carica o genera →" style={{ ...inputStyle(T), flex: 1, minWidth: 160 }} />
              {hasCloudinary && (
                <>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={onCoverFile} style={{ display: 'none' }} />
                  <Button T={T} variant="secondary" size="md" type="button" onClick={() => coverInputRef.current?.click()} disabled={uploading}>
                    {uploading ? '…' : 'Carica'}
                  </Button>
                  <Button T={T} variant="accent" size="md" type="button" onClick={onGenerateCover} disabled={uploading}>
                    {uploading ? '…' : '✨ Genera'}
                  </Button>
                </>
              )}
            </div>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="" style={{ marginTop: 8, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: T.r.md, border: `1px solid ${T.line}` }} />
            )}
          </label>
          <label>
            <span style={labelStyle(T)}>Tag (separati da virgola)</span>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="guide, milano, risparmio" style={inputStyle(T)} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={labelStyle(T)}>Meta title (SEO)</span>
              <input value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder="(opz.) override titolo SEO" style={inputStyle(T)} />
            </label>
            <label>
              <span style={labelStyle(T)}>Stato</span>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle(T)}>
                {BLOG_STATUSES.map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
              </select>
            </label>
          </div>
          <label>
            <span style={labelStyle(T)}>Meta description (SEO)</span>
            <textarea value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} placeholder="(opz.) descrizione per Google, ~155 caratteri" rows={2} style={{ ...inputStyle(T), resize: 'vertical' }} />
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button T={T} variant="accent" size="md" disabled={busy} iconRight="arrowRight">
              {busy ? 'Salvataggio…' : editing ? 'Aggiorna' : 'Crea articolo'}
            </Button>
            {editing && <Button T={T} variant="secondary" size="md" onClick={reset} type="button">Annulla modifica</Button>}
          </div>
        </form>

        {/* ─── Lista (1/3) ─── */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[{ id: 'all', l: 'Tutti' }, ...BLOG_STATUSES].map(s => (
              <button key={s.id} onClick={() => setFilter(s.id)} style={{
                padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer',
                background: filter === s.id ? T.ink1 : T.surface,
                color: filter === s.id ? '#fff' : T.ink1,
                border: `1px solid ${filter === s.id ? T.ink1 : T.line}`,
                fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
              }}>{s.l}</button>
            ))}
          </div>

          {articles === null ? (
            <Txt T={T} size={13} color={T.ink3}>Caricamento…</Txt>
          ) : articles.length === 0 ? (
            <Txt T={T} size={13} color={T.ink3}>Nessun articolo.</Txt>
          ) : (
            <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {articles.slice(curPage * PER_PAGE, curPage * PER_PAGE + PER_PAGE).map(a => (
                <div key={a.id} style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</Txt>
                      <Txt T={T} size={11} color={T.ink3}>/blog/{a.slug}</Txt>
                    </div>
                    <Badge T={T} tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Button T={T} variant="secondary" size="sm" onClick={() => onEdit(a)}>Modifica</Button>
                    <Button T={T} variant="ghost" size="sm" onClick={() => onDelete(a)} style={{ color: T.coral }}>Elimina</Button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 }}>
                <Button T={T} variant="secondary" size="sm" type="button" disabled={curPage === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>← Prec.</Button>
                <Txt T={T} size={12} color={T.ink3}>Pagina {curPage + 1} di {totalPages}</Txt>
                <Button T={T} variant="secondary" size="sm" type="button" disabled={curPage >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Succ. →</Button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
