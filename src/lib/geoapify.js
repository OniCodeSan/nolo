// Geoapify — autocomplete indirizzi + geocoding (free tier 3000 req/giorno).
// Chiave in VITE_GEOAPIFY_API_KEY. Tutte le funzioni sono best-effort: ritornano
// [] / null senza lanciare, così non bloccano mai il flusso chiamante.

const KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || null;
export const hasGeoapify = Boolean(KEY);

const BASE = 'https://api.geoapify.com/v1/geocode';

function mapResult(x) {
  return {
    label: x.formatted || [x.address_line1, x.address_line2].filter(Boolean).join(', '),
    lat: Number(x.lat),
    lon: Number(x.lon),
    city: x.city || x.town || x.village || x.municipality || x.county || null,
  };
}

// Suggerimenti mentre si digita (limitati all'Italia).
export async function autocompleteAddress(text, { signal } = {}) {
  const q = (text || '').trim();
  if (!KEY || q.length < 3) return [];
  try {
    const url = `${BASE}/autocomplete?text=${encodeURIComponent(q)}&filter=countrycode:it&lang=it&limit=6&format=json&apiKey=${KEY}`;
    const r = await fetch(url, { signal });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.results || []).map(mapResult).filter(x => isFinite(x.lat) && isFinite(x.lon));
  } catch {
    return [];
  }
}

// Reverse geocoding: da [lat,lon] → { city, label }. Usato quando l'host
// trascina il pin sulla mappa (così la città dell'auto è sempre corretta,
// anche se l'indirizzo scritto non esiste nel geocoder).
export async function reverseGeocode(lat, lon) {
  if (!KEY || !isFinite(lat) || !isFinite(lon)) return null;
  try {
    const url = `${BASE}/reverse?lat=${lat}&lon=${lon}&lang=it&limit=1&format=json&apiKey=${KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    const x = (j.results || [])[0];
    if (!x) return null;
    const m = mapResult(x);
    return { city: m.city, label: m.label };
  } catch {
    return null;
  }
}

// Geocoding diretto (fallback se l'utente scrive senza selezionare un suggerimento).
// Ritorna [lat, lng] oppure null.
export async function geocodeAddress(text) {
  const q = (text || '').trim();
  if (!KEY || !q) return null;
  try {
    const url = `${BASE}/search?text=${encodeURIComponent(q)}&filter=countrycode:it&lang=it&limit=1&format=json&apiKey=${KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    const x = (j.results || [])[0];
    if (!x || !isFinite(Number(x.lat)) || !isFinite(Number(x.lon))) return null;
    return [Number(x.lat), Number(x.lon)];
  } catch {
    return null;
  }
}
