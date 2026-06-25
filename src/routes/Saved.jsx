import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../state/SearchContext.jsx';
import { Icon, CarRender } from '../components/icons.jsx';
import { useMemo } from 'react';
import { Badge, Button, H, Txt, Price, Rating, Chip } from '../components/ui.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { listCars, getHostsByIds } from '../services/cars.js';

function HeartButton({ T, onClick }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} aria-label={t('saved.remove_aria')} aria-pressed="true" style={{
      position: 'absolute', top: 8, right: 8, border: 'none', cursor: 'pointer',
      width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft,
    }}>
      <Icon name="heartFill" size={15} color={T.coral} T={T} />
    </button>
  );
}

function SavedRow({ T, car, host, onClick, onUnsave }) {
  const { t } = useTranslation();
  return (
    <div onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, padding: 10, display: 'flex', gap: 10,
      boxShadow: T.sh.soft, cursor: 'pointer',
    }}>
      <div style={{ width: 110, flex: 'none' }}>
        <div style={{ position: 'relative', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
          <CarRender T={T} variant={car.variant} tone={car.tone} />
          <HeartButton T={T} onClick={onUnsave} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '4px 0' }}>
        <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{car.brand} {car.model} · {car.year}</Txt>
        <Txt T={T} size={12} color={T.ink2}>{host.n} · {car.distance}</Txt>
        <Rating T={T} value={host.rating} size={12} />
        <div style={{ marginTop: 4 }}>
          <Price T={T} value={car.pricePerDay} unit={t('common.per_day_short')} size="md" weight={700} />
        </div>
      </div>
    </div>
  );
}

function SavedCard({ T, car, host, onClick, onUnsave }) {
  const { t } = useTranslation();
  return (
    <div onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, overflow: 'hidden', boxShadow: T.sh.soft, cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', aspectRatio: '1.5 / 1' }}>
        <CarRender T={T} variant={car.variant} tone={car.tone} />
        <HeartButton T={T} onClick={onUnsave} />
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model} · {car.year}</Txt>
        <Txt T={T} size={12} color={T.ink2}>{host.n} · {car.distance}</Txt>
        <Rating T={T} value={host.rating} size={12} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Price T={T} value={car.pricePerDay} unit={t('common.per_day')} size="md" weight={700} />
          {car.hot && <Badge T={T} tone="success" icon="bolt">{t('common.today')}</Badge>}
        </div>
      </div>
    </div>
  );
}

export function Saved({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saved, toggleSaved } = useSearch();
  const carsQ = useAsync(listCars, []);
  const cars = useMemo(() => (carsQ.data ?? []).filter(c => saved.has(c.id)), [carsQ.data, saved]);
  const hostIdsKey = useMemo(() => [...new Set(cars.map(c => c.host))].sort().join(','), [cars]);
  const hostsQ = useAsync(() => getHostsByIds(hostIdsKey ? hostIdsKey.split(',') : []), [hostIdsKey]);
  const HOSTS = hostsQ.data ?? {};

  const empty = (
    <div style={{ padding: '64px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 56, height: 56, borderRadius: '50%', background: T.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="heart" size={26} color={T.coral} T={T} />
      </span>
      <H T={T} size="h3">{t('saved.empty_title')}</H>
      <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.55, maxWidth: 360 }}>{t('saved.empty_body')}</Txt>
      <Button T={T} variant="accent" size="md" iconRight="arrowRight" onClick={() => navigate('/cerca')} style={{ marginTop: 8 }}>
        {t('saved.explore')}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <div style={{ flex: 1, background: T.bg, overflow: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 56px', width: '100%', boxSizing: 'border-box' }}>
          <H T={T} size="h1">{t('saved.title')}</H>
          <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            {t('saved.count', { count: cars.length })}
          </Txt>

          <div style={{ marginTop: 24 }}>
            {cars.length === 0 ? empty : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
                {cars.map(c => (
                  <SavedCard
                    key={c.id} T={T} car={c} host={HOSTS[c.host] || { n: '…', rating: 0 }}
                    onClick={() => navigate(`/auto/${c.id}`)}
                    onUnsave={(e) => { e.stopPropagation(); toggleSaved(c.id); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 'none', padding: '14px 18px 12px', borderBottom: `1px solid ${T.line}` }}>
        <H T={T} size="h3">{t('saved.title')}</H>
        <Txt T={T} size={12} color={T.ink2}>{t('saved.count', { count: cars.length })}</Txt>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px 24px' }}>
        {cars.length === 0 ? empty : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cars.map(c => (
              <SavedRow
                key={c.id} T={T} car={c} host={HOSTS[c.host] || { n: '…', rating: 0 }}
                onClick={() => navigate(`/auto/${c.id}`)}
                onUnsave={(e) => { e.stopPropagation(); toggleSaved(c.id); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
