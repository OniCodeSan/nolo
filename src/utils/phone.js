// Normalizza un numero di telefono in formato E.164 (+<prefisso><numero>).
// Ritorna null se il numero non è valido.
// Nota Italia: i numeri fissi mantengono lo 0 iniziale anche in E.164
// (es. 06… → +3906…), i mobili iniziano con 3 senza 0 → NON togliamo lo zero.
export function toE164(phone, defaultCountry = 'IT') {
  if (phone == null) return null;
  // rimuove spazi (anche non-breaking), punti, trattini, parentesi, slash
  let s = String(phone).trim().replace(/[\s.\-()/ ]/g, '');
  if (!s) return null;
  if (s.startsWith('00')) s = '+' + s.slice(2);   // 0039… → +39…
  if (!s.startsWith('+')) {
    if (defaultCountry !== 'IT') return null;      // supportiamo solo default IT
    s = '+39' + s;
  }
  // deve essere '+' seguito da 7–15 cifre (standard E.164)
  if (!/^\+\d{7,15}$/.test(s)) return null;
  return s;
}

// Cifre senza '+' per i link wa.me (es. +393331234567 → 393331234567).
export function toWaNumber(phone, defaultCountry = 'IT') {
  const e = toE164(phone, defaultCountry);
  return e ? e.slice(1) : null;
}
