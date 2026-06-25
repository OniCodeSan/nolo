import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../state/SearchContext.jsx';
import { Icon, CarRender } from '../components/icons.jsx';
import { Logo, Badge, H, Txt, Button, Price } from '../components/ui.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { CarCardSkeleton } from '../components/Skeleton.jsx';
import { useUserLocation } from '../hooks/useUserLocation.js';
import { LocationField } from '../components/LocationField.jsx';
import { cldUrl, cldSrcSet } from '../lib/cloudinary.js';
import { listCars } from '../services/cars.js';
import { listCategories } from '../services/catalog.js';
import { formatDates, monthName } from '../utils/dates.js';
import { events as analyticsEvents } from '../lib/analytics.js';
import { useSeo, organizationJsonLd } from '../lib/seo.js';

function formatSingleDate(d) {
  if (!d) return null;
  return `${d.d} ${monthName(d.m)}`;
}

function CategoryDropdown({ T, value, categories, onPick, onSeeAll }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  const current = categories.find(c => c.id === value);
  return (
    <div ref={ref} style={{ position: 'relative', flex: 1.1, minWidth: 0 }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('home.choose_type_aria')}
        style={{
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4,
          borderRadius: T.r.md,
        }}
      >
        <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('home.type')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: current ? T.ink1 : T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {current?.l || t('home.all_categories')}
          </span>
          <span style={{ fontSize: 12, color: T.ink3 }}>▾</span>
        </span>
      </button>
      {open && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
          background: T.bg, border: `1px solid ${T.line}`, borderRadius: T.r.md,
          boxShadow: T.sh.deep, padding: 6, maxHeight: 320, overflow: 'auto',
        }}>
          <button onClick={() => { onPick(null); setOpen(false); }} style={{
            width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
            background: !value ? T.accentSoft : 'transparent',
            padding: '10px 12px', borderRadius: T.r.sm,
            fontFamily: T.fontBody, fontSize: 13, fontWeight: !value ? 600 : 500, color: T.ink1,
          }}>
            {t('home.all_categories')}
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === value}
              onClick={() => { onPick(c.id); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                background: c.id === value ? T.accentSoft : 'transparent',
                padding: '10px 12px', borderRadius: T.r.sm,
                fontFamily: T.fontBody, fontSize: 13, fontWeight: c.id === value ? 600 : 500, color: T.ink1,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}
            >
              <span>{c.l}</span>
              <span style={{ fontSize: 11, color: T.ink3 }}>{t('home.from')} {c.fromPrice}€{c.id === 'mensile' ? t('home.per_month') : t('common.per_day')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeartButton({ T, active, onClick }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} aria-label={active ? t('saved.remove_aria') : t('home.save_aria')} aria-pressed={active} style={{
      position: 'absolute', top: 8, right: 8, cursor: 'pointer',
      border: active ? `1px solid ${T.coral}` : 'none',
      width: 30, height: 30, borderRadius: '50%',
      background: active ? 'rgba(238,93,63,0.16)' : 'rgba(255,255,255,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: T.sh.soft, transition: 'background 150ms, transform 150ms',
    }}>
      <Icon name={active ? 'heartFill' : 'heart'} size={15} color={active ? T.coral : T.ink1} T={T} />
    </button>
  );
}

function SearchRowMobile({ T, icon, label, value, placeholder, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      cursor: 'pointer', borderRadius: T.r.md,
    }}>
      <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <Icon name={icon} size={14} color={T.ink2} T={T} />}
        <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: placeholder ? T.ink3 : T.ink1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      </span>
    </div>
  );
}

function SearchFieldDesktop({ T, label, value, icon, suffix, placeholder, onClick, flex = 1 }) {
  return (
    <div onClick={onClick} style={{
      flex, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      cursor: 'pointer', borderRadius: T.r.md, minWidth: 0,
    }}>
      <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <Icon name={icon} size={14} color={T.ink2} T={T} />}
        <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: value ? T.ink1 : T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        {suffix && <span style={{ fontSize: 11, color: T.ink3 }}>{suffix}</span>}
      </span>
    </div>
  );
}

function Divider({ T }) {
  return <span style={{ width: 1, alignSelf: 'stretch', background: T.line, margin: '6px 0' }} />;
}

// Copertina auto per le card "vicino a te": foto reale se presente, altrimenti
// l'illustrazione di fallback.
function HomeCarCover({ T, car, w = 600 }) {
  const cover = car.images?.[0];
  if (cover) {
    return (
      <img
        src={cldUrl(cover.public_id, { w }) || cover.url}
        srcSet={cldSrcSet(cover.public_id, [300, 600]) || undefined}
        alt={`${car.brand} ${car.model}`}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return <CarRender T={T} variant={car.variant} tone={car.tone} />;
}

function HomeDesktop({ T, search, dateLabel, cars, categories, userCity, saved, toggleSaved, onSearchLocation, onPickLocation, onSearchDate, onListing, onCategory, onCar, onPickCategoryInline }) {
  const { t } = useTranslation();
  return (
    <div style={{ background: T.bg }}>
      <div style={{ padding: '56px 40px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ maxWidth: 780 }}>
          {userCity && cars.length > 0 && (
            <Badge T={T} tone="accent" icon="sparkle">{t('home.hero_badge_desktop', { count: cars.length, city: userCity })}</Badge>
          )}
          <H T={T} size="display" style={{ marginTop: 16 }}>
            {t('home.hero_title_1')} <span style={{ background: T.accent, padding: '0 12px', borderRadius: 8 }}>{t('home.hero_title_2')}</span>
          </H>
          <Txt T={T} size={16} color={T.ink2} style={{ marginTop: 14, display: 'block', maxWidth: 560 }}>
            {t('home.hero_subtitle')}
          </Txt>
        </div>

        <div style={{
          marginTop: 36, background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: T.r.lg, padding: 8,
          boxShadow: T.sh.raised,
          display: 'flex', alignItems: 'stretch', gap: 0,
          maxWidth: 980,
        }}>
          <LocationField T={T} variant="desktop" flex={1.5} value={search.location} onChange={onPickLocation} />
          <Divider T={T} />
          <SearchFieldDesktop T={T} label={t('home.pickup')} value={search.from ? `${formatSingleDate(search.from)} · ${search.timeFrom || '10:00'}` : null} placeholder={t('home.pickup_ph')} icon="calendar" flex={1.3} onClick={onSearchDate} />
          <Divider T={T} />
          <SearchFieldDesktop T={T} label={t('home.return')} value={search.to ? `${formatSingleDate(search.to)} · ${search.timeTo || '18:00'}` : null} placeholder={t('home.return_ph')} icon="calendar" flex={1.3} onClick={onSearchDate} />
          <Divider T={T} />
          <CategoryDropdown T={T} value={search.category} categories={categories} onPick={onPickCategoryInline} onSeeAll={onListing} />
          <Button T={T} variant="accent" size="lg" icon="search" style={{ marginLeft: 8 }} onClick={onListing} aria-label={t('home.search_aria')}>{t('common.search')}</Button>
        </div>

        <div style={{ marginTop: 52 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <H T={T} size="h3">{t('home.explore_by_category')}</H>
            <Txt T={T} size={13} color={T.ink2} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={onListing}>
              {t('home.see_all')} <Icon name="chevron" size={13} color={T.ink2} T={T} />
            </Txt>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginTop: 20 }}>
            {categories.map(c => (
              <div key={c.id} onClick={() => onCategory(c.id)} style={{ cursor: 'pointer' }}>
                <div style={{ borderRadius: T.r.md, overflow: 'hidden', aspectRatio: '1.3 / 1', border: `1px solid ${T.line}` }}>
                  <CarRender T={T} variant={c.id === 'suv' || c.id === 'furgone' ? 'suv' : c.id === 'cabrio' || c.id === 'mensile' ? 'sedan' : 'hatch'} tone={c.tone} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <Txt T={T} size={14} weight={600}>{c.l}</Txt>
                  <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{t('home.from')} {c.fromPrice}€{c.id === 'mensile' ? t('home.per_month') : t('common.per_day')}</Txt>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 52 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <H T={T} size="h3">{t('home.near_you')}{userCity ? ` · ${userCity}` : ''}</H>
            <Txt T={T} size={13} color={T.ink2} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={onListing}>
              {t('home.see_all')} <Icon name="chevron" size={13} color={T.ink2} T={T} />
            </Txt>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20 }}>
            {cars.slice(0, 8).map(c => (
              <div key={c.id} onClick={() => onCar(c.id)} style={{
                background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: T.r.lg, overflow: 'hidden', boxShadow: T.sh.soft, cursor: 'pointer',
              }}>
                <div style={{ position: 'relative', aspectRatio: '1.5 / 1' }}>
                  <HomeCarCover T={T} car={c} />
                  <HeartButton T={T} active={saved.has(c.id)} onClick={(e) => { e.stopPropagation(); toggleSaved(c.id); }} />
                  {c.hot && (
                    <span style={{ position: 'absolute', top: 8, left: 8 }}>
                      <Badge T={T} tone="dark" icon="bolt">{t('home.available_now')}</Badge>
                    </span>
                  )}
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Txt T={T} size={14} weight={600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.brand} {c.model} · {c.year}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{c.distance}</Txt>
                  <Price T={T} value={c.pricePerDay} unit={t('common.per_day')} size="md" weight={700} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

function HomeMobile({ T, search, dateLabel, cars, categories, userCity, saved, toggleSaved, loading, onSearchLocation, onSearchDate, onListing, onCategory, onCar }) {
  const { t } = useTranslation();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 'none', padding: '14px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo T={T} size={18} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Icon name="bell" size={22} color={T.ink1} T={T} />
        </div>
      </div>

      <div>
        <div style={{ padding: '18px 18px 4px' }}>
          {cars.length > 0 && (
            <Badge T={T} tone="accent" icon="sparkle">{t('home.hero_badge_mobile', { count: cars.length })}</Badge>
          )}
          <H T={T} size="h2" style={{ marginTop: 10 }}>
            {t('home.hero_title_1')}<br/>
            <span style={{ background: T.accent, padding: '0 8px', borderRadius: 6 }}>{t('home.hero_title_2')}</span>
          </H>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.lg, padding: 10, boxShadow: T.sh.soft,
          }}>
            <SearchRowMobile T={T} icon="pin" label={t('home.where')} value={search.location || t('home.where_ph_mobile')} onClick={onSearchLocation} placeholder={!search.location} />
            <div style={{ height: 1, background: T.line, margin: '0 12px' }} />
            <SearchRowMobile T={T} icon="calendar" label={t('home.when')} value={dateLabel || t('home.when_ph')} onClick={onSearchDate} placeholder={!dateLabel} />
            <Button T={T} variant="accent" size="lg" icon="search" full style={{ marginTop: 8 }} onClick={onListing}>
              {search.location || dateLabel ? t('home.search_cars') : t('home.explore_near')}
            </Button>
          </div>
        </div>

        <div style={{ padding: '4px 0 12px 18px' }}>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>{t('home.categories')}</H>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18, paddingBottom: 4 }}>
              {loading && categories.length === 0 && [0, 1, 2, 3].map(i => (
                <div key={`sk-${i}`} className="moviq-skel" style={{ width: 110, height: 80, borderRadius: T.r.md, flex: 'none' }} />
              ))}
              {categories.map(c => (
                <div key={c.id} onClick={() => onCategory(c.id)} style={{ minWidth: 110, flex: 'none', cursor: 'pointer' }}>
                  <div style={{ width: 110, height: 80, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                    <CarRender T={T} variant={c.id === 'suv' ? 'suv' : c.id === 'cabrio' ? 'sedan' : 'hatch'} tone={c.tone} />
                  </div>
                  <Txt T={T} size={12} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.l}</Txt>
                  <Txt T={T} size={11} color={T.ink2}>{t('home.from')} {c.fromPrice}€{t('common.per_day_short')}</Txt>
                </div>
              ))}
            </div>
            <span aria-hidden style={{
              position: 'absolute', top: 0, right: 0, bottom: 4, width: 32,
              pointerEvents: 'none',
              background: `linear-gradient(to right, transparent, ${T.bg} 80%)`,
            }} />
          </div>
        </div>

        <div style={{ padding: '8px 0 24px 18px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            gap: 12, paddingRight: 18,
          }}>
            <H T={T} size="h4" style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1, minWidth: 0, fontSize: 18,
            }}>{t('home.near_you')}{userCity ? ` · ${userCity}` : ''}</H>
            <Txt T={T} size={12} color={T.ink2} onClick={onListing}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}>
              {t('home.see_all')}
            </Txt>
          </div>
          <div style={{ position: 'relative', marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18, paddingBottom: 4 }}>
              {loading && cars.length === 0 && [0, 1, 2].map(i => (
                <div key={`sk-${i}`} style={{ minWidth: 160, flex: 'none' }}>
                  <CarCardSkeleton T={T} />
                </div>
              ))}
              {cars.slice(0, 4).map(c => (
                <div key={c.id} onClick={() => onCar(c.id)} style={{ minWidth: 160, flex: 'none', cursor: 'pointer' }}>
                  <div style={{ width: 160, height: 100, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
                    <HomeCarCover T={T} car={c} />
                    <HeartButton T={T} active={saved.has(c.id)} onClick={(e) => { e.stopPropagation(); toggleSaved(c.id); }} />
                  </div>
                  <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.brand} {c.model}</Txt>
                  <Price T={T} value={c.pricePerDay} unit={t('common.per_day')} size="sm" />
                </div>
              ))}
            </div>
            <span aria-hidden style={{
              position: 'absolute', top: 0, right: 0, bottom: 4, width: 32,
              pointerEvents: 'none',
              background: `linear-gradient(to right, transparent, ${T.bg} 80%)`,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Home({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search, updateSearch, saved, toggleSaved } = useSearch();
  const dateLabel = formatDates(search.from, search.to);

  const carsQ = useAsync(listCars, []);
  const catsQ = useAsync(listCategories, []);
  const cars = carsQ.data ?? [];
  const categories = catsQ.data ?? [];
  const userLocState = useUserLocation();
  // Città reale SOLO se la geolocalizzazione è affidabile (browser/IP), non il
  // fallback Milano: se non sappiamo davvero dove sei, non lo mostriamo affatto.
  const userCity = (userLocState.loc && userLocState.loc.source !== 'fallback')
    ? (userLocState.loc.city || null)
    : null;

  useSeo({
    title: null, // home usa default
    description: t('home.meta_description'),
    path: '/',
    jsonLd: organizationJsonLd(),
  });

  const props = {
    T, search, dateLabel, cars, categories, userCity, saved, toggleSaved,
    loading: carsQ.loading || catsQ.loading,
    onSearchLocation: () => navigate('/cerca/dove'),
    onPickLocation: (loc) => updateSearch({ location: loc }),
    onSearchDate: () => navigate('/cerca/quando'),
    onListing: () => {
      analyticsEvents.searchStarted({
        location: search.location,
        category: search.category,
        has_dates: !!search.from && !!search.to,
      });
      navigate('/cerca');
    },
    onCategory: (cat) => {
      const patch = { category: cat };
      if (!search.location && userCity) patch.location = userCity;
      updateSearch(patch);
      analyticsEvents.searchStarted({ category: cat, location: patch.location, source: 'category' });
      navigate('/cerca');
    },
    onPickCategoryInline: (cat) => {
      const patch = { category: cat };
      if (!search.location && userCity) patch.location = userCity;
      updateSearch(patch);
    },
    onCar: (id) => {
      analyticsEvents.vehicleOpened({ car_id: id, source: 'home' });
      navigate(`/auto/${id}`);
    },
  };

  return isDesktop ? <HomeDesktop {...props} /> : <HomeMobile {...props} />;
}
