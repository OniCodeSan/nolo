import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';
import { CITTA_LIST } from '../data/pickup-points.js';
import { reverseGeocodeCity } from '../services/geocode.js';

const TYPE_EMOJI = { stazione: '🚉', aeroporto: '✈️', porto: '⚓', centro: '📍' };

// Destinazioni "Dove" da tutti i punti di ritiro ufficiali: città + stazione/
// aeroporto/porto/centro, con sottotitolo "Città, Regione, Italia".
const ALL_DEST = CITTA_LIST.flatMap(c => {
  const sub = `${c.nome}, ${c.regione}, Italia`;
  return [
    { id: `city-${c.slug}`, emoji: '🏙️', label: c.nome, sub, value: c.nome, isCity: true },
    ...c.puntiRitiro.map(p => ({
      id: `${c.slug}-${p.tipo}-${p.nome}`,
      emoji: TYPE_EMOJI[p.tipo] || '📍',
      label: p.codiceIata ? `${p.nome} (${p.codiceIata})` : p.nome,
      sub, value: p.nome, isCity: false,
    })),
  ];
});

const rowStyle = { width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, textAlign: 'left' };

// Campo "Dove": si DIGITA direttamente nel campo; i risultati appaiono in una
// tendina ancorata sotto (no popup). "Usa posizione attuale" usa la geoloc reale.
export function LocationField({ T, value, onChange, variant = 'desktop', flex = 1.5 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q.length >= 1
    ? ALL_DEST.filter(d => d.label.toLowerCase().includes(q) || d.sub.toLowerCase().includes(q)).slice(0, 12)
    : ALL_DEST.filter(d => d.isCity).slice(0, 8); // città principali quando vuoto

  const pick = (v) => { onChange(v); setOpen(false); setQuery(''); };

  // Geolocalizzazione reale del browser → città (reverse geocoding). Niente Milano fisso.
  const useCurrentPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocodeCity(pos.coords.latitude, pos.coords.longitude).catch(() => null);
        setLocating(false);
        if (city) pick(city);
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
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={value || t('home.where_ph')}
              style={fieldInputStyle}
            />
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
          boxShadow: T.sh.deep, zIndex: 1000, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: 360,
        }}>
          <div style={{ overflow: 'auto', padding: 4 }}>
            <button onClick={useCurrentPosition} disabled={locating} style={{ ...rowStyle, opacity: locating ? 0.6 : 1 }}>
              <span style={{ width: 22, textAlign: 'center', fontSize: 17, flex: 'none' }}>📍</span>
              <Txt T={T} size={14} weight={600} style={{ flex: 1 }}>
                {locating ? t('locationpicker.locating', 'Localizzazione…') : t('locationpicker.use_current')}
              </Txt>
            </button>
            {filtered.map(d => (
              <button key={d.id} onClick={() => pick(d.value)} style={rowStyle}>
                <span style={{ width: 22, textAlign: 'center', fontSize: 17, flex: 'none' }}>{d.emoji}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <Txt T={T} size={14} weight={500} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{d.sub}</Txt>
                </span>
              </button>
            ))}
            {q.length >= 2 && !filtered.some(d => d.value.toLowerCase() === q) && (
              <button onClick={() => pick(query.trim())} style={rowStyle}>
                <span style={{ width: 22, textAlign: 'center', flex: 'none' }}><Icon name="search" size={15} color={T.ink2} T={T} /></span>
                <Txt T={T} size={14} weight={500} style={{ flex: 1 }}>{t('locationpicker.search_for', { q: query.trim() })}</Txt>
              </button>
            )}
            {!filtered.length && q.length < 2 && (
              <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', padding: 12, textAlign: 'center' }}>
                {t('locationpicker.search_ph')}
              </Txt>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
