import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, H, Txt } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';
import { STATIC_PAGES } from '../data/static-pages.js';
import i18n from '../i18n/index.js';
import { NotFound } from './NotFound.jsx';

// Contenuti tradotti per lingua (caricati on-demand). L'italiano è la sorgente
// di default; gli slug non ancora tradotti ricadono sull'italiano.
const LANG_LOADERS = {
  en: () => import('../data/static-pages.en.json'),
  es: () => import('../data/static-pages.es.json'),
  de: () => import('../data/static-pages.de.json'),
  pt: () => import('../data/static-pages.pt.json'),
  fr: () => import('../data/static-pages.fr.json'),
};

function Block({ T, block }) {
  if (block.type === 'h') {
    return <H T={T} size="h4" style={{ marginTop: 28, marginBottom: 10 }}>{block.text}</H>;
  }
  if (block.type === 'p') {
    return <Txt T={T} size={15} color={T.ink1} style={{ display: 'block', lineHeight: 1.65, marginBottom: 12 }}>{block.text}</Txt>;
  }
  if (block.type === 'list') {
    return (
      <ul style={{ margin: '4px 0 14px 0', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {block.items.map((it, i) => (
          <li key={i} style={{ color: T.ink1, fontFamily: T.fontBody, fontSize: 15, lineHeight: 1.6 }}>
            {typeof it === 'string' ? it : (<><strong>{it.strong}</strong>{it.text}</>)}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote style={{
        margin: '20px 0 16px',
        padding: '14px 18px',
        borderLeft: `3px solid ${T.accent}`,
        background: T.surfaceAlt,
        borderRadius: T.r.md,
      }}>
        <Txt T={T} size={16} color={T.ink1} style={{ display: 'block', fontStyle: 'italic', lineHeight: 1.5 }}>
          {block.text}
        </Txt>
      </blockquote>
    );
  }
  if (block.type === 'kv') {
    return (
      <dl style={{ margin: '4px 0 14px 0', display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 16, rowGap: 8 }}>
        {block.items.map((it, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <dt style={{ color: T.ink2, fontFamily: T.fontBody, fontSize: 13, fontWeight: 600 }}>{it.k}</dt>
            <dd style={{ margin: 0, color: T.ink1, fontFamily: T.fontBody, fontSize: 14 }}>{it.v}</dd>
          </div>
        ))}
      </dl>
    );
  }
  if (block.type === 'cta') {
    const isMail = block.mailto || block.href?.startsWith('mailto:');
    if (isMail) {
      return (
        <div style={{ marginTop: 24 }}>
          <Button T={T} variant="primary" size="md" icon="chat" onClick={() => { window.location.href = block.href; }}>
            {block.label}
          </Button>
        </div>
      );
    }
    return (
      <div style={{ marginTop: 24 }}>
        <Link to={block.href} style={{ textDecoration: 'none' }}>
          <Button T={T} variant="primary" size="md" iconRight="arrowRight">
            {block.label}
          </Button>
        </Link>
      </div>
    );
  }
  return null;
}

export function StaticPage({ T, slug: slugProp }) {
  const params = useParams();
  const slug = slugProp || params.slug;
  const [pages, setPages] = useState(STATIC_PAGES);

  // Carica i contenuti nella lingua attiva (fallback IT per slug mancanti).
  useEffect(() => {
    let cancelled = false;
    const loader = LANG_LOADERS[i18n.language];
    if (!loader) { setPages(STATIC_PAGES); return; }
    loader()
      .then(m => { if (!cancelled) setPages({ ...STATIC_PAGES, ...(m.default || m) }); })
      .catch(() => { if (!cancelled) setPages(STATIC_PAGES); });
    return () => { cancelled = true; };
  }, []);

  const page = pages[slug];

  useEffect(() => {
    if (page?.title) document.title = `${page.title} · MoviQ`;
  }, [page]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!page) return <NotFound T={T} />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <article style={{
          maxWidth: 760, width: '100%', margin: '0 auto',
          padding: '28px 22px 56px',
          boxSizing: 'border-box',
        }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.ink2, textDecoration: 'none', fontFamily: T.fontBody, fontSize: 13, marginBottom: 18 }}>
            <Icon name="chevronLeft" size={14} T={T} color={T.ink2} />
            Torna alla home
          </Link>
          <H T={T} size="h1" style={{ marginBottom: 12 }}>{page.title}</H>
          {page.lead && (
            <Txt T={T} size={17} color={T.ink2} style={{ display: 'block', lineHeight: 1.55, marginBottom: 20 }}>
              {page.lead}
            </Txt>
          )}
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
            {page.blocks.map((b, i) => <Block key={i} T={T} block={b} />)}
          </div>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
            <Txt T={T} size={12} color={T.ink3}>
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Txt>
          </div>
        </article>
      </div>
    </div>
  );
}
