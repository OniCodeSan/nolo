// Normalizza il contenuto di un articolo in HTML sicuro.
// Gli articoli nuovi (editor WYSIWYG) sono già HTML; quelli vecchi o incollati
// possono essere Markdown/testo: li riconosciamo e li convertiamo, così il
// rendering non mostra mai un "muro di testo".

import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

// Link esterni: aprono in nuova scheda in sicurezza (gli interni li gestisce il router).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href)) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
});

const HTML_RE = /<\/?(p|h1|h2|h3|h4|ul|ol|li|strong|em|b|i|a|br|blockquote|img|figure)\b/i;

// Vero se il contenuto contiene già markup HTML strutturale.
export function isHtmlContent(s) {
  return HTML_RE.test(s || '');
}

// HTML "grezzo" (convertito da Markdown se serve), per caricarlo nell'editor
// WYSIWYG (TipTap fa la sua sanificazione sui nodi consentiti).
export function toEditorHtml(content) {
  const raw = content || '';
  if (!raw.trim()) return '';
  return isHtmlContent(raw) ? raw : marked.parse(raw);
}

const SANITIZE_OPTS = {
  ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'strong', 'em', 'b', 'i', 'u', 's', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'br', 'hr', 'figure', 'figcaption'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'loading', 'target', 'rel'],
};

// HTML sicuro per il rendering pubblico (converte da Markdown se serve + sanifica).
export function toSafeHtml(content) {
  return DOMPurify.sanitize(toEditorHtml(content), SANITIZE_OPTS);
}
