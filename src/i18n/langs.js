// Configurazione lingue del sito (single source of truth).
// L'italiano è la lingua di default e vive a root (nessun prefisso URL).
// Le altre lingue hanno il prefisso /en, /es, /de, /pt, /fr.

export const DEFAULT_LANG = 'it';

export const LANGS = [
  { code: 'it', label: 'Italiano',   short: 'IT', locale: 'it_IT', hreflang: 'it' },
  { code: 'en', label: 'English',    short: 'EN', locale: 'en_US', hreflang: 'en' },
  { code: 'es', label: 'Español',    short: 'ES', locale: 'es_ES', hreflang: 'es' },
  { code: 'de', label: 'Deutsch',    short: 'DE', locale: 'de_DE', hreflang: 'de' },
  { code: 'pt', label: 'Português',  short: 'PT', locale: 'pt_PT', hreflang: 'pt' },
  { code: 'fr', label: 'Français',   short: 'FR', locale: 'fr_FR', hreflang: 'fr' },
];

export const ALL_CODES = LANGS.map(l => l.code);
// Lingue con prefisso URL (tutte tranne l'italiano).
export const PREFIXED = LANGS.filter(l => l.code !== DEFAULT_LANG).map(l => l.code);

export function langMeta(code) {
  return LANGS.find(l => l.code === code) || LANGS[0];
}

// Ricava la lingua dal pathname COMPLETO del browser (con eventuale prefisso).
export function langFromPath(pathname) {
  const seg = (pathname || '/').split('/')[1];
  return PREFIXED.includes(seg) ? seg : DEFAULT_LANG;
}

// basename del router per una lingua: '' per l'italiano, '/xx' per le altre.
export function basenameFor(lang) {
  return lang && lang !== DEFAULT_LANG ? `/${lang}` : '';
}

// Rimuove l'eventuale prefisso lingua → path "neutro" (sempre con leading /).
export function stripLangPrefix(pathname) {
  const parts = (pathname || '/').split('/');
  if (PREFIXED.includes(parts[1])) parts.splice(1, 1);
  const p = parts.join('/') || '/';
  return p.startsWith('/') ? p : '/' + p;
}

// Costruisce il path completo per un path neutro in una data lingua.
export function pathForLang(neutralPath, lang) {
  const clean = (neutralPath || '/').startsWith('/') ? neutralPath : '/' + neutralPath;
  if (lang === DEFAULT_LANG) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}
