import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Consent context — GDPR-compliant per MoviQ.
//
// Categorie:
//   necessary       — sempre on (sessione login, search persistente). Non opt-out.
//   analytics       — Posthog + Plausible. Opt-in.
//   sessionRecording — Microsoft Clarity. Opt-in (più invasivo: registra mouse/scroll).
//   errors          — Sentry. Default ON come legittimo interesse (no PII, no tracking).
//                     L'utente può comunque revocare.
//
// Persistito in localStorage con timestamp e versione (per re-prompt al cambio policy).

const STORAGE_KEY = 'moviq.consent.v2';
const CURRENT_VERSION = 2;

const DEFAULT_CONSENT = {
  necessary: true,
  analytics: false,
  sessionRecording: false,
  errors: true, // legitimate interest, opt-out
};

const ALL_OFF = {
  necessary: true,
  analytics: false,
  sessionRecording: false,
  errors: false,
};

const ALL_ON = {
  necessary: true,
  analytics: true,
  sessionRecording: true,
  errors: true,
};

const ConsentCtx = createContext(null);

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CURRENT_VERSION) return null; // re-prompt
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: CURRENT_VERSION,
      ...consent,
      decided_at: new Date().toISOString(),
    }));
  } catch {}
}

export function ConsentProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = readConsent();
    return stored || { ...DEFAULT_CONSENT, decided: false };
  });

  // Notifica esterna (es. analytics module) quando il consent cambia
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('moviq:consent', { detail: state }));
  }, [state]);

  const accept = useCallback((categories) => {
    const next = { ...DEFAULT_CONSENT, ...categories, decided: true };
    writeConsent(next);
    setState(next);
  }, []);

  const acceptAll = useCallback(() => accept(ALL_ON), [accept]);
  const acceptNecessaryOnly = useCallback(() => accept(ALL_OFF), [accept]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setState({ ...DEFAULT_CONSENT, decided: false });
  }, []);

  return (
    <ConsentCtx.Provider value={{
      consent: state,
      decided: !!state.decided,
      analytics: !!state.analytics,
      sessionRecording: !!state.sessionRecording,
      errors: !!state.errors,
      accept, acceptAll, acceptNecessaryOnly, reset,
    }}>
      {children}
    </ConsentCtx.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentCtx);
  if (!ctx) throw new Error('useConsent outside provider');
  return ctx;
}

// Helper sincrono per moduli non-React (analytics.js, sentry.js).
export function getConsentSync() {
  return readConsent() || { ...DEFAULT_CONSENT, decided: false };
}

// Subscribe esterno: i moduli non-React possono ascoltare cambi consent.
export function subscribeConsent(handler) {
  if (typeof window === 'undefined') return () => {};
  const fn = (e) => handler(e.detail);
  window.addEventListener('moviq:consent', fn);
  return () => window.removeEventListener('moviq:consent', fn);
}
