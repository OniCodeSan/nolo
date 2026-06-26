// Utility geografiche per la ricerca per prossimità.

// Coordinata valida e plausibilmente in Italia (filtra i placeholder).
export function isValidItalyCoord(c) {
  if (!Array.isArray(c) || c.length < 2) return false;
  const lat = Number(c[0]), lng = Number(c[1]);
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= 35 && lat <= 48 && lng >= 6 && lng <= 19;
}

// Distanza in km tra due punti [lat,lng] (haversine).
export function distanceKm(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return Infinity;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
