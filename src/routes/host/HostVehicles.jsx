import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Icon, CarRender } from '../../components/icons.jsx';
import { Avatar, Badge, Button, H, Txt, Price } from '../../components/ui.jsx';
import { CarCardSkeleton } from '../../components/Skeleton.jsx';
import { listCarsByHost, deleteCar } from '../../services/cars.js';
import { useToast } from '../../state/ToastContext.jsx';

const STATUS = {
  active:   { label: 'Pubblicato',  tone: 'success', icon: 'check' },
  draft:    { label: 'Bozza',       tone: 'neutral', icon: 'edit' },
  disabled: { label: 'Fuori catalogo', tone: 'alert', icon: 'x' },
};

const TABS = [
  { id: 'all',      l: 'Tutti' },
  { id: 'active',   l: 'Pubblicati' },
  { id: 'draft',    l: 'Bozze' },
  { id: 'disabled', l: 'Fuori catalogo' },
];

function EmptyState({ T, onAdd }) {
  return (
    <div style={{ padding: '64px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 64, height: 64, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="car" size={28} color={T.ink1} T={T} />
      </span>
      <H T={T} size="h3">Nessun veicolo ancora</H>
      <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.55, maxWidth: 380 }}>
        Aggiungi il tuo primo veicolo. Ci vogliono circa 3 minuti — puoi salvarlo come bozza e completare dopo.
      </Txt>
      <Button T={T} variant="accent" size="lg" icon="plus" onClick={onAdd}>Aggiungi un veicolo</Button>
    </div>
  );
}

export function HostVehicles({ T }) {
  const { host, isDesktop } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [cars, setCars] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCars(null);
    listCarsByHost(host.id).then(list => { if (!cancelled) setCars(list); }).catch(() => { if (!cancelled) setCars([]); });
    return () => { cancelled = true; };
  }, [host.id]);

  const counts = useMemo(() => {
    if (!cars) return { all: 0, active: 0, draft: 0, disabled: 0 };
    return {
      all: cars.length,
      active: cars.filter(c => c.status === 'active').length,
      draft: cars.filter(c => c.status === 'draft').length,
      disabled: cars.filter(c => c.status === 'disabled').length,
    };
  }, [cars]);

  const filtered = useMemo(() => {
    if (!cars) return [];
    let list = cars;
    if (tab !== 'all') list = list.filter(c => c.status === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => `${c.brand} ${c.model} ${c.year || ''} ${c.licensePlate || ''}`.toLowerCase().includes(q));
    }
    return list;
  }, [cars, tab, search]);

  const onRemove = async (car) => {
    if (!confirm(`Eliminare definitivamente "${car.brand} ${car.model}"?`)) return;
    setBusy(true);
    try {
      await deleteCar(car.id);
      setCars(prev => prev.filter(c => c.id !== car.id));
      toast.success('Veicolo eliminato');
    } catch (err) {
      toast.error(err.message || 'Errore eliminazione');
    } finally {
      setBusy(false);
    }
  };

  const Header = (
    <div style={{ padding: isDesktop ? '24px 36px 16px' : '20px 18px 12px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <H T={T} size={isDesktop ? 'h2' : 'h3'}>I miei veicoli</H>
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
          {counts.active} pubblicati · {counts.draft} bozze · {counts.disabled} fuori catalogo
        </Txt>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per marca, modello, targa…"
          style={{
            width: isDesktop ? 240 : 180, padding: '8px 12px',
            background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999,
            fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none',
          }}
        />
        <Button T={T} variant="accent" size="md" icon="plus" onClick={() => navigate('/noleggia/veicoli/nuovo')}>Nuovo veicolo</Button>
      </div>
    </div>
  );

  const Tabs = (
    <div style={{ padding: isDesktop ? '0 36px' : '0 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', gap: 24, overflowX: 'auto' }}>
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            padding: '12px 0', border: 'none', cursor: 'pointer', background: 'transparent',
            borderBottom: tab === t.id ? `2px solid ${T.ink1}` : '2px solid transparent',
            marginBottom: -1,
          }}
        >
          <Txt T={T} size={13} weight={tab === t.id ? 600 : 500} color={tab === t.id ? T.ink1 : T.ink2}>
            {t.l} · {counts[t.id]}
          </Txt>
        </button>
      ))}
    </div>
  );

  if (cars === null) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {Header}{Tabs}
        <div style={{ padding: isDesktop ? '20px 36px' : '14px 18px', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: 12 }}>
          {[0,1,2].map(i => <CarCardSkeleton key={i} T={T} layout="row" />)}
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {Header}
        <EmptyState T={T} onAdd={() => navigate('/noleggia/veicoli/nuovo')} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {Header}{Tabs}

      {filtered.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Txt T={T} size={14} color={T.ink2}>Nessun veicolo per questo filtro.</Txt>
        </div>
      ) : isDesktop ? (
        <div style={{ padding: '0 36px 40px', overflow: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px 1.8fr 1fr 0.8fr 0.6fr 0.6fr 110px',
            padding: '14px 0', borderBottom: `1px solid ${T.line}`, gap: 16, alignItems: 'center',
          }}>
            {[' ', 'Veicolo', 'Stato', 'Prezzo/g', 'Posti', 'Carb.', '  '].map((h, i) => (
              <Txt key={i} T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Txt>
            ))}
          </div>
          {filtered.map(car => {
            const s = STATUS[car.status] || STATUS.active;
            return (
              <div key={car.id} style={{
                display: 'grid',
                gridTemplateColumns: '70px 1.8fr 1fr 0.8fr 0.6fr 0.6fr 110px',
                padding: '12px 0', borderBottom: `1px solid ${T.line}`, gap: 16, alignItems: 'center',
              }}>
                <div style={{ width: 60, height: 38, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                  <CarRender T={T} variant={car.variant || 'hatch'} tone={car.tone || 'neutral'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {car.brand} {car.model}{car.year ? ' · ' + car.year : ''}
                  </Txt>
                  <Txt T={T} size={12} color={T.ink2}>
                    {[car.fuel, car.transmission, car.seats ? `${car.seats} posti` : null].filter(Boolean).join(' · ')}
                  </Txt>
                </div>
                <Badge T={T} tone={s.tone} icon={s.icon}>{s.label}</Badge>
                <Txt T={T} size={14} weight={600} style={{ fontFamily: T.fontDisplay }}>
                  {car.pricePerDay ? `${car.pricePerDay}€` : '—'}
                </Txt>
                <Txt T={T} size={14}>{car.seats ?? '—'}</Txt>
                <Txt T={T} size={14}>{(car.fuel || '—').slice(0, 4)}</Txt>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => navigate(`/noleggia/veicoli/${car.id}`)} aria-label="Modifica" style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6 }}>
                    <Icon name="edit" size={15} color={T.ink2} T={T} />
                  </button>
                  <button onClick={() => onRemove(car)} aria-label="Elimina" disabled={busy} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6 }}>
                    <Icon name="x" size={15} color={T.coral} T={T} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '14px 18px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(car => {
            const s = STATUS[car.status] || STATUS.active;
            return (
              <button key={car.id} onClick={() => navigate(`/noleggia/veicoli/${car.id}`)} style={{
                width: '100%', textAlign: 'left', border: 'none',
                background: T.surface, borderRadius: 14, padding: 12,
                boxShadow: T.sh.soft, display: 'flex', gap: 12, alignItems: 'stretch', cursor: 'pointer',
              }}>
                <div style={{ width: 100, flex: 'none', borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
                  <CarRender T={T} variant={car.variant || 'hatch'} tone={car.tone || 'neutral'} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>
                      {car.brand} {car.model}{car.year ? ' · ' + car.year : ''}
                    </Txt>
                    <Txt T={T} size={12} color={T.ink2}>{[car.fuel, car.transmission].filter(Boolean).join(' · ')}</Txt>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge T={T} tone={s.tone}>{s.label}</Badge>
                    <Txt T={T} size={14} weight={600}>{car.pricePerDay ? `${car.pricePerDay}€/g` : '—'}</Txt>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
