import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { pingSession } from '../services/admin.js';
import { useUserLocation } from './useUserLocation.js';

const STORAGE_KEY  = 'moviq:session_id:v1';
const ANON_KEY     = 'moviq:anon_id:v1';
const UTM_KEY      = 'moviq:utm:v1';
const PING_INTERVAL_MS = 60 * 1000; // ping ogni 60s

function getAnonId() {
  try {
    let v = localStorage.getItem(ANON_KEY);
    if (!v) {
      v = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + '-' + Date.now().toString(36);
      localStorage.setItem(ANON_KEY, v);
    }
    return v;
  } catch { return null; }
}

// Cattura UTM al landing. Persiste nella sessionStorage finché il tab è aperto.
// Aliasing: `accedi=noleggiatore` → utm_campaign=accedi-noleggiatore se non specificato.
function captureUtms() {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* noop */ }
  try {
    const params = new URLSearchParams(window.location.search || '');
    const utm = {
      utm_source:   params.get('utm_source')   || null,
      utm_medium:   params.get('utm_medium')   || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_term:     params.get('utm_term')     || null,
      utm_content:  params.get('utm_content')  || null,
      landing_path: window.location.pathname + (window.location.search || ''),
    };
    const accedi = params.get('accedi');
    if (accedi && !utm.utm_campaign) {
      utm.utm_source   = utm.utm_source || 'direct-link';
      utm.utm_campaign = `accedi-${accedi}`;
    }
    const hasAny = !!(utm.utm_source || utm.utm_medium || utm.utm_campaign || utm.utm_term || utm.utm_content);
    if (!hasAny) return { landing_path: utm.landing_path };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  } catch { return null; }
}

// Pinga la sessione a mount e a ogni cambio pagina + ogni 60s.
// Geoloc città/paese viene dal hook useUserLocation (IP-based, cache 24h).
export function useSessionTracking() {
  const { loc } = useUserLocation();
  const { pathname } = useLocation();
  const sessionIdRef = useRef(null);
  const anonIdRef    = useRef(null);
  const utmRef       = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { sessionIdRef.current = sessionStorage.getItem(STORAGE_KEY) || null; } catch { /* noop */ }
    anonIdRef.current = getAnonId();
    utmRef.current = captureUtms();
  }, []);

  // Ping all'avvio + a ogni route change
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const u = utmRef.current || {};
      const id = await pingSession({
        sessionId: sessionIdRef.current,
        anonId: anonIdRef.current,
        country: loc?.country || null,
        region:  loc?.region  || null,
        city:    loc?.city    || null,
        ip:      null, // l'IP non lo mandiamo dal client; gestito server-side se serve
        utmSource:   u.utm_source   || null,
        utmMedium:   u.utm_medium   || null,
        utmCampaign: u.utm_campaign || null,
        utmTerm:     u.utm_term     || null,
        utmContent:  u.utm_content  || null,
        landingPath: u.landing_path || null,
      });
      if (cancelled) return;
      if (id && id !== sessionIdRef.current) {
        sessionIdRef.current = id;
        try { sessionStorage.setItem(STORAGE_KEY, id); } catch { /* noop */ }
      }
    };
    ping();
    const t = setInterval(ping, PING_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [pathname, loc?.city]);

  return { sessionId: sessionIdRef.current, anonId: anonIdRef.current };
}

// Helper non-hook per uso fuori da componenti React (es. inside event handlers fuori da scope).
export function getSessionAnonIds() {
  try {
    return {
      sessionId: sessionStorage.getItem(STORAGE_KEY) || null,
      anonId:    localStorage.getItem(ANON_KEY)    || null,
    };
  } catch {
    return { sessionId: null, anonId: null };
  }
}
