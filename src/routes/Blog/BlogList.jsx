import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listBlogArticles, listBlogCategories } from '../../services/blog.js';
import { useSeo, organizationJsonLd } from '../../lib/seo.js';
import i18n from '../../i18n/index.js';
import { Logo } from '../../components/ui.jsx';
import { MagazineMasthead } from './MagazineMasthead.jsx';
import { MAGAZINE_ADS, MAGAZINE_AD_SIZES } from '../../data/magazine-ads.js';

// MoviQ Magazine — homepage editoriale. Tutto è costruito dagli articoli
// pubblicati: apertura, ultime notizie, più letti (view_count), in primo piano,
// una sezione per ogni categoria con articoli e un archivio finale (così ogni
// articolo è linkato da /magazine, utile per la SEO del prerender).
// ?categoria=<slug> e ?tag=<tag> mostrano la vista filtrata.

const CAT_VARIANTS = ['std', 'dark', 'std', 'soft', 'black'];

function lang() { return i18n.language || 'it'; }

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString(lang(), { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

// Ora se pubblicato oggi, altrimenti giorno + mese abbreviato.
function fmtShort(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) {
      return dt.toLocaleTimeString(lang(), { hour: '2-digit', minute: '2-digit' });
    }
    return dt.toLocaleDateString(lang(), { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function readMinutes(a) {
  const words = (a.content_md || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Mattoncini ─────────────────────────────────────────────────────────────
function Cover({ a, ratio, eager }) {
  return (
    <div className={`mq-img ${ratio || ''}`}>
      {a.cover_image_url
        ? <img src={a.cover_image_url} alt={a.title} loading={eager ? 'eager' : 'lazy'} />
        : <div className="mq-ph">MoviQ</div>}
    </div>
  );
}

function Kicker({ a, label }) {
  const l = label(a);
  return l ? <span className="mq-kick">{l}</span> : null;
}

function Card({ a, label, ratio = 'mq-r32', h = 'h3', dek, meta = true, className = '' }) {
  const Tag = h;
  return (
    <Link to={`/magazine/${a.slug}`} className={`mq-card ${className}`}>
      <Cover a={a} ratio={ratio} />
      <Kicker a={a} label={label} />
      <Tag className="mq-hd">{a.title}</Tag>
      {dek && a.excerpt && <p className="mq-dek">{a.excerpt}</p>}
      {meta && <span className="mq-meta">{fmtDate(a.published_at)}</span>}
    </Link>
  );
}

function Compact({ a, label }) {
  return (
    <Link to={`/magazine/${a.slug}`} className="mq-cmp">
      <Kicker a={a} label={label} />
      <h3 className="mq-hd">{a.title}</h3>
      <span className="mq-meta">{fmtDate(a.published_at)}</span>
    </Link>
  );
}

function ListItem({ a, label }) {
  return (
    <Link to={`/magazine/${a.slug}`} className="mq-li">
      <time dateTime={a.published_at}>{fmtShort(a.published_at)}</time>
      <div><Kicker a={a} label={label} /><h4>{a.title}</h4></div>
    </Link>
  );
}

function SectionHead({ id, title, link, linkLabel }) {
  return (
    <div className="mq-sech">
      <h2 id={id}>{title}</h2>
      {link && <Link className="mq-more" to={link}>{linkLabel} →</Link>}
    </div>
  );
}

// Slot pubblicitario: null in config = non renderizzato. Spazio riservato con
// width/height reali della creatività (niente layout shift).
function AdSlot({ slot, isDesktop, t }) {
  const ad = MAGAZINE_ADS[slot];
  if (!ad) return null;
  const size = MAGAZINE_AD_SIZES[slot][isDesktop ? 'desktop' : 'mobile'];
  const src = isDesktop ? ad.image : ad.mobileImage;
  if (!size || !src) return null;
  return (
    <div className="mq-ad">
      <div className="mq-adlabel">{t('blog.ad_label')}</div>
      <a href={ad.href} target="_blank" rel="sponsored noopener noreferrer">
        <img src={src} width={size[0]} height={size[1]} alt={ad.alt || ad.sponsor || t('blog.ad_label')} loading="lazy" />
      </a>
    </div>
  );
}

// ─── Sezioni categoria (layout a rotazione) ─────────────────────────────────
function CategorySection({ cat, items, variant, label, t }) {
  const id = `cat-${cat.slug}`;
  const head = <SectionHead id={id} title={cat.name} link={`/magazine?categoria=${cat.slug}`} linkLabel={t('blog.see_all')} />;
  const [first, ...rest] = items;

  if (/guid/.test(cat.slug)) {
    return (
      <section className="mq-wrap mq-sec" aria-labelledby={id}>
        {head}
        <div className="mq-guide">
          {items.slice(0, 4).map((a, i) => (
            <Link key={a.id} to={`/magazine/${a.slug}`} className="mq-gd">
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{a.title}</h3>
              <span className="mq-meta">{t('blog.read_time', { n: readMinutes(a) })}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'dark') {
    return (
      <section className="mq-band mq-dark" aria-labelledby={id}>
        <div className="mq-wrap">
          {head}
          <div className="mq-mgrid">
            <Card a={first} label={label} ratio="mq-r43" dek className="m1" />
            {rest.slice(0, 4).map(a => <Card key={a.id} a={a} label={label} />)}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'soft') {
    return (
      <section className="mq-band mq-soft" aria-labelledby={id}>
        <div className="mq-wrap">
          {head}
          <div className="mq-tgrid">
            <Card a={first} label={label} ratio="mq-r169" dek className="lg" />
            <div className="mq-tsub">
              {rest.slice(0, 2).map(a => <Card key={a.id} a={a} label={label} meta={false} />)}
              {rest.slice(2, 4).map(a => <Compact key={a.id} a={a} label={label} />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'black') {
    return (
      <section className="mq-band mq-black" aria-labelledby={id}>
        <div className="mq-wrap">
          {head}
          <div className="mq-msg">
            <Link to={`/magazine/${first.slug}`} className="mq-card mq-msbig">
              <Cover a={first} ratio="mq-r169" />
              <div className="ov">
                <Kicker a={first} label={label} />
                <h3 className="mq-hd" style={{ marginTop: 10 }}>{first.title}</h3>
                {first.excerpt && <p className="mq-dek" style={{ marginTop: 8 }}>{first.excerpt}</p>}
              </div>
            </Link>
            {rest.length > 0 && (
              <div className="mq-msside">
                {rest.slice(0, 3).map(a => <Card key={a.id} a={a} label={label} ratio="mq-r169" meta={false} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mq-wrap mq-sec" aria-labelledby={id}>
      {head}
      <div className="mq-std">
        <Card a={first} label={label} ratio="mq-r169" dek />
        <div>{rest.slice(0, 6).map(a => <ListItem key={a.id} a={a} label={label} />)}</div>
      </div>
    </section>
  );
}

// ─── Pagina ─────────────────────────────────────────────────────────────────
export function BlogList({ T, isDesktop }) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get('categoria');
  const activeTag = searchParams.get('tag');

  useSeo({
    title: 'Magazine',
    description: t('blog.meta_description'),
    path: '/magazine',
    jsonLd: organizationJsonLd(),
  });

  useEffect(() => {
    let cancelled = false;
    listBlogArticles({ limit: 100, lang: i18n.language })
      .then(d => { if (!cancelled) setArticles(d); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [i18n.language]);

  // Categorie best-effort: senza, l'etichetta è il primo tag.
  useEffect(() => {
    listBlogCategories().then(setCategories, () => {});
  }, []);

  const catById = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories]);
  const label = (a) => catById[a.category_id]?.name || (Array.isArray(a.tags) && a.tags[0]) || null;

  // Categorie con articoli, ordinate per numero di articoli.
  const catSections = useMemo(() => {
    if (!articles) return [];
    return categories
      .map(c => ({ cat: c, items: articles.filter(a => a.category_id === c.id) }))
      .filter(s => s.items.length > 0)
      .sort((x, y) => y.items.length - x.items.length || x.cat.name.localeCompare(y.cat.name));
  }, [articles, categories]);

  let body;
  if (error) {
    body = <div className="mq-wrap mq-empty">{t('blog.load_error')}</div>;
  } else if (articles === null) {
    body = <div className="mq-wrap mq-empty">{t('common.loading')}</div>;
  } else if (articles.length === 0) {
    body = <div className="mq-wrap mq-empty">{t('blog.empty')}</div>;
  } else if (activeCat || activeTag) {
    body = <FilteredView {...{ articles, activeCat, activeTag, categories, label, t }} />;
  } else {
    body = <HomeView {...{ T, articles, catSections, label, t, isDesktop }} />;
  }

  return (
    <div className={`mq ${isDesktop ? 'mq-d' : 'mq-m'}`}>
      <MagazineMasthead {...{ T, isDesktop, articles, categories, activeCat, activeTag }} />
      {body}
      <div className="mq-end" />
    </div>
  );
}

function FilteredView({ articles, activeCat, activeTag, categories, label, t }) {
  const cat = activeCat ? categories.find(c => c.slug === activeCat) : null;
  const items = cat
    ? articles.filter(a => a.category_id === cat.id)
    : activeTag ? articles.filter(a => (a.tags || []).includes(activeTag)) : [];
  const title = cat ? cat.name : activeTag ? `#${activeTag}` : t('blog.all_categories');
  const [first, ...rest] = items;

  return (
    <>
      <div className="mq-wrap mq-cathead">
        <span className="mq-kick">{t('blog.articles_count', { count: items.length })}</span>
        <h1>{title}</h1>
        {cat?.description && <p className="mq-dek" style={{ maxWidth: 720 }}>{cat.description}</p>}
      </div>
      {items.length === 0 ? (
        <div className="mq-wrap mq-empty">{t('blog.category_empty')} <Link className="mq-more" to="/magazine">{t('blog.back')}</Link></div>
      ) : (
        <section className="mq-wrap" style={{ paddingTop: 28 }}>
          <Link to={`/magazine/${first.slug}`} className="mq-card mq-lead">
            <Cover a={first} ratio="mq-r32" eager />
            <div>
              <Kicker a={first} label={label} />
              <h2 className="mq-hd" style={{ fontSize: 32, margin: '10px 0' }}>{first.title}</h2>
              {first.excerpt && <p className="mq-dek">{first.excerpt}</p>}
              <div className="mq-meta" style={{ marginTop: 10 }}>{fmtDate(first.published_at)}</div>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="mq-grid3" style={{ marginTop: 48 }}>
              {rest.map(a => <Card key={a.id} a={a} label={label} dek />)}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function HomeView({ T, articles, catSections, label, t, isDesktop }) {
  // Ordine cronologico (la RPC li dà già così); i blocchi scorrono la lista.
  const hero = articles[0];
  const side = articles.slice(1, 4);
  const ticker = articles.slice(4, 9);
  const lead = articles[9];
  const three = articles.slice(10, 13);
  const latestList = articles.slice(13, 19);
  const shown = new Set([hero, ...side, ...ticker, lead, ...three, ...latestList].filter(Boolean).map(a => a.id));

  const byViews = [...articles].sort((x, y) => (y.view_count || 0) - (x.view_count || 0));
  const mostRead = byViews.slice(0, 5);
  const featured = byViews.filter(a => !shown.has(a.id)).slice(0, 4);
  featured.forEach(a => shown.add(a.id));
  catSections.forEach(s => s.items.slice(0, 7).forEach(a => shown.add(a.id)));
  const archive = articles.filter(a => !shown.has(a.id));

  return (
    <div>
      <AdSlot slot="top" isDesktop={isDesktop} t={t} />

      {/* Apertura */}
      <section className="mq-wrap" style={{ paddingTop: 36 }} aria-label={t('blog.top_stories')}>
        <div className="mq-g12">
          <Link to={`/magazine/${hero.slug}`} className="mq-card mq-heromain">
            <Cover a={hero} ratio="mq-r1610" eager />
            <div>
              <Kicker a={hero} label={label} />
              <h1 className="mq-hd">{hero.title}</h1>
              {hero.excerpt && <p className="mq-dek">{hero.excerpt}</p>}
              <div className="mq-meta" style={{ marginTop: 12 }}>
                {fmtDate(hero.published_at)} · {t('blog.read_time', { n: readMinutes(hero) })}
              </div>
            </div>
          </Link>
          {side.length > 0 && (
            <div className="mq-side">
              <Card a={side[0]} label={label} ratio="mq-r169" />
              {side.slice(1).map(a => <Compact key={a.id} a={a} label={label} />)}
            </div>
          )}
        </div>

        {ticker.length > 0 && (
          <div className="mq-tick" role="region" aria-label={t('blog.latest_news')}>
            <div className="h">{t('blog.latest_news')}</div>
            {ticker.map(a => (
              <Link key={a.id} to={`/magazine/${a.slug}`}>
                <time dateTime={a.published_at}>{fmtShort(a.published_at)}</time>
                <b>{a.title}</b>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Ultimi articoli + Più letti */}
      {lead && (
        <section className="mq-wrap mq-sec" aria-labelledby="mq-latest">
          <div className="mq-g12" style={{ alignItems: 'stretch' }}>
            <div className="mq-main">
              <SectionHead id="mq-latest" title={t('blog.latest_articles')} />
              <Link to={`/magazine/${lead.slug}`} className="mq-card mq-lead" style={{ marginTop: -12 }}>
                <Cover a={lead} ratio="mq-r32" />
                <div>
                  <Kicker a={lead} label={label} />
                  <h3 className="mq-hd">{lead.title}</h3>
                  {lead.excerpt && <p className="mq-dek">{lead.excerpt}</p>}
                  <div className="mq-meta" style={{ marginTop: 10 }}>{fmtDate(lead.published_at)}</div>
                </div>
              </Link>
              {three.length > 0 && (
                <div className="mq-three">{three.map(a => <Card key={a.id} a={a} label={label} />)}</div>
              )}
              <AdSlot slot="infeed" isDesktop={isDesktop} t={t} />
              {latestList.length > 0 && (
                <div className="mq-list2">{latestList.map(a => <ListItem key={a.id} a={a} label={label} />)}</div>
              )}
            </div>
            <aside className="mq-aside" aria-label={t('blog.most_read')}>
              <div>
                <h2 className="mq-boxh">{t('blog.most_read')}</h2>
                <div className="mq-rank">
                  {mostRead.map((a, i) => (
                    <Link key={a.id} to={`/magazine/${a.slug}`}>
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <div><h4>{a.title}</h4>{label(a) && <span className="mq-meta">{label(a)}</span>}</div>
                    </Link>
                  ))}
                </div>
              </div>
              {isDesktop && MAGAZINE_ADS.sidebar && (
                <div className="mq-sticky"><AdSlot slot="sidebar" isDesktop t={t} /></div>
              )}
            </aside>
          </div>
        </section>
      )}

      {/* In primo piano: i più letti non ancora in pagina */}
      {featured.length >= 2 && (
        <section className="mq-wrap mq-sec" aria-labelledby="mq-featured">
          <SectionHead id="mq-featured" title={t('blog.featured_week')} />
          <div className="mq-pp">
            <Card a={featured[0]} label={label} ratio="mq-r169" dek className="big" />
            <Card a={featured[1]} label={label} ratio="mq-r43" dek className="tall" />
            {featured.slice(2).map(a => (
              <Link key={a.id} to={`/magazine/${a.slug}`} className="mq-card half">
                <Cover a={a} ratio="mq-r43" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Kicker a={a} label={label} />
                  <h3 className="mq-hd">{a.title}</h3>
                  <span className="mq-meta">{fmtDate(a.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdSlot slot="mid" isDesktop={isDesktop} t={t} />

      {catSections.map((s, i) => (
        <CategorySection key={s.cat.id} cat={s.cat} items={s.items} variant={CAT_VARIANTS[i % CAT_VARIANTS.length]} label={label} t={t} />
      ))}

      {/* Promo MoviQ (house, non sponsorizzata) */}
      <section className="mq-wrap mq-sec" aria-labelledby="mq-promo">
        <div className="mq-promo">
          <div className="tx">
            <span className="lbl">MoviQ</span>
            <h2 id="mq-promo">{t('blog.promo_title')}</h2>
            <p>{t('blog.promo_body')}</p>
            <Link to="/cerca" className="cta">{t('blog.promo_cta')} →</Link>
          </div>
          <div className="mq-promo-art" aria-hidden="true"><Logo T={T} size={isDesktop ? 60 : 40} /></div>
        </div>
      </section>

      {archive.length > 0 && (
        <section className="mq-wrap mq-sec" aria-labelledby="mq-archive">
          <SectionHead id="mq-archive" title={t('blog.more_articles')} />
          <div className="mq-list2">{archive.map(a => <ListItem key={a.id} a={a} label={label} />)}</div>
        </section>
      )}

      <AdSlot slot="bottom" isDesktop={isDesktop} t={t} />
    </div>
  );
}
