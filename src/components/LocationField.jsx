import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';
import { autocompleteAddress, hasGeoapify } from '../lib/geoapify.js';
import { reverseGeocodeCity } from '../services/geocode.js';

const rowStyle = { width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, textAlign: 'left' };

// Campo "Dove": si digita, autocomplete Geoapify (stessa fonte usata dagli host
// per inserire il ritiro) → onChange(label, [lat,lng]). La tendina è ancorata
// sotto al campo. "Usa posizione attuale" usa la geolocalizzazione del browser.
export function LocationField({ T, value, onChange, variant = 'desktop', flex = 1.5 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const ctrlRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!hasGeoapify || q.length < 3) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      ctrlRef.current?.abort();
      ctrlRef.current = new AbortController();
      const r = await autocompleteAddress(q, { signal: ctrlRef.current.signal });
      setResults(r);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const pick = (label, coords) => { onChange(label, coords); setOpen(false); setQuery(''); setResults([]); };

  const useCurrentPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        let city = null;
        try { city = await reverseGeocodeCity(lat, lng); } catch { /* ignore */ }
        setLocating(false);
        pick(city || t('locationpicker.near_me', 'Vicino a te'), [lat, lng]);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const fieldInputStyle = { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: T.ink1, padding: 0 };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: variant === 'desktop' ? flex : undefined, minWidth: 0 }}>
      <div onClick={() => setOpen(true)} style={{
        padding: variant === 'mobile' ? '12px 14px' : '10px 14px',
        display: 'flex', flexDirection: 'column', gap: 4, cursor: 'text', borderRadius: T.r.md, minWidth: 0,
      }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('home.where')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="search" size={14} color={T.ink2} T={T} />
          {open ? (
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={value || t('home.where_ph')} style={fieldInputStyle} autoComplete="off" />
          ) : (
            <span style={{ flex: 1, minWidth: 0, fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: value ? T.ink1 : T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value || t('home.where_ph')}
            </span>
          )}
        </span>
      </div>

      {open && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          width: variant === 'mobile' ? '100%' : 380, maxWidth: '92vw',
          background: T.bg, border: `1px solid ${T.line}`, borderRadius: 12,
          boxShadow: T.sh.deep, zIndex: 2000, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: 360,
        }}>
          <div style={{ overflow: 'auto', padding: 4 }}>
            <button type="button" onClick={useCurrentPosition} disabled={locating} style={{ ...rowStyle, opacity: locating ? 0.6 : 1 }}>
              <span style={{ width: 22, textAlign: 'center', fontSize: 17, flex: 'none' }}>📍</span>
              <Txt T={T} size={14} weight={600} style={{ flex: 1 }}>
                {locating ? t('locationpicker.locating', 'Localizzazione…') : t('locationpicker.use_current')}
              </Txt>
            </button>
            {loading && !results.length && (
              <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', padding: 12 }}>Cerco…</Txt>
            )}
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => pick(r.label, [r.lat, r.lon])} style={rowStyle}>
                <Icon name="pin" size={14} color={T.ink2} T={T} />
                <Txt T={T} size={13} color={T.ink1} style={{ flex: 1, lineHeight: 1.3 }}>{r.label}</Txt>
              </button>
            ))}
            {!loading && query.trim().length >= 3 && !results.length && (
              <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', padding: 12 }}>Nessun risultato</Txt>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
