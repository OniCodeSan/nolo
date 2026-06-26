import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';
import { autocompleteAddress, hasGeoapify } from '../lib/geoapify.js';

// Campo indirizzo con autocomplete Geoapify: l'utente digita, sceglie un
// suggerimento reale → otteniamo coordinate ESATTE (lat/lng) + città.
// onSelect({ label, lat, lon, city }) quando sceglie; onText(text) ad ogni
// digitazione (per gestire il caso "ha scritto ma non ha selezionato").
export function AddressAutocomplete({ T, value, onText, onSelect, placeholder, inputStyle, invalid }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const ctrlRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Debounce della query di autocomplete.
  useEffect(() => {
    const q = (value || '').trim();
    if (!hasGeoapify || q.length < 3) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      ctrlRef.current?.abort();
      ctrlRef.current = new AbortController();
      const r = await autocompleteAddress(q, { signal: ctrlRef.current.signal });
      setResults(r);
      setLoading(false);
      if (r.length) setOpen(true);
    }, 350);
    return () => clearTimeout(t);
  }, [value]);

  const pick = (r) => {
    onSelect?.(r);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        value={value || ''}
        onChange={(e) => onText?.(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (loading || results.length > 0) && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          background: T.surface || T.bg, border: `1px solid ${T.line}`, borderRadius: 10,
          boxShadow: T.sh.deep, maxHeight: 280, overflow: 'auto',
        }}>
          {loading && !results.length && (
            <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', padding: 12 }}>Cerco…</Txt>
          )}
          {results.map((r, i) => (
            <button key={i} type="button" onClick={() => pick(r)} style={{
              width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: i < results.length - 1 ? `1px solid ${T.line}` : 'none',
            }}>
              <Icon name="pin" size={14} color={T.ink2} T={T} />
              <Txt T={T} size={13} color={T.ink1} style={{ flex: 1, lineHeight: 1.3 }}>{r.label}</Txt>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
