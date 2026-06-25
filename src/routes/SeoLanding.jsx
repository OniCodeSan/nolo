import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSearch } from '../state/SearchContext.jsx';
import { useSeo } from '../lib/seo.js';
import { H, Txt, Button } from './../components/ui.jsx';
import { NotFound } from './NotFound.jsx';

// Pagina SEO-friendly tipo /auto-noleggio-milano, /auto-noleggio-roma, ecc.
// Montata sulla rotta generica /:seoCity (React Router v6 non supporta i parametri
// parziali dentro un segmento, es. "auto-noleggio-:citta"): estraiamo la città dal
// prefisso e, se non corrisponde, mostriamo NotFound. Imposta meta SEO ricchi e poi
// reindirizza a /cerca; il contenuto resta leggibile per i crawler (SSG/prerender).
const SEO_PREFIX = 'auto-noleggio-';

export function SeoLanding({ T }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { seoCity } = useParams();
  const { updateSearch } = useSearch();

  // Slug città solo se la rotta è davvero /auto-noleggio-<città>
  const slug = seoCity && seoCity.startsWith(SEO_PREFIX) ? seoCity.slice(SEO_PREFIX.length) : null;
  // Normalizza: "milano" → "Milano"
  const cityLabel = slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : '';

  useSeo(slug ? {
    title: t('seolanding.meta_title', { city: cityLabel }),
    description: t('seolanding.meta_desc', { city: cityLabel }),
    path: `/${SEO_PREFIX}${slug}`,
  } : { title: t('errors.page_404_title'), noindex: true });

  useEffect(() => {
    if (!slug) return;
    updateSearch({ location: cityLabel });
    // Redirect dolce dopo 50ms così i crawler hanno tempo di leggere il contenuto.
    // Disattivato sotto headless/prerender (navigator.webdriver) così la pagina
    // statica viene catturata correttamente invece di /cerca.
    if (typeof navigator !== 'undefined' && navigator.webdriver) return;
    const timer = setTimeout(() => navigate(`/cerca?dove=${encodeURIComponent(cityLabel)}`, { replace: true }), 50);
    return () => clearTimeout(timer);
  }, [slug, cityLabel]);

  if (!slug) return <NotFound T={T} />;

  return (
    <div style={{ flex: 1, padding: '40px 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <H T={T} size="display">{t('seolanding.h1', { city: cityLabel })}</H>
      <Txt T={T} size={15} color={T.ink2} style={{ display: 'block', marginTop: 16, lineHeight: 1.6 }}>
        {t('seolanding.body', { city: cityLabel })}
      </Txt>
      <Button T={T} variant="accent" size="lg" style={{ marginTop: 22 }} onClick={() => navigate(`/cerca?dove=${encodeURIComponent(cityLabel)}`)}>
        {t('seolanding.cta', { city: cityLabel })}
      </Button>
    </div>
  );
}
