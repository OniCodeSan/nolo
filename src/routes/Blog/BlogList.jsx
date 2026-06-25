import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listBlogArticles } from '../../services/blog.js';
import { useSeo, organizationJsonLd } from '../../lib/seo.js';
import i18n from '../../i18n/index.js';
import { H, Txt, Badge, Button } from '../../components/ui.jsx';

const PER_PAGE = 9; // 3×3

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(i18n.language || 'it', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

export function BlogList({ T, isDesktop }) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  useSeo({
    title: 'Magazine',
    description: t('blog.meta_description'),
    path: '/blog',
    jsonLd: organizationJsonLd(),
  });

  useEffect(() => {
    let cancelled = false;
    listBlogArticles({ limit: 90, lang: i18n.language })
      .then(d => { if (!cancelled) setArticles(d); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [i18n.language]);

  return (
    <div style={{ flex: 1, background: T.bg }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: isDesktop ? '48px 40px' : '28px 18px 40px' }}>
        <Badge T={T} tone="accent" icon="sparkle">Magazine MoviQ</Badge>
        <H T={T} size={isDesktop ? 'display' : 'h1'} style={{ marginTop: 12, marginBottom: 8 }}>
          {t('blog.hero_title')}
        </H>
        <Txt T={T} size={15} color={T.ink2} style={{ display: 'block', marginBottom: isDesktop ? 64 : 36, maxWidth: 560, lineHeight: 1.55 }}>
          {t('blog.hero_subtitle')}
        </Txt>

        {error && (
          <div style={{ padding: 14, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: T.r.md, marginBottom: 20 }}>
            <Txt T={T} size={12} color={T.coral}>{t('blog.load_error')}</Txt>
          </div>
        )}

        {articles === null && !error && (
          <Txt T={T} size={13} color={T.ink3}>{t('common.loading')}</Txt>
        )}

        {articles && articles.length === 0 && (
          <Txt T={T} size={14} color={T.ink3}>{t('blog.empty')}</Txt>
        )}

        {articles && articles.length > 0 && (() => {
          const totalPages = Math.max(1, Math.ceil(articles.length / PER_PAGE));
          const curPage = Math.min(page, totalPages - 1);
          const pageItems = articles.slice(curPage * PER_PAGE, curPage * PER_PAGE + PER_PAGE);
          const featured = pageItems[0];
          const rest = pageItems.slice(1);
          const go = (p) => { setPage(p); window.scrollTo?.({ top: 0, behavior: 'smooth' }); };
          const cover = (a, ar) => (
            <div style={{ aspectRatio: ar, background: T.surfaceAlt, overflow: 'hidden' }}>
              {a.cover_image_url
                ? <img src={a.cover_image_url} alt={a.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Txt T={T} size={28} weight={700} color={T.line}>MoviQ</Txt></div>}
            </div>
          );
          return (
          <>
          {/* ─── Articolo in evidenza ─── */}
          {featured && (
            <Link to={`/blog/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: isDesktop ? 44 : 28 }}>
              <article style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1.3fr 1fr' : undefined, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, overflow: 'hidden', boxShadow: T.sh.soft }}>
                {cover(featured, '16 / 9')}
                <div style={{ padding: isDesktop ? '34px 38px' : 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge T={T} tone="accent">{t('blog.featured')}</Badge>
                    {Array.isArray(featured.tags) && featured.tags[0] && <Txt T={T} size={11} color={T.ink3} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{featured.tags[0]}</Txt>}
                  </div>
                  <H T={T} size={isDesktop ? 'h2' : 'h3'} style={{ lineHeight: 1.2 }}>{featured.title}</H>
                  {featured.excerpt && <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.6 }}>{featured.excerpt}</Txt>}
                  <Txt T={T} size={11} color={T.ink3} style={{ marginTop: 4 }}>{formatDate(featured.published_at)}</Txt>
                </div>
              </article>
            </Link>
          )}

          {/* ─── Griglia ─── */}
          {rest.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', columnGap: 28, rowGap: isDesktop ? 40 : 24 }}>
              {rest.map(a => (
                <Link key={a.id} to={`/blog/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <article style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: T.sh.soft }}>
                    {cover(a, '16 / 9')}
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                      {Array.isArray(a.tags) && a.tags[0] && <Txt T={T} size={10} weight={700} color={T.ink3} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.tags[0]}</Txt>}
                      <H T={T} size="h4" style={{ lineHeight: 1.3 }}>{a.title}</H>
                      {a.excerpt && <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.55, flex: 1 }}>{a.excerpt}</Txt>}
                      <Txt T={T} size={11} color={T.ink3} style={{ marginTop: 6 }}>{formatDate(a.published_at)}</Txt>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: isDesktop ? 48 : 32 }}>
              <Button T={T} variant="secondary" size="md" disabled={curPage === 0} onClick={() => go(Math.max(0, curPage - 1))}>{t('blog.prev')}</Button>
              <Txt T={T} size={13} color={T.ink3}>{t('blog.page_of', { current: curPage + 1, total: totalPages })}</Txt>
              <Button T={T} variant="secondary" size="md" disabled={curPage >= totalPages - 1} onClick={() => go(Math.min(totalPages - 1, curPage + 1))}>{t('blog.next')}</Button>
            </div>
          )}
          </>
          );
        })()}
      </div>
    </div>
  );
}
