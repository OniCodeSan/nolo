// Sentry no-op se VITE_SENTRY_DSN non è impostata o se l'utente ha
// revocato il consent `errors`. Default consent.errors = true (legitimate
// interest, niente PII inviata) ma rispettiamo opt-out via ConsentBanner.
//
// PII scrubbing: prima di inviare ogni event a Sentry rimuoviamo email,
// query string con token, payload personalizzato. Stiamo GDPR-side.

import { getConsentSync, subscribeConsent } from '../state/ConsentContext.jsx';

let sentryRef = null;
let initialized = false;
let bound = false;

const EMAIL_RX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const SENSITIVE_QS_KEYS = [
  'access_token', 'refresh_token', 'token', 'code', 'otp',
  'apikey', 'api_key', 'authorization', 'password', 'pwd',
  'iban', 'email',
];

function scrubString(s) {
  if (typeof s !== 'string') return s;
  return s.replace(EMAIL_RX, '[email]');
}

function scrubUrl(url) {
  if (typeof url !== 'string') return url;
  try {
    const u = new URL(url, 'https://moviq.it');
    SENSITIVE_QS_KEYS.forEach(k => {
      if (u.searchParams.has(k)) u.searchParams.set(k, '[scrubbed]');
    });
    // Rimuovi anche eventuale hash con token magic-link
    if (u.hash && /access_token|refresh_token/.test(u.hash)) u.hash = '[scrubbed]';
    return u.toString();
  } catch {
    return scrubString(url);
  }
}

function scrubObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      out[k] = SENSITIVE_QS_KEYS.includes(k.toLowerCase()) ? '[scrubbed]' : scrubString(v);
    } else if (v && typeof v === 'object') {
      out[k] = scrubObject(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function beforeSendEvent(event) {
  // URL: scrub query
  if (event.request) {
    if (event.request.url) event.request.url = scrubUrl(event.request.url);
    if (event.request.query_string) event.request.query_string = '[scrubbed]';
    if (event.request.headers) {
      delete event.request.headers.Cookie;
      delete event.request.headers.Authorization;
    }
    if (event.request.data) event.request.data = scrubObject(event.request.data);
  }
  // Message / exception: scrub email
  if (event.message) event.message = scrubString(event.message);
  if (event.exception?.values) {
    event.exception.values.forEach(v => {
      if (v.value) v.value = scrubString(v.value);
    });
  }
  // Extra / contexts: scrub recursivamente
  if (event.extra) event.extra = scrubObject(event.extra);
  if (event.contexts) event.contexts = scrubObject(event.contexts);
  // User: id ok, email ok solo se consent dato (rimuoviamo per default)
  if (event.user) {
    event.user = {
      id: event.user.id,
      // niente email/ip nei report Sentry
    };
  }
  return event;
}

function beforeBreadcrumb(crumb) {
  if (crumb.data?.url) crumb.data.url = scrubUrl(crumb.data.url);
  if (crumb.message) crumb.message = scrubString(crumb.message);
  if (crumb.data) crumb.data = scrubObject(crumb.data);
  return crumb;
}

async function doInit() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || initialized) return null;
  initialized = true;
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_RELEASE || undefined,
      sendDefaultPii: false, // mai mandare IP/User-Agent/cookies in chiaro
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      beforeSend: beforeSendEvent,
      beforeBreadcrumb,
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        /Loading chunk \d+ failed/i,        // refresh dopo deploy
        /Loading CSS chunk \d+ failed/i,
        /ChunkLoadError/i,
        /NetworkError when attempting to fetch/i,
        /Failed to fetch/i,
        /AbortError/i,
        // estensioni browser rumorose
        /chrome-extension:/i,
        /moz-extension:/i,
        /safari-extension:/i,
      ],
      denyUrls: [
        /chrome-extension:\/\//i,
        /moz-extension:\/\//i,
        /safari-extension:\/\//i,
        /^file:\/\//i,
      ],
    });
    sentryRef = Sentry;
    return Sentry;
  } catch (err) {
    console.warn('[MoviQ] Sentry init fallito', err);
    return null;
  }
}

export function captureException(error, context) {
  if (sentryRef) {
    sentryRef.captureException(error, context ? { extra: scrubObject(context) } : undefined);
  } else if (import.meta.env.DEV) {
    console.error('[MoviQ] captureException (dev)', error?.message || error);
  }
}

export function setUser(user) {
  if (!sentryRef) return;
  if (user) {
    // id only — email/IP NON inviata (sendDefaultPii: false + beforeSend strip)
    sentryRef.setUser({ id: user.id });
  } else {
    sentryRef.setUser(null);
  }
}

// Esposto per il consent system: se l'utente revoca il consenso,
// possiamo "spegnere" Sentry rendendolo no-op.
export function disableSentry() {
  if (sentryRef?.close) {
    try { sentryRef.close(0); } catch {}
  }
  sentryRef = null;
}

// Entry point legato al consent. Lo chiamiamo da main.jsx al boot.
export function initSentry() {
  if (bound) return;
  bound = true;
  const apply = (consent) => {
    if (consent.errors) doInit();
    else disableSentry();
  };
  apply(getConsentSync());
  subscribeConsent(apply);
}
