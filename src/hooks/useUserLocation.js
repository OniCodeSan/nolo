import { useEffect, useState } from 'react';
import { reverseGeocodeCity } from '../services/geocode.js';

// Milano come fallback FINALE se ogni metodo di geolocalizzazione fallisce.
const FALLBACK = { lat: 45.4642, lng: 9.19, city: 'Milano', country: 'IT', source: 'fallback' };
const CACHE_KEY = 'moviq:userloc:v3';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// ipapi.co restituisce i nomi città in inglese (es. "Naples", "Rome"…).
// Li riportiamo in italiano per coerenza con l'app.
const CITY_IT = {
  Rome: 'Roma', Milan: 'Milano', Naples: 'Napoli', Turin: 'Torino',
  Florence: 'Firenze', Venice: 'Venezia', Genoa: 'Genova', Padua: 'Padova',
  Mantua: 'Mantova', Syracuse: 'Siracusa', Leghorn: 'Livorno',
};
function italianizeCity(name) {
  if (!name) return name;
  return CITY_IT[name] || name;
}

function readCache() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (parsed.ts && Date.now() - parsed.ts < CACHE_TTL_MS) return parsed.loc;
  } catch { /* ignore */ }
  return null;
}
function writeCache(loc) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), loc })); } catch { /* ignore */ }
}

// 1) Geolocalizzazione PRECISA del browser (GPS/Wi-Fi). Richiede consenso utente.
//    È il metodo più affidabile: la geoloc per IP spesso sbaglia città o fallisce
//    (ed è la causa del "trova sempre Milano" quando ipapi non risponde).
function fetchBrowserLocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let city = null;
        try { city = await reverseGeocodeCity(lat, lng); } catch { /* ignore */ }
        resolve({ lat, lng, city: city || null, country: 'IT', source: 'gps' });
      },
      () => resolve(null), // permesso negato / timeout / non disponibile
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

// 2) Fallback: geolocalizzazione IP-based via ipapi.co (free tier, no key).
async function fetchIPLocation(signal) {
  const res = await fetch('https://ipapi.co/json/', { signal });
  if (!res.ok) throw new Error('ipapi.co ' + res.status);
  const j = await res.json();
  if (!j.latitude || !j.longitude) throw new Error('no coords in response');
  return {
    lat: Number(j.latitude),
    lng: Number(j.longitude),
    city: italianizeCity(j.city) || null,
    region: j.region || null,
    country: j.country_code || null,
    source: 'ip',
  };
}

export function useUserLocation() {
  const [state, setState] = useState({ loc: null, loading: true, error: null });

  useEffect(() => {
    const ctrl = new AbortController();
    let done = false;
    const finish = (loc, error = null) => {
      if (done) return;
      done = true;
      if (loc && loc.source !== 'fallback') writeCache(loc);
      setState({ loc, loading: false, error });
    };

    (async () => {
      const cached = readCache();
      if (cached) { finish(cached); return; }

      // 1) posizione precisa del browser
      const gps = await fetchBrowserLocation();
      if (gps) { finish(gps); return; }

      // 2) fallback IP
      try {
        const ip = await fetchIPLocation(ctrl.signal);
        finish(ip);
      } catch (err) {
        if (err.name === 'AbortError') return;
        // eslint-disable-next-line no-console
        console.warn('[useUserLocation] geoloc fallita, uso fallback Milano:', err.message);
        finish(FALLBACK, err.message);
      }
    })();

    return () => { done = true; ctrl.abort(); };
  }, []);

  return state;
}
