import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/index.js';
import { Logo } from '../../components/ui.jsx';
import { NavAccount } from '../../components/NavBar.jsx';
import { magazineCss, MAGAZINE_FONT_HREF } from './magazineStyles.js';

// Testata del MoviQ Magazine, condivisa da /magazine e /magazine/:slug (dove la NavBar
// del sito è nascosta): logo → home, MAGAZINE → /magazine, data + account, sezioni
// (categorie con articoli) e tag di tendenza. Inietta anche gli stili `.mq`:
// va renderizzata dentro un elemento con classe `mq mq-d|mq-m`.
export function MagazineMasthead({ T, isDesktop, articles, categories, activeCat = null, activeTag = null }) {
  const { t } = useTranslation();
  const css = useMemo(() => magazineCss(T), [T]);

  useEffect(() => {
    if (document.getElementById('mq-font')) return;
    const l = document.createElement('link');
    l.id = 'mq-font';
    l.rel = 'stylesheet';
    l.href = MAGAZINE_FONT_HREF;
    document.head.appendChild(l);
  }, []);

  // Categorie con articoli, ordinate per numero di articoli (stesso ordine
  // delle sezioni in homepage).
  const navCats = useMemo(() => {
    if (!articles) return [];
    return categories
      .map(c => ({ cat: c, n: articles.filter(a => a.category_id === c.id).length }))
      .filter(x => x.n > 0)
      .sort((x, y) => y.n - x.n || x.cat.name.localeCompare(y.cat.name))
      .map(x => x.cat);
  }, [articles, categories]);

  const trendingTags = useMemo(() => {
    if (!articles) return [];
    const count = {};
    for (const a of articles) for (const tg of (a.tags || [])) count[tg] = (count[tg] || 0) + 1;
    return Object.entries(count).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([tg]) => tg);
  }, [articles]);

  const today = new Date().toLocaleDateString(i18n.language || 'it', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style>{css}</style>
      <header className="mq-mast">
        <div className="mq-wrap mq-mast-top">
          <div className="mq-brand">
            <Link to="/" aria-label="Home MoviQ"><Logo T={T} size={isDesktop ? 28 : 22} /></Link>
            <Link to="/magazine" className="mq-brand-t">Magazine</Link>
          </div>
          <div className="mq-mast-r">
            <span className="mq-date">{today}</span>
            {/* Su desktop la NavBar del sito è nascosta: il login sta qui.
                Su mobile c'è la TabBar. */}
            {isDesktop && <NavAccount T={T} />}
          </div>
        </div>
        {navCats.length > 0 && (
          <nav className="mq-nav" aria-label={t('blog.sections')}>
            <div className="mq-wrap">
              <Link to="/magazine" className={!activeCat && !activeTag ? 'on' : ''}>{t('blog.all_categories')}</Link>
              {navCats.map(cat => (
                <Link key={cat.id} to={`/magazine?categoria=${cat.slug}`} className={activeCat === cat.slug ? 'on' : ''}>{cat.name}</Link>
              ))}
            </div>
          </nav>
        )}
        {trendingTags.length > 0 && (
          <div className="mq-hot">
            <div className="mq-wrap">
              <span className="lbl">{t('blog.trending')}</span>
              {trendingTags.map(tg => (
                <Link key={tg} to={`/magazine?tag=${encodeURIComponent(tg)}`} className={activeTag === tg ? 'on' : ''}>{tg}</Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
