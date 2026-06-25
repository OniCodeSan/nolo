// Geocoding gratuito via Nominatim (OpenStreetMap). Nessuna API key.
// Uso a basso volume (salvataggio veicolo, localizzazione utente): rispetta la
// usage policy OSM. Tutte le funzioni sono best-effort: ritornano null senza
// mai lanciare, così non bloccano mai il flusso chiamante.

const BASE = 'https://nominatim.openstreetmap.org';

function isFiniteNum(n) { return typeof n === 'number' && isFinite(n); }

// Indirizzo/località → [lat, lng] (limitato all'Italia). null se non trovato.
export async function geocode(query) {
  const q = (query || '').trim();
  if (!q) return null;
  try {
    const url = `${BASE}/search?format=json&limit=1&countrycodes=it&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    const lat = Number(data[0].lat);
    const lng = Number(data[0].lon);
    if (!isFiniteNum(lat) || !isFiniteNum(lng)) return null;
    return [lat, lng];
  } catch {
    return null;
  }
}

// [lat,lng] → nome città (in italiano quando disponibile). null se non trovato.
export async function reverseGeocodeCity(lat, lng) {
  if (!isFiniteNum(lat) || !isFiniteNum(lng)) return null;
  try {
    const url = `${BASE}/reverse?format=json&zoom=10&accept-language=it&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address || {};
    return a.city || a.town || a.village || a.municipality || a.county || null;
  } catch {
    return null;
  }
}
