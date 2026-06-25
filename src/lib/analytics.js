// Analytics unificate — Posthog + Microsoft Clarity + Plausible.
//
// Tutti e tre opzionali e GATED dal consent utente:
//   - analytics consent       → Posthog + Plausible
//   - sessionRecording consent → Microsoft Clarity
// Senza chiave env il provider è no-op. Senza consent il provider non viene inizializzato.
// Quando il consent cambia (subscribe) facciamo init dei provider appena autorizzati.

import { getConsentSync, subscribeConsent } from '../state/ConsentContext.jsx';

const isProd = import.meta.env.MODE === 'production';

const cfg = {
  posthogKey: import.meta.env.VITE_POSTHOG_KEY || null,
  posthogHost: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
  clarityId: import.meta.env.VITE_CLARITY_ID || null,
  plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || null,
  plausibleHost: import.meta.env.VITE_PLAUSIBLE_HOST || 'https://plausible.io',
};

let posthog = null;       // istanza posthog-js dopo init
let plausibleReady = false;
let posthogStarted = false;
let clarityStarted = false;
let plausibleStarted = false;

function injectScript(src, attrs = {}) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
  return s;
}

// ─── Posthog ─────────────────────────────────────────────────────────────
async function initPosthog() {
  if (!cfg.posthogKey || posthogStarted) return;
  posthogStarted = true;
  try {
    const mod = await import('posthog-js');
    posthog = mod.default || mod;
    posthog.init(cfg.posthogKey, {
      api_host: cfg.posthogHost,
      capture_pageview: false,
      person_profiles: 'identified_only',
      autocapture: true,
      disable_session_recording: true, // recording lo facciamo solo via Clarity (consent separato)
      // Privacy: respect Do-Not-Track
      respect_dnt: true,
      // Mask sensitive fields nei replay (anche se off)
      mask_all_text: false,
    });
  } catch (err) {
    console.warn('[MoviQ] Posthog init fallito', err);
  }
}

function stopPosthog() {
  if (posthog?.opt_out_capturing) posthog.opt_out_capturing();
  posthog = null;
}

// ─── Microsoft Clarity ───────────────────────────────────────────────────
function initClarity() {
  if (!cfg.clarityId || clarityStarted) return;
  clarityStarted = true;
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  injectScript(`https://www.clarity.ms/tag/${cfg.clarityId}`, { 'data-moviq': 'clarity' });
}

function stopClarity() {
  if (window.clarity) {
    try { window.clarity('stop'); } catch {}
  }
}

// ─── Plausible (cookieless, ma comunque rispettiamo consent analytics) ───
function initPlausible() {
  if (!cfg.plausibleDomain || plausibleStarted) return;
  plausibleStarted = true;
  injectScript(`${cfg.plausibleHost}/js/script.tagged-events.js`, {
    'data-domain': cfg.plausibleDomain,
    'data-moviq': 'plausible',
  });
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  plausibleReady = true;
}

// ─── Master init che rispetta il consent ──────────────────────────────────
let bound = false;
function applyConsent(consent) {
  if (consent.analytics) {
    initPosthog();
    initPlausible();
  } else {
    stopPosthog();
  }
  if (consent.sessionRecording) {
    initClarity();
  } else {
    stopClarity();
  }
}

export function initAnalytics() {
  if (bound) return;
  bound = true;
  // Apply current consent (no-op se non deciso)
  applyConsent(getConsentSync());
  // Subscribe per cambi futuri (ConsentBanner → accept)
  subscribeConsent(applyConsent);
}

// ─── API pubblica ────────────────────────────────────────────────────────

export function track(event, props = {}) {
  if (!isProd) {
    console.debug('[MoviQ:analytics]', event, props);
  }
  if (posthog) posthog.capture(event, props);
  if (plausibleReady && window.plausible) window.plausible(event, { props });
}

export function page(path) {
  if (!isProd) {
    console.debug('[MoviQ:analytics] page', path);
  }
  if (posthog) posthog.capture('$pageview', { $current_url: path });
  // Plausible auto-tracking gestisce SPA via history API se script.tagged-events.js è caricato.
  // Se serve forzare: window.plausible('pageview')
}

export function identify(user) {
  if (!user) {
    if (posthog) posthog.reset();
    return;
  }
  if (posthog) posthog.identify(user.id, { email: user.email });
  if (window.clarity) window.clarity('identify', user.id, undefined, undefined, user.email);
}

// ─── Eventi standard del prodotto ────────────────────────────────────────
// Centralizziamo i nomi degli eventi per evitare drift.
export const events = {
  searchStarted: (props) => track('search_started', props),
  filtersUsed: (props) => track('filters_used', props),
  locationSearched: (props) => track('location_searched', props),
  vehicleOpened: (props) => track('vehicle_opened', props),
  bookingStarted: (props) => track('booking_started', props),
  bookingCompleted: (props) => track('booking_completed', props),
  hostAccept: (props) => track('host_accept', props),
  hostDecline: (props) => track('host_decline', props),
  ctaClick: (props) => track('cta_click', props),
  signIn: (props) => track('sign_in', props),
  signOut: (props) => track('sign_out', props),
};
