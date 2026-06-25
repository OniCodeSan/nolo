import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../state/SearchContext.jsx';
import { Icon } from '../components/icons.jsx';
import { H, Txt } from '../components/ui.jsx';
import { DesktopModal } from '../components/DesktopModal.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { listRecentLocations } from '../services/catalog.js';
import { events as analyticsEvents } from '../lib/analytics.js';
import { CITTA_LIST } from '../data/pickup-points.js';
import { reverseGeocodeCity } from '../services/geocode.js';

const TYPE_EMOJI = { stazione: '🚉', aeroporto: '✈️', porto: '⚓', centro: '📍' };
// Destinazioni "Dove" da tutti i punti di ritiro ufficiali: per ogni città, la
// città stessa + stazione/aeroporto/porto/centro, con sottotitolo "Città, Regione, Italia".
const ALL_DEST = CITTA_LIST.flatMap(c => {
  const sub = `${c.nome}, ${c.regione}, Italia`;
  return [
    { id: `city-${c.slug}`, emoji: '🏙️', label: c.nome, sub, value: c.nome },
    ...c.puntiRitiro.map(p => ({
      id: `${c.slug}-${p.tipo}-${p.nome}`,
      emoji: TYPE_EMOJI[p.tipo] || '📍',
      label: p.codiceIata ? `${p.nome} (${p.codiceIata})` : p.nome,
      sub,
      value: p.nome,
    })),
  ];
});

function ScreenHeader({ T, title, onBack, right }) {
  return (
    <div style={{
      flex: 'none',
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px',
      background: T.bg,
      borderBottom: `1px solid ${T.line}`,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 6,
          margin: '-6px 0 -6px -6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
        </button>
      )}
      {title && <H T={T} size="h5" style={{ flex: 1 }}>{title}</H>}
      {right}
    </div>
  );
}

export function LocationPicker({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search, updateSearch } = useSearch();
  const [query, setQuery] = useState(search.location || '');
  const recentQ = useAsync(listRecentLocations, []);
  const RECENT_LOCATIONS = recentQ.data ?? [];
  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const filtered = q.length >= 1
    ? ALL_DEST.filter(d => d.label.toLowerCase().includes(q) || d.sub.toLowerCase().includes(q)).slice(0, 30)
    : [];
  const showFreeText =
    trimmed.length >= 2 &&
    !filtered.some(d => d.value.toLowerCase() === q);

  const choose = (l) => {
    updateSearch({ location: l });
    analyticsEvents.locationSearched({ location: l });
    navigate(-1);
  };

  // Geolocalizzazione reale del browser → città (no Milano fisso).
  const useCurrentPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocodeCity(pos.coords.latitude, pos.coords.longitude).catch(() => null);
        if (city) choose(city);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const inner = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      {!isDesktop && <ScreenHeader T={T} title={t('locationpicker.title')} onBack={() => navigate(-1)} />}
      {isDesktop && (
        <div style={{ padding: '20px 24px 6px' }}>
          <H T={T} size="h3">{t('locationpicker.title')}</H>
        </div>
      )}

      <div style={{ flex: 'none', padding: '14px 16px 0' }}>
        <div style={{
          background: T.surface, border: `1.5px solid ${T.ink1}`,
          borderRadius: T.r.pill, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: T.sh.soft,
        }}>
          <Icon name="search" size={16} color={T.ink1} T={T} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder={t('locationpicker.search_ph')}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: T.fontBody, fontSize: 15, fontWeight: 500, color: T.ink1,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
              <Icon name="x" size={14} color={T.ink2} T={T} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px' }}>
        <button onClick={useCurrentPosition} style={{
          width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
          padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${T.line}`,
        }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pin" size={18} color={T.accentDeep} T={T} />
          </span>
          <div style={{ textAlign: 'left' }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{t('locationpicker.use_current')}</Txt>
            <Txt T={T} size={12} color={T.ink2}>{t('locationpicker.demo_sub')}</Txt>
          </div>
        </button>

        {showFreeText && (
          <>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ display: 'block', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('common.search')}</Txt>
            <button onClick={() => choose(trimmed)} style={{
              width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
              borderBottom: `1px solid ${T.line}`,
            }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="search" size={18} color={T.accentDeep} T={T} />
              </span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{t('locationpicker.search_for', { q: trimmed })}</Txt>
                <Txt T={T} size={12} color={T.ink2}>{t('locationpicker.use_as_dest')}</Txt>
              </div>
              <Icon name="chevron" size={16} color={T.ink2} T={T} />
            </button>
          </>
        )}

        {filtered.length > 0 && (
          <>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ display: 'block', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('locationpicker.suggested')}</Txt>
            {filtered.map(d => (
              <button key={d.id} onClick={() => choose(d.value)} style={{
                width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
                borderBottom: `1px solid ${T.line}`,
              }}>
                <span style={{ width: 24, textAlign: 'center', fontSize: 18, flex: 'none' }}>{d.emoji}</span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <Txt T={T} size={14} weight={500} style={{ display: 'block' }}>{d.label}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{d.sub}</Txt>
                </div>
              </button>
            ))}
          </>
        )}

        {!query && RECENT_LOCATIONS.length > 0 && (
          <>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ display: 'block', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('locationpicker.recent')}</Txt>
            {RECENT_LOCATIONS.map((l, i) => (
              <button key={i} onClick={() => choose(l.l)} style={{
                width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
                borderBottom: `1px solid ${T.line}`,
              }}>
                <Icon name="calendar" size={18} color={T.ink3} T={T} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <Txt T={T} size={14} weight={500} style={{ display: 'block' }}>{l.l}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{l.sub}</Txt>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return <DesktopModal T={T} ariaLabel={t('locationpicker.choose_dest')} width={520} height={620}>{inner}</DesktopModal>;
  }
  return inner;
}
