import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../state/SearchContext.jsx';

function EmptyResults({ T, hasCategory, hasFilters, hasLocation, locationLabel, onClearCategory, onClearLocation, onClearFilters, onOpenSheet }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="search" size={26} color={T.ink2} T={T} />
      </span>
      <H T={T} size="h4">{t('listing.no_results')}</H>
      <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.5, maxWidth: 360 }}>
        {hasLocation
          ? t('listing.no_cars_for', { location: locationLabel })
          : t('listing.widen_filters')}
      </Txt>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {hasLocation && (
          <Button T={T} variant="outline" size="sm" icon="x" onClick={onClearLocation}>
            {t('listing.clear_location')}
          </Button>
        )}
        {hasCategory && (
          <Button T={T} variant="outline" size="sm" icon="x" onClick={onClearCategory}>
            {t('listing.clear_category')}
          </Button>
        )}
        {hasFilters && (
          <Button T={T} variant="outline" size="sm" icon="x" onClick={onClearFilters}>
            {t('listing.clear_filters')}
          </Button>
        )}
        <Button T={T} variant="primary" size="sm" onClick={onOpenSheet}>
          {t('listing.open_filters')}
        </Button>
      </div>
    </div>
  );
}

import { Icon, CarRender } from '../components/icons.jsx';
import { cldUrl, cldSrcSet } from '../lib/cloudinary.js';
import { useSeo } from '../lib/seo.js';

// Copertina: prima immagine Cloudinary se presente, altrimenti illustrazione.
function CarCover({ T, car, w = 600 }) {
  const cover = car.images?.[0];
  if (cover) {
    return (
      <img
        src={cldUrl(cover.public_id, { w }) || cover.url}
        srcSet={cldSrcSet(cover.public_id, [300, 600, 900])}
        sizes="(max-width: 768px) 50vw, 33vw"
        alt={`${car.brand} ${car.model}`}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return <CarRender T={T} variant={car.variant} tone={car.tone} />;
}
import { Chip, Button, Badge, H, Txt, Avatar, Rating, Price } from '../components/ui.jsx';
import { FiltersSheet } from '../components/FiltersSheet.jsx';
import { LocationField } from '../components/LocationField.jsx';
import { CarCardSkeleton } from '../components/Skeleton.jsx';
const LeafletMap = lazy(() => import('../components/LeafletMap.jsx').then(m => ({ default: m.LeafletMap })));
import { useAsync } from '../hooks/useAsync.js';
import { useUserLocation } from '../hooks/useUserLocation.js';
import { trackEvent } from '../services/admin.js';
import { getSessionAnonIds } from '../hooks/useSessionTracking.js';
import { listCars, getHostsByIds } from '../services/cars.js';
import { listNearestHosts } from '../services/catalog.js';
import { formatDates } from '../utils/dates.js';

function toggleSet(s, v) {
  const n = new Set(s);
  if (n.has(v)) n.delete(v); else n.add(v);
  return n;
}

function HeartButton({ T, active, onClick, align = 'right' }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} aria-label={active ? t('saved.remove_aria') : t('home.save_aria')} aria-pressed={active} style={{
      position: 'absolute', top: 8,
      ...(align === 'left' ? { left: 8 } : { right: 8 }),
      border: active ? `1px solid ${T.coral}` : 'none', cursor: 'pointer',
      width: 30, height: 30, borderRadius: '50%',
      background: active ? 'rgba(238,93,63,0.16)' : 'rgba(255,255,255,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: T.sh.soft, transition: 'background 150ms, transform 150ms',
    }}>
      <Icon name={active ? 'heartFill' : 'heart'} size={15} color={active ? T.coral : T.ink1} T={T} />
    </button>
  );
}

function MapBg({ T }) {
  const bg = '#EFEAD8', road = '#FFFCF2', roadStroke = '#D8D0B6', park = '#C8D4B0', water = '#CFDDE9';
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <path d="M 540 60 Q 640 70 660 160 Q 640 230 540 220 L 510 180 Z" fill={park} />
        <circle cx="220" cy="450" r="60" fill={park} />
        <path d="M 0 500 Q 200 480 380 510 T 800 480 L 800 600 L 0 600 Z" fill={water} />
        <g>
          <path d="M 0 200 Q 200 180 380 220 T 800 190" strokeWidth="14" fill="none" stroke={road} />
          <path d="M 0 380 Q 250 360 460 390 T 800 360" strokeWidth="14" fill="none" stroke={road} />
          <path d="M 200 0 Q 220 200 240 380 T 220 600" strokeWidth="10" fill="none" stroke={road} />
          <path d="M 500 0 Q 530 200 560 400 T 540 600" strokeWidth="10" fill="none" stroke={road} />
        </g>
        <g stroke={roadStroke} strokeWidth="3" fill="none" opacity="0.6">
          <path d="M 80 100 L 320 130" />
          <path d="M 380 280 L 600 300" />
          <path d="M 420 80 L 480 320" />
          <path d="M 100 280 L 280 470" />
        </g>
      </svg>
    </div>
  );
}

function MapPin({ T, x, y, price, active, onClick }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)', zIndex: active ? 10 : 1 }} onClick={onClick}>
      <div style={{
        background: active ? T.ink1 : T.surface,
        color: active ? '#fff' : T.ink1,
        border: `1.4px solid ${active ? T.ink1 : T.line}`,
        borderRadius: T.r.pill,
        padding: active ? '6px 14px' : '4px 10px',
        fontFamily: T.fontBody, fontWeight: 700, fontSize: active ? 14 : 12,
        boxShadow: T.sh.raised,
        whiteSpace: 'nowrap', cursor: 'pointer',
      }}>{price}€</div>
      <div style={{
        position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%) rotate(45deg)',
        width: 8, height: 8, background: active ? T.ink1 : T.surface,
        borderRight: `1.4px solid ${active ? T.ink1 : T.line}`,
        borderBottom: `1.4px solid ${active ? T.ink1 : T.line}`,
        marginTop: -4,
      }} />
    </div>
  );
}

function VehicleCardDesktop({ T, car, host, saved, toggleSaved, onClick }) {
  const { t } = useTranslation();
  return (
    <div onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, overflow: 'hidden', boxShadow: T.sh.soft, cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', aspectRatio: '1.5 / 1' }}>
        <CarCover T={T} car={car} />
        <HeartButton T={T} active={saved.has(car.id)} onClick={(e) => { e.stopPropagation(); toggleSaved(car.id); }} />
        {car.hot && (
          <span style={{ position: 'absolute', top: 8, left: 8 }}>
            <Badge T={T} tone="dark" icon="bolt">{t('home.available_now')}</Badge>
          </span>
        )}
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model} · {car.year}</Txt>
            <Txt T={T} size={12} color={T.ink2}>{host?.n || '…'}{car.distance ? ` · ${car.distance}` : ''}</Txt>
          </div>
          <Rating T={T} value={host?.rating || 0} size={12} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip T={T} size="sm">{car.fuel}</Chip>
          <Chip T={T} size="sm">{car.transmission}</Chip>
        </div>
        <div style={{ marginTop: 2 }}>
          <Price T={T} value={car.pricePerDay} unit={t('common.per_day')} size="md" weight={700} />
        </div>
      </div>
    </div>
  );
}

function VehicleListCardMobile({ T, car, hosts, saved, toggleSaved, onClick }) {
  const { t } = useTranslation();
  const host = hosts[car.host] || { n: '—', rating: 0 };
  return (
    <div onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, padding: 10, display: 'flex', gap: 10,
      boxShadow: T.sh.soft, cursor: 'pointer',
    }}>
      <div style={{ width: 110, flex: 'none' }}>
        <div style={{ position: 'relative', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
          <CarCover T={T} car={car} w={300} />
          <HeartButton T={T} active={saved.has(car.id)} onClick={(e) => { e.stopPropagation(); toggleSaved(car.id); }} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ minWidth: 0 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model} · {car.year}</Txt>
            <Txt T={T} size={11} color={T.ink2}>{host.n}{car.distance ? ` · ${car.distance}` : ''}</Txt>
          </div>
          <Rating T={T} value={host.rating} size={11} />
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
          <Chip T={T} size="sm">{car.fuel}</Chip>
          <Chip T={T} size="sm">{car.transmission}</Chip>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
          <Price T={T} value={car.pricePerDay} unit={t('common.per_day')} size="md" weight={700} />
          {car.hot && <Badge T={T} tone="success" icon="bolt">{t('common.today')}</Badge>}
        </div>
      </div>
    </div>
  );
}

function FilterChips({ T, filters, setFilters, fuelOptions, onOpenSheet }) {
  const { t } = useTranslation();
  const activeCount =
    (filters.priceMax < 100 ? 1 : 0) +
    (filters.fuels.size > 0 ? 1 : 0) +
    (filters.transmission !== 'all' ? 1 : 0);
  return (
    <div style={{ display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 2, alignItems: 'center' }}>
      <button onClick={onOpenSheet} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
        background: activeCount > 0 ? T.ink1 : T.surface,
        color: activeCount > 0 ? '#fff' : T.ink1,
        border: `1px solid ${activeCount > 0 ? T.ink1 : T.line}`,
        borderRadius: T.r.pill, cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          {t('common.filter')}{activeCount > 0 ? ` · ${activeCount}` : ''}
        </span>
      </button>
      <button onClick={onOpenSheet} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', flex: 'none' }}>
        <Chip T={T} size="sm" active={filters.priceMax < 100} icon={filters.priceMax < 100 ? 'check' : undefined}
          onClose={filters.priceMax < 100 ? () => setFilters({ ...filters, priceMax: 100 }) : undefined}>
          {filters.priceMax < 100 ? t('listing.under_price', { price: filters.priceMax }) : t('listing.price')}
        </Chip>
      </button>
      {fuelOptions.map(f => {
        const active = filters.fuels.has(f);
        return (
          <button key={f}
            onClick={() => setFilters({ ...filters, fuels: toggleSet(filters.fuels, f) })}
            style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', flex: 'none' }}>
            <Chip T={T} size="sm" active={active} icon={active ? 'check' : undefined}>
              {f}
            </Chip>
          </button>
        );
      })}
    </div>
  );
}

function MapMiniCard({ T, car, host, saved, toggleSaved, onClick, onClose, pinPos, containerSize }) {
  const { t } = useTranslation();
  const CARD_W = 200;
  const CARD_H_EST = 290;     // fallback se non ancora misurata
  const PIN_OFFSET = 16;      // distanza tra tip del pin e card
  const MARGIN = 10;          // margine dai bordi del container
  const TAIL = 9;             // lato del rombo della freccia

  const cardRef = useRef(null);
  const [cardH, setCardH] = useState(CARD_H_EST);

  // Misura l'altezza reale della card a ogni render + ResizeObserver
  // per riallineare quando l'immagine carica o il contenuto cambia.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => setCardH(prev => {
      const h = el.offsetHeight;
      return h && Math.abs(h - prev) > 0.5 ? h : prev;
    });
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [car?.id]);

  if (!car || !pinPos || !containerSize) return null;

  // Decide se la card va sopra o sotto il pin (se non c'è spazio sopra).
  const spaceAbove = pinPos.y;
  const spaceBelow = containerSize.h - pinPos.y;
  const placeBelow = spaceAbove < cardH + PIN_OFFSET + MARGIN && spaceBelow > spaceAbove;

  // Posizionamento orizzontale: centrato sul pin, clampato ai bordi.
  let left = pinPos.x - CARD_W / 2;
  left = Math.max(MARGIN, Math.min(left, containerSize.w - CARD_W - MARGIN));
  const tailLeft = pinPos.x - left;  // posizione X della freccia, relativa alla card

  const top = placeBelow
    ? pinPos.y + PIN_OFFSET
    : pinPos.y - cardH - PIN_OFFSET;

  return (
    <div ref={cardRef} style={{
      position: 'absolute', left, top,
      width: CARD_W,
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, boxShadow: '0 14px 32px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.06)',
      overflow: 'visible', zIndex: 1000, cursor: 'pointer',
    }} onClick={onClick}>
      {/* freccia che punta al pin */}
      <span aria-hidden="true" style={{
        position: 'absolute',
        left: Math.max(12, Math.min(tailLeft, CARD_W - 12)) - TAIL,
        ...(placeBelow
          ? { top: -TAIL, borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }
          : { bottom: -TAIL, borderBottom: `1px solid ${T.line}`, borderRight: `1px solid ${T.line}` }
        ),
        width: TAIL * 2, height: TAIL * 2,
        background: T.surface,
        transform: 'rotate(45deg)',
      }} />
      <div style={{ position: 'relative', borderRadius: T.r.lg, overflow: 'hidden' }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label={t('listing.close_preview')}
          style={{
            position: 'absolute', top: 6, right: 6, zIndex: 2,
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: T.sh.soft,
          }}
        >
          <Icon name="x" size={12} color={T.ink1} T={T} />
        </button>
        {/* Foto in alto, quadrata */}
        <div style={{ position: 'relative', aspectRatio: '1 / 1' }}>
          <CarCover T={T} car={car} w={400} />
          <HeartButton T={T} active={saved.has(car.id)} align="left" onClick={(e) => { e.stopPropagation(); toggleSaved(car.id); }} />
          {car.hot && (
            <span style={{ position: 'absolute', bottom: 6, left: 6 }}>
              <Badge T={T} tone="dark" icon="bolt">{t('listing.now')}</Badge>
            </span>
          )}
        </div>
        {/* Contenuto verticale */}
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ minWidth: 0 }}>
            <Txt T={T} size={13} weight={600} style={{ display: '-webkit-box', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {car.brand} {car.model}
            </Txt>
            <Txt T={T} size={11} color={T.ink3} style={{ display: 'block' }}>{car.year}{car.distance ? ` · ${car.distance}` : ''}</Txt>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Txt T={T} size={11} color={T.ink2} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{host?.n || '…'}</Txt>
            <Rating T={T} value={host?.rating || 0} size={11} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Chip T={T} size="sm">{car.fuel}</Chip>
            <Chip T={T} size="sm">{car.transmission}</Chip>
          </div>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 8, marginTop: 2 }}>
            <Price T={T} value={car.pricePerDay} unit={t('common.per_day')} size="md" weight={700} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingDesktop({ T, cars, hosts, allCount, search, dateLabel, filters, setFilters, saved, toggleSaved, view, setView, userLoc, onSearchLocation, onPickLocation, onSearchDate, onCar, onOpenSheet, onClearCategory, onClearLocation, onClearFilters, loading }) {
  const { t } = useTranslation();
  const [pinned, setPinned] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [pinPos, setPinPos] = useState(null);
  const [mapSize, setMapSize] = useState(null);
  const mapColRef = useRef(null);
  // Quando la lista cambia (filtro/ricerca) la card si chiude e
  // il pin attivo si resetta se non è più tra i risultati.
  useEffect(() => {
    setCardOpen(false);
    if (pinned && !cars.some(c => c.id === pinned)) setPinned(null);
  }, [cars.length]); // eslint-disable-line react-hooks/exhaustive-deps
  // Misura il container mappa per clamp della card.
  useEffect(() => {
    const el = mapColRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      setMapSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pinnedCar = cars.find(c => c.id === pinned);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ padding: '14px 40px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', flex: 1, maxWidth: 720,
          background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: T.r.lg, padding: 4, boxShadow: T.sh.soft,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <LocationField T={T} variant="desktop" flex={1} value={search.location} onChange={onPickLocation} />
          </div>
          <span style={{ width: 1, alignSelf: 'stretch', background: T.line, margin: '4px 0' }} />
          <div onClick={onSearchDate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', minWidth: 0, cursor: 'pointer', flex: 1.4 }}>
            <Icon name="calendar" size={14} color={T.ink2} T={T} />
            <Txt T={T} size={13} weight={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{dateLabel || t('home.when_ph')}</Txt>
          </div>
          <Button T={T} variant="primary" size="sm" icon="search" style={{ marginLeft: 4 }}>{t('common.search')}</Button>
        </div>
        <div style={{ flex: 1 }} />
        <Txt T={T} size={13} color={T.ink2}>{t('listing.results_count', { count: allCount })}</Txt>
        <div style={{ display: 'flex', background: T.surfaceAlt, padding: 3, borderRadius: T.r.pill, border: `1px solid ${T.line}` }}>
          <button onClick={() => setView('list')} aria-label={t('listing.view_list_aria')} aria-pressed={view === 'list'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', border: 'none',
            background: view === 'list' ? T.surface : 'transparent', color: view === 'list' ? T.ink1 : T.ink2,
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, borderRadius: T.r.pill, cursor: 'pointer',
            boxShadow: view === 'list' ? T.sh.soft : 'none',
          }}>
            <Icon name="grid" size={13} color="currentColor" T={T} /> {t('listing.list')}
          </button>
          <button onClick={() => setView('split')} aria-label={t('listing.view_map_aria')} aria-pressed={view === 'split'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', border: 'none',
            background: view === 'split' ? T.surface : 'transparent', color: view === 'split' ? T.ink1 : T.ink2,
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, borderRadius: T.r.pill, cursor: 'pointer',
            boxShadow: view === 'split' ? T.sh.soft : 'none',
          }}>
            <Icon name="map" size={13} color="currentColor" T={T} /> {t('nav.map')}
          </button>
        </div>
      </div>
      <div style={{ padding: '12px 40px', borderBottom: `1px solid ${T.line}` }}>
        <FilterChips T={T} filters={filters} setFilters={setFilters} fuelOptions={['Benzina','Hybrid','Elettrica','Diesel']} onOpenSheet={onOpenSheet} />
      </div>

      {view === 'split' ? (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ overflow: 'auto', padding: '20px 24px 20px 40px' }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {[0,1,2,3,4,5].map(i => <CarCardSkeleton key={i} T={T} />)}
              </div>
            ) : cars.length === 0 ? (
              <EmptyResults T={T}
                hasCategory={!!search.category}
                hasLocation={!!search.location} locationLabel={search.location}
                hasFilters={filters.priceMax < 100 || filters.fuels.size > 0 || filters.transmission !== 'all' || !!filters.brandId}
                onClearCategory={onClearCategory}
                onClearLocation={onClearLocation}
                onClearFilters={onClearFilters}
                onOpenSheet={onOpenSheet} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {cars.map(c => (
                  <VehicleCardDesktop key={c.id} T={T} car={c} host={hosts[c.host]}
                    saved={saved} toggleSaved={toggleSaved} onClick={() => onCar(c.id)} />
                ))}
              </div>
            )}
          </div>
          <div ref={mapColRef} style={{ position: 'relative', overflow: 'hidden', borderLeft: `1px solid ${T.line}` }}>
            <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surfaceAlt }}><Txt T={T} size={13} color={T.ink3}>{t('listing.loading_map')}</Txt></div>}>
              <LeafletMap
                T={T} cars={cars} activeId={pinned}
                onPinClick={(id) => { setPinned(id); setCardOpen(true); }}
                onActivePinPosition={setPinPos}
                center={userLoc}
                style={{ height: '100%' }}
              />
            </Suspense>
            {cardOpen && pinnedCar && (
              <MapMiniCard
                T={T} car={pinnedCar} host={hosts[pinnedCar.host]}
                saved={saved} toggleSaved={toggleSaved}
                onClick={() => onCar(pinnedCar.id)}
                onClose={() => setCardOpen(false)}
                pinPos={pinPos}
                containerSize={mapSize}
              />
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 40px' }}>
          {cars.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Icon name="search" size={32} color={T.ink3} T={T} />
              <H T={T} size="h4" style={{ marginTop: 8 }}>{t('listing.no_results')}</H>
              <Txt T={T} size={13} color={T.ink2}>{t('listing.try_widen')}</Txt>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {cars.map(c => (
                <VehicleCardDesktop key={c.id} T={T} car={c} host={hosts[c.host]}
                  saved={saved} toggleSaved={toggleSaved} onClick={() => onCar(c.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ListingInitialMobile({ T, cars, nearest, hosts, saved, toggleSaved, onSearchLocation, onCar, onHome }) {
  const { t } = useTranslation();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 'none', padding: '12px 14px 14px', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onHome} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="chevronLeft" size={20} color={T.ink1} T={T} />
          </button>
          <div onClick={onSearchLocation} style={{
            flex: 1, background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.pill, padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            boxShadow: T.sh.soft,
          }}>
            <Icon name="search" size={14} color={T.ink2} T={T} />
            <Txt T={T} size={13} color={T.ink3}>{t('listing.add_destination')}</Txt>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '16px 18px 8px' }}>
          <Badge T={T} tone="accent" icon="pin">{t('listing.current_location')} · Milano</Badge>
          <H T={T} size="h3" style={{ marginTop: 10, lineHeight: 1.1 }}>{t('listing.hosts_near')}</H>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
            {t('listing.set_dates_hint')}
          </Txt>
        </div>
        <div style={{ padding: '8px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearest.map((h, i) => {
            const host = hosts[h.host] || { n: '…', rating: 0, id: h.host };
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 14, background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: T.r.lg, boxShadow: T.sh.soft, cursor: 'pointer',
              }}>
                <Avatar T={T} name={host.n} size={48} tone={host.id === 'greencar' ? 'accent' : undefined} />
                <div style={{ flex: 1 }}>
                  <Txt T={T} size={15} weight={600} style={{ display: 'block' }}>{host.n}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>
                    <Rating T={T} value={host.rating} size={11} color={T.ink2} /> · {t('listing.cars_count', { count: h.cars })} · {t('listing.at')} {h.distance}
                  </Txt>
                </div>
                <Icon name="chevron" size={18} color={T.ink2} T={T} />
              </div>
            );
          })}
        </div>
        <div style={{ padding: '0 18px 4px' }}>
          <H T={T} size="h4">{t('listing.available_today')}</H>
        </div>
        <div style={{ padding: '12px 0 24px 18px', display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18 }}>
          {cars.slice(0, 4).map(c => (
            <div key={c.id} onClick={() => onCar(c.id)} style={{ minWidth: 180, flex: 'none', cursor: 'pointer' }}>
              <div style={{ width: 180, height: 110, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
                <CarRender T={T} variant={c.variant} tone={c.tone} />
                <HeartButton T={T} active={saved.has(c.id)} onClick={(e) => { e.stopPropagation(); toggleSaved(c.id); }} />
              </div>
              <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.brand} {c.model}</Txt>
              <Txt T={T} size={11} color={T.ink2}>{c.distance}</Txt>
              <Price T={T} value={c.pricePerDay} unit={t('common.per_day')} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingMobile({ T, cars, hosts, search, dateLabel, filters, setFilters, saved, toggleSaved, onCar, onSearchLocation, onHome, userLoc, onOpenSheet, onClearCategory, onClearLocation, onClearFilters, loading }) {
  const { t } = useTranslation();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 'none', padding: '10px 14px 12px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onHome} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="chevronLeft" size={20} color={T.ink1} T={T} />
          </button>
          <div onClick={onSearchLocation} style={{
            flex: 1, background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.pill, padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: T.sh.soft, cursor: 'pointer',
          }}>
            <Icon name="search" size={14} color={T.ink2} T={T} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Txt T={T} size={13} weight={600} style={{ display: 'block', lineHeight: 1 }}>
                {search.location || (userLoc?.city ? t('listing.near_city', { city: userLoc.city }) : t('listing.all_cities'))}
              </Txt>
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1 }}>
                {dateLabel || t('listing.flexible_dates')} · {t('listing.cars_count', { count: cars.length })}
              </Txt>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <FilterChips T={T} filters={filters} setFilters={setFilters} fuelOptions={['Benzina','Hybrid','Elettrica','Diesel']} onOpenSheet={onOpenSheet} />
        </div>
        <Txt T={T} size={12} weight={600} style={{ display: 'block', marginTop: 10 }}>{t('listing.results_count', { count: cars.length })}</Txt>
      </div>

      {loading ? (
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0,1,2,3,4].map(i => <CarCardSkeleton key={i} T={T} layout="row" />)}
        </div>
      ) : cars.length === 0 ? (
        <div style={{ flex: 1, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyResults T={T}
            hasCategory={!!search.category}
            hasLocation={!!search.location} locationLabel={search.location}
            hasFilters={filters.priceMax < 100 || filters.fuels.size > 0 || filters.transmission !== 'all' || !!filters.brandId}
            onClearCategory={onClearCategory}
            onClearLocation={onClearLocation}
            onClearFilters={onClearFilters}
            onOpenSheet={onOpenSheet} />
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cars.map(c => (
            <VehicleListCardMobile key={c.id} T={T} car={c} hosts={hosts}
              saved={saved} toggleSaved={toggleSaved} onClick={() => onCar(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Listing({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search, updateSearch, filters, setFilters, saved, toggleSaved } = useSearch();
  const [view, setView] = useState('split');
  const [sheetOpen, setSheetOpen] = useState(false);

  useSeo({
    title: search.location ? t('listing.seo_title_location', { location: search.location }) : t('listing.seo_title_default'),
    description: search.location
      ? t('listing.seo_desc_location', { location: search.location })
      : t('listing.seo_desc_default'),
  });

  const allCarsQ = useAsync(listCars, []);
  const allCars = allCarsQ.data ?? [];

  const cars = useMemo(() => {
    let list = allCars;
    if (search.category) list = list.filter(c => c.category === search.category);
    if (search.location) {
      // Match parziale case-insensitive su city / distance / pickupLocation
      const loc = search.location.toLowerCase();
      // Token primario (prima virgola o trattino o ·)
      const primary = loc.split(/[,·\-]/)[0].trim();
      list = list.filter(c => {
        const haystack = [c.city, c.pickupLocation, c.distance].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(primary);
      });
    }
    if (filters.brandId) list = list.filter(c => c.brandId === filters.brandId);
    if (filters.priceMax < 100) list = list.filter(c => c.pricePerDay <= filters.priceMax);
    if (filters.fuels.size) list = list.filter(c => filters.fuels.has(c.fuel));
    if (filters.transmission && filters.transmission !== 'all') {
      list = list.filter(c => c.transmission.startsWith(filters.transmission));
    }
    return list;
  }, [allCars, search.category, search.location, filters]);

  const hostIdsKey = useMemo(() => [...new Set(cars.map(c => c.host))].sort().join(','), [cars]);
  const hostsQ = useAsync(() => getHostsByIds(hostIdsKey ? hostIdsKey.split(',') : []), [hostIdsKey]);
  const hosts = hostsQ.data ?? {};

  const dateLabel = formatDates(search.from, search.to);
  const hasSearch = search.location || dateLabel || search.category;

  // Mobile initial state quando manca ricerca
  if (!isDesktop && !hasSearch) {
    return <InitialMobile T={T} navigate={navigate} saved={saved} toggleSaved={toggleSaved} />;
  }

  const loading = allCarsQ.loading;
  const userLoc = useUserLocation();

  // Track search event when filtri/location/categoria cambiano (debounced naturalmente da React).
  useEffect(() => {
    if (loading) return;
    const ids = getSessionAnonIds();
    trackEvent('search', {
      ...ids,
      category: search.category,
      location: search.location,
      brandId: filters.brandId,
      fuels: filters.fuels?.size ? Array.from(filters.fuels) : null,
      priceMax: filters.priceMax,
    });
  }, [loading, search.category, search.location, filters.brandId, filters.priceMax, filters.fuels]);

  const common = {
    T, cars, hosts, search, dateLabel, filters, setFilters, saved, toggleSaved, loading,
    userLoc: userLoc.loc,
    onCar: (id) => {
      const ids = getSessionAnonIds();
      trackEvent('car_click', { ...ids, carId: id });
      navigate(`/auto/${id}`);
    },
    onSearchLocation: () => navigate('/cerca/dove'),
    onPickLocation: (loc) => updateSearch({ location: loc }),
    onSearchDate: () => navigate('/cerca/quando'),
    onHome: () => navigate('/'),
    onOpenSheet: () => setSheetOpen(true),
    onClearCategory: () => updateSearch({ category: null }),
    onClearLocation: () => updateSearch({ location: null }),
    onClearFilters: () => setFilters({ priceMax: 100, fuels: new Set(), transmission: 'all', brandId: null }),
  };

  return (
    <>
      {isDesktop
        ? <ListingDesktop {...common} allCount={cars.length} view={view} setView={setView} />
        : <ListingMobile {...common} />}
      <FiltersSheet
        T={T}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        setFilters={setFilters}
        isDesktop={isDesktop}
        resultCount={cars.length}
      />
    </>
  );
}

function InitialMobile({ T, navigate, saved, toggleSaved }) {
  const carsQ = useAsync(listCars, []);
  const nearestQ = useAsync(listNearestHosts, []);
  const cars = carsQ.data ?? [];
  const nearest = nearestQ.data ?? [];
  const hostIds = nearest.map(n => n.host);
  const hostIdsKey = hostIds.sort().join(',');
  const hostsQ = useAsync(() => getHostsByIds(hostIdsKey ? hostIdsKey.split(',') : []), [hostIdsKey]);
  const hosts = hostsQ.data ?? {};

  return (
    <ListingInitialMobile T={T} cars={cars} nearest={nearest} hosts={hosts}
      saved={saved} toggleSaved={toggleSaved}
      onSearchLocation={() => navigate('/cerca/dove')}
      onCar={(id) => navigate(`/auto/${id}`)}
      onHome={() => navigate('/')} />
  );
}
