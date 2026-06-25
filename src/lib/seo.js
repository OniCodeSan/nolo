import { useEffect } from 'react';
import { LANGS, DEFAULT_LANG, langFromPath, pathForLang, stripLangPrefix, langMeta } from '../i18n/langs.js';

const SITE_NAME = 'MoviQ';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://moviq.it';
const DEFAULT_TITLE = "MoviQ · L'auto giusta vicino a te";
const DEFAULT_DESCRIPTION = "Aggregatore di autonoleggi indipendenti in tutta Italia. Trovi l'auto, scegli il noleggiatore, paghi direttamente lui.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

function upsertMeta({ name, property, content }) {
  if (content === null || content === undefined) return;
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (name) el.setAttribute('name', name);
    if (property) el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function removeMeta({ name, property }) {
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  document.head.querySelector(selector)?.remove();
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// hreflang: una alternate per ogni lingua + x-default (italiano) per lo stesso
// contenuto. Pulisce le precedenti per non sporcare le pagine successive (SPA).
// `langs` (opz.): elenco di codici lingua per cui esiste davvero una versione
// di questa pagina. Se omesso, si assume che la pagina esista in tutte le lingue
// (vale per UI/pagine localizzate al 100%). Per gli articoli del Magazine si
// passano solo le lingue effettivamente tradotte, così non si dichiarano
// alternate verso contenuti che sarebbero solo il fallback IT (duplicate content).
function upsertAlternates(neutralPath, langs = null) {
  document.head.querySelectorAll('link[rel="alternate"][data-i18n="1"]').forEach(e => e.remove());
  const allow = langs ? new Set(langs) : null;
  const add = (hreflang, path) => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    el.setAttribute('href', `${SITE_URL}${pathForLang(neutralPath, path)}`);
    el.setAttribute('data-i18n', '1');
    document.head.appendChild(el);
  };
  for (const l of LANGS) {
    if (allow && !allow.has(l.code)) continue;
    add(l.hreflang, l.code);
  }
  // x-default → IT (sempre presente: è la lingua di default e il fallback).
  add('x-default', DEFAULT_LANG);
}

function removeAlternates() {
  document.head.querySelectorAll('link[rel="alternate"][data-i18n="1"]').forEach(e => e.remove());
}

function upsertJsonLd(id, payload) {
  let el = document.head.querySelector(`script[type="application/ld+json"][data-id="${id}"]`);
  if (!payload) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-id', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}

// useSeo — imposta title/description/OG/canonical e (opz.) JSON-LD.
// Si pulisce automaticamente alla destrucking della route.
export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  path,
  jsonLd,
  noindex = false,
  type = 'website',
  article = null, // { published, modified, author, tags: [] }
  alternates = null, // elenco codici lingua con una versione reale (null = tutte)
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
    const curLang = typeof window !== 'undefined' ? langFromPath(window.location.pathname) : DEFAULT_LANG;
    // path neutro (senza prefisso lingua) per costruire canonical + hreflang.
    const neutral = path || (typeof window !== 'undefined' ? stripLangPrefix(window.location.pathname) : '/');
    const url = `${SITE_URL}${pathForLang(neutral, curLang)}`;

    document.title = fullTitle;
    upsertMeta({ name: 'description', content: description });
    upsertMeta({ name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1' });

    // Open Graph
    upsertMeta({ property: 'og:type', content: type });
    upsertMeta({ property: 'og:title', content: fullTitle });
    upsertMeta({ property: 'og:description', content: description });
    upsertMeta({ property: 'og:url', content: url });
    upsertMeta({ property: 'og:image', content: image });
    upsertMeta({ property: 'og:site_name', content: SITE_NAME });
    upsertMeta({ property: 'og:locale', content: langMeta(curLang).locale });

    // Meta specifiche articolo (blog). Gestite e ripulite per non "sporcare"
    // le pagine successive nella SPA.
    const ARTICLE_PROPS = ['article:published_time', 'article:modified_time', 'article:author', 'article:section'];
    if (type === 'article' && article) {
      if (article.published) upsertMeta({ property: 'article:published_time', content: article.published });
      else removeMeta({ property: 'article:published_time' });
      if (article.modified) upsertMeta({ property: 'article:modified_time', content: article.modified });
      else removeMeta({ property: 'article:modified_time' });
      upsertMeta({ property: 'article:author', content: article.author || SITE_NAME });
      if (article.tags?.length) upsertMeta({ property: 'article:section', content: article.tags[0] });
      else removeMeta({ property: 'article:section' });
      if (article.tags?.length) upsertMeta({ name: 'keywords', content: article.tags.join(', ') });
      else removeMeta({ name: 'keywords' });
    } else {
      ARTICLE_PROPS.forEach(p => removeMeta({ property: p }));
      removeMeta({ name: 'keywords' });
    }

    // Twitter card
    upsertMeta({ name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta({ name: 'twitter:title', content: fullTitle });
    upsertMeta({ name: 'twitter:description', content: description });
    upsertMeta({ name: 'twitter:image', content: image });

    upsertCanonical(url);
    if (noindex) removeAlternates(); else upsertAlternates(neutral, alternates);

    if (jsonLd) upsertJsonLd('route', jsonLd);

    return () => {
      // Cleanup JSON-LD route-specifica al cambio pagina
      upsertJsonLd('route', null);
    };
  }, [title, description, image, path, JSON.stringify(jsonLd), noindex, type, JSON.stringify(article), JSON.stringify(alternates)]);
}

// JSON-LD builders
export function vehicleJsonLd(car, host) {
  if (!car) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.brand} ${car.model}${car.year ? ` ${car.year}` : ''}`,
    description: car.description || `Noleggio ${car.brand} ${car.model} a ${car.city || host?.city || 'Italia'}`,
    brand: { '@type': 'Brand', name: car.brand },
    category: car.category,
    image: car.images?.[0]?.url || `${SITE_URL}/og-car.png`,
    offers: {
      '@type': 'Offer',
      price: car.pricePerDay,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: host ? {
        '@type': 'Organization',
        name: host.n,
        ...(host.rating && { aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: host.rating,
          reviewCount: host.reviews,
        }}),
      } : undefined,
    },
  };
}

export function localBusinessJsonLd(host) {
  if (!host) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: host.n,
    address: { '@type': 'PostalAddress', addressLocality: host.city, addressCountry: 'IT' },
    aggregateRating: host.rating ? {
      '@type': 'AggregateRating',
      ratingValue: host.rating,
      reviewCount: host.reviews,
    } : undefined,
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  };
}

// BreadcrumbList JSON-LD. items: [{ name, path }].
export function breadcrumbJsonLd(items) {
  if (!items?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

// JSON-LD per un articolo del blog (schema BlogPosting).
export function articleJsonLd(article) {
  if (!article) return null;
  const url = `${SITE_URL}/blog/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || undefined,
    image: article.cover_image_url || `${SITE_URL}/og-default.png`,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };
}

export { SITE_NAME, SITE_URL };
