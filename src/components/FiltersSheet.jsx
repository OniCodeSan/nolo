import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Button, H, Txt, Chip } from './ui.jsx';
import { BrandFilterSelect } from './BrandModelPicker.jsx';
import { events as analyticsEvents } from '../lib/analytics.js';

const FUELS = ['Benzina', 'Hybrid', 'Elettrica', 'Diesel'];
const FUEL_KEY = { Benzina: 'filters.fuel_petrol', Hybrid: 'filters.fuel_hybrid', Elettrica: 'filters.fuel_electric', Diesel: 'filters.fuel_diesel' };
const TRANSMISSIONS = [
  { id: 'all', key: 'filters.transmission_all' },
  { id: 'Manuale', key: 'filters.transmission_manual' },
  { id: 'Automatico', key: 'filters.transmission_auto' },
];

function toggleSet(s, v) {
  const n = new Set(s);
  if (n.has(v)) n.delete(v); else n.add(v);
  return n;
}

export function FiltersSheet({ T, open, onClose, filters, setFilters, isDesktop, resultCount }) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(filters);

  useEffect(() => { if (open) setLocal(filters); }, [open, filters]);

  if (!open) return null;

  const apply = () => {
    setFilters(local);
    analyticsEvents.filtersUsed({
      price_max: local.priceMax,
      fuels: [...local.fuels],
      transmission: local.transmission,
      brand_id: local.brandId,
    });
    onClose();
  };
  const reset = () => {
    const cleared = { priceMax: 100, fuels: new Set(), transmission: 'all', brandId: null };
    setLocal(cleared);
  };

  const activeCount =
    (local.priceMax < 100 ? 1 : 0) +
    (local.fuels.size > 0 ? 1 : 0) +
    (local.transmission !== 'all' ? 1 : 0) +
    (local.brandId ? 1 : 0);

  const overlay = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.45)',
        zIndex: 1500, display: 'flex',
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
      }}
    />
  );

  const panelStyle = isDesktop
    ? {
        position: 'relative', zIndex: 1501,
        width: 480, maxWidth: 'calc(100vw - 40px)', maxHeight: '85vh',
        background: T.bg, borderRadius: T.r.lg, boxShadow: T.sh.deep,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }
    : {
        position: 'relative', zIndex: 1501,
        width: '100%', maxHeight: '85vh',
        background: T.bg,
        borderTopLeftRadius: T.r.lg, borderTopRightRadius: T.r.lg,
        boxShadow: T.sh.deep,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      };

  return (
    <>
      {overlay}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 1501,
          display: 'flex',
          alignItems: isDesktop ? 'center' : 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ ...panelStyle, pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: `1px solid ${T.line}`,
          }}>
            <H T={T} size="h4">{t('filters.title')}</H>
            <button onClick={onClose} aria-label={t('common.close')} style={{
              border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="x" size={20} color={T.ink1} T={T} />
            </button>
          </div>

          <div style={{
            flex: 1, minHeight: 0, overflow: 'auto',
            WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain',
            padding: '18px 18px 8px',
          }}>
            <BrandFilterSelect T={T} value={local.brandId || null} onChange={(id) => setLocal({ ...local, brandId: id })} />

            <H T={T} size="h5" style={{ marginTop: 24, marginBottom: 10 }}>{t('filters.price_max')}</H>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={local.priceMax}
                onChange={(e) => setLocal({ ...local, priceMax: parseInt(e.target.value, 10) })}
                style={{ flex: 1, accentColor: T.ink1 }}
              />
              <Txt T={T} size={13} weight={600} style={{ minWidth: 70, textAlign: 'right' }}>
                {local.priceMax >= 100 ? t('filters.any') : t('filters.price_le', { price: local.priceMax })}
              </Txt>
            </div>

            <H T={T} size="h5" style={{ marginTop: 24, marginBottom: 10 }}>{t('filters.fuel_section')}</H>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FUELS.map(f => {
                const active = local.fuels.has(f);
                return (
                  <button
                    key={f}
                    onClick={() => setLocal({ ...local, fuels: toggleSet(local.fuels, f) })}
                    style={{
                      border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
                    }}
                  >
                    <Chip T={T} active={active} icon={active ? 'check' : undefined}>{t(FUEL_KEY[f])}</Chip>
                  </button>
                );
              })}
            </div>

            <H T={T} size="h5" style={{ marginTop: 24, marginBottom: 10 }}>{t('filters.transmission_section')}</H>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRANSMISSIONS.map(tr => {
                const active = local.transmission === tr.id;
                return (
                  <button
                    key={tr.id}
                    onClick={() => setLocal({ ...local, transmission: tr.id })}
                    style={{
                      border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
                    }}
                  >
                    <Chip T={T} active={active} icon={active ? 'check' : undefined}>{t(tr.key)}</Chip>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            flex: 'none', padding: '14px 18px max(16px, env(safe-area-inset-bottom))',
            borderTop: `1px solid ${T.line}`, background: T.bg,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Button T={T} variant="ghost" size="md" onClick={reset}>{t('filters.reset')}</Button>
            <div style={{ flex: 1 }} />
            {activeCount > 0 && (
              <Txt T={T} size={12} color={T.ink2}>{t('filters.active_count', { count: activeCount })}</Txt>
            )}
            <Button T={T} variant="accent" size="md" iconRight="check" onClick={apply}>
              {typeof resultCount === 'number' ? t('filters.see_cars', { count: resultCount }) : t('filters.apply')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
