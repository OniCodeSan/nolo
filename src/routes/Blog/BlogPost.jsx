import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBlogArticle, incrementBlogView, listBlogArticles, getArticleLangs } from '../../services/blog.js';
import { toSafeHtml } from '../../lib/contentHtml.js';
import { useSeo, articleJsonLd, breadcrumbJsonLd } from '../../lib/seo.js';
import i18n from '../../i18n/index.js';
import { H, Txt } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';
import { NotFound } from '../NotFound.jsx';

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(i18n.language || 'it', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

export function BlogPost({ T }) {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(undefined); // undefined=loading, null=notfound
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [langs, setLangs] = useState(['it']); // lingue con una versione reale

  useEffect(() => {
    let cancelled = false;
    listBlogArticles({ limit: 4, lang: i18n.language })
      .then(list => { if (!cancelled) setRelated((list || []).filter(a => a.slug !== slug).slice(0, 3)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug, i18n.language]);

  useEffect(() => {
    let cancelled = false;
    getArticleLangs(slug).then(l => { if (!cancelled) setLangs(l); }).catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setArticle(undefined);
    getBlogArticle(slug, i18n.language)
      .then(a => {
        if (cancelled) return;
        setArticle(a || null);
        if (a) incrementBlogView(slug);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setArticle(null); } });
    return () => { cancelled = true; };
  }, [slug, i18n.language]);

  useSeo(article ? {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || undefined,
    image: article.cover_image_url || undefined,
    path: `/blog/${slug}`,
    type: 'article',
    alternates: langs,
    article: {
      published: article.published_at,
      modified: article.updated_at || article.published_at,
      tags: article.tags || [],
    },
    jsonLd: [
      articleJsonLd(article),
      breadcrumbJsonLd([
        { name: t('nav.home'), path: '/' },
        { name: 'Magazine', path: '/blog' },
        { name: article.title, path: `/blog/${slug}` },
      ]),
    ],
  } : { title: t('blog.article_fallback'), path: `/blog/${slug}`, noindex: true });

  if (article === undefined) {
    return <div style={{ flex: 1, padding: 40, background: T.bg }}><Txt T={T} size={13} color={T.ink3}>{t('common.loading')}</Txt></div>;
  }
  if (article === null) return <NotFound T={T} />;

  // Link interni (/...) gestiti dal router senza ricaricare la pagina.
  const onContentClick = (e) => {
    const a = e.target.closest?.('a');
    if (a) {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('/')) { e.preventDefault(); navigate(href); }
    }
  };

  const cleanHtml = toSafeHtml(article.content_md);

  return (
    <div style={{ flex: 1, background: T.bg }}>
      <style>{`
        .blog-article h2 { font-family:${T.fontDisplay}; font-size:24px; font-weight:700; line-height:1.25; margin:28px 0 10px; }
        .blog-article h3 { font-family:${T.fontDisplay}; font-size:19px; font-weight:600; margin:24px 0 8px; }
        .blog-article p  { font-size:16px; line-height:1.75; margin:0 0 16px; }
        .blog-article ul, .blog-article ol { margin:0 0 16px; padding-left:24px; line-height:1.75; }
        .blog-article li { margin:6px 0; }
        .blog-article a  { color:${T.ink1}; text-decoration:underline; text-underline-offset:2px; }
        .blog-article img { max-width:100%; height:auto; border-radius:${T.r.md}px; margin:10px 0; display:block; }
        .blog-article blockquote { margin:0 0 16px; padding:8px 16px; border-left:3px solid ${T.accent}; background:${T.surfaceAlt}; border-radius:6px; color:${T.ink2}; }
        .blog-article strong, .blog-article b { font-weight:700; }
      `}</style>
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '24px 18px 56px', boxSizing: 'border-box' }}>
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.ink2, textDecoration: 'none', fontFamily: T.fontBody, fontSize: 13, marginBottom: 18 }}>
          <Icon name="chevronLeft" size={14} color={T.ink2} T={T} /> {t('blog.back')}
        </Link>

        <H T={T} size="h1" style={{ lineHeight: 1.15, marginBottom: 10 }}>{article.title}</H>
        <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginBottom: 20 }}>{formatDate(article.published_at)}</Txt>

        {article.cover_image_url && (
          <img src={article.cover_image_url} alt={article.title} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: T.r.lg, marginBottom: 24, display: 'block' }} />
        )}

        {error && <Txt T={T} size={12} color={T.coral}>{error}</Txt>}

        <div
          className="blog-article"
          style={{ color: T.ink1, fontFamily: T.fontBody }}
          onClick={onContentClick}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {/* CTA conversione + tag (link interni) */}
        <div style={{ marginTop: 32, padding: 20, background: T.ink1, borderRadius: T.r.lg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <Txt T={T} size={15} weight={600} color="#fff" style={{ display: 'block' }}>{t('blog.cta_title')}</Txt>
            <Txt T={T} size={13} color="rgba(255,255,255,0.7)">{t('blog.cta_body')}</Txt>
          </div>
          <Link to="/cerca" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: T.accent, color: T.ink1, borderRadius: T.r.pill, fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {t('blog.cta_button')} <Icon name="arrowRight" size={15} color={T.ink1} T={T} />
          </Link>
        </div>

        {/* Articoli correlati (internal linking tra i post) */}
        {related.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <H T={T} size="h4" style={{ marginBottom: 14 }}>{t('blog.continue_reading')}</H>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {related.map(r => (
                <Link key={r.id} to={`/blog/${r.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, height: '100%' }}>
                    <Txt T={T} size={14} weight={600} style={{ display: 'block', lineHeight: 1.3 }}>{r.title}</Txt>
                    {r.excerpt && <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginTop: 6, lineHeight: 1.45 }}>{r.excerpt.slice(0, 90)}{r.excerpt.length > 90 ? '…' : ''}</Txt>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
