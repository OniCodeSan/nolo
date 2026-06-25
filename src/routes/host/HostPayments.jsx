import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Icon, CarRender } from '../../components/icons.jsx';
import { Badge, Button, H, Txt } from '../../components/ui.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { listHostBookings, getProfilesByIds } from '../../services/bookings.js';

const MONTHS = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const MONTHS_LONG = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

function fmtMonthYear(d) {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function KpiCard({ T, label, value, sub, tone }) {
  const bg = tone === 'accent' ? T.accent : tone === 'success' ? T.greenSoft : T.surface;
  return (
    <div style={{ padding: 18, background: bg, border: `1px solid ${T.line}`, borderRadius: 14 }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</Txt>
      <Txt T={T} size={28} weight={700} style={{ display: 'block', marginTop: 6, fontFamily: T.fontDisplay, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}€</Txt>
      <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>{sub}</Txt>
    </div>
  );
}

function PaymentRow({ T, booking, profile, onClick }) {
  const car = booking.cars;
  const carName = car ? `${car.brand} ${car.model}${car.year ? ' · ' + car.year : ''}` : 'Veicolo';
  const customerName = profile?.full_name || `Cliente ${booking.user_id?.slice(0, 6)}`;
  const statusBadge = booking.status === 'completed' ? { tone: 'neutral', l: 'Completata' } : { tone: 'success', l: 'Confermata' };

  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', border: 'none',
      background: T.surface, borderRadius: 12, padding: 14,
      boxShadow: T.sh.soft, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
    }}>
      <div style={{ width: 56, height: 38, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.line}`, flex: 'none' }}>
        <CarRender T={T} variant={car?.variant || 'hatch'} tone={car?.tone || 'neutral'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{carName}</Txt>
        <Txt T={T} size={12} color={T.ink2} style={{ display: 'block' }}>
          {customerName} · {booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}
        </Txt>
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>
          {fmtDate(booking.date_from)} → {fmtDate(booking.date_to)}
        </Txt>
      </div>
      <div style={{ textAlign: 'right', flex: 'none' }}>
        <Badge T={T} tone={statusBadge.tone}>{statusBadge.l}</Badge>
        <Txt T={T} size={18} weight={700} style={{ display: 'block', marginTop: 4, fontFamily: T.fontDisplay }}>{booking.total}€</Txt>
        <Txt T={T} size={10} color={T.ink3} style={{ display: 'block' }}>incl. cauzione {booking.deposit}€</Txt>
      </div>
    </button>
  );
}

function downloadCSV(rows, profiles, year) {
  const headers = ['Codice', 'Data ritiro', 'Data riconsegna', 'Auto', 'Cliente', 'Giorni', 'Tariffa/g', 'Subtotale', 'Cauzione', 'Totale', 'Stato'];
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(';')];
  rows.forEach(b => {
    const car = b.cars;
    const customer = profiles[b.user_id]?.full_name || b.user_id?.slice(0, 8);
    lines.push([
      b.id.slice(0, 8).toUpperCase(),
      b.date_from,
      b.date_to,
      car ? `${car.brand} ${car.model}` : '',
      customer,
      b.days,
      b.price_per_day,
      b.subtotal,
      b.deposit,
      b.total,
      b.status,
    ].map(escape).join(';'));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pagamenti-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function HostPayments({ T }) {
  const { host, isDesktop } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listHostBookings(host.id);
        if (cancelled) return;
        setRows(list);
        const userIds = [...new Set(list.map(b => b.user_id).filter(Boolean))];
        if (userIds.length) {
          const profs = await getProfilesByIds(userIds);
          setProfiles(profs);
        }
      } catch (err) {
        toast.error(err.message || 'Errore caricamento pagamenti');
        setRows([]);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host.id]);

  // KPI: questo mese / mese scorso / anno corrente / totale lifetime
  const kpi = useMemo(() => {
    if (!rows) return null;
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startYear = new Date(now.getFullYear(), 0, 1);
    let mtm = 0, mlm = 0, yr = 0, lt = 0, cnt = 0;
    rows.forEach(b => {
      const d = new Date(b.date_from);
      lt += b.total;
      if (d >= startYear) yr += b.total;
      if (d >= startThisMonth) mtm += b.total;
      else if (d >= startLastMonth) mlm += b.total;
      cnt++;
    });
    return { mtm, mlm, yr, lt, cnt };
  }, [rows]);

  // Raggruppamenti per mese del anno selezionato
  const byMonth = useMemo(() => {
    if (!rows) return [];
    const filtered = rows.filter(b => new Date(b.date_from).getFullYear() === year);
    const groups = new Map();
    filtered.forEach(b => {
      const d = new Date(b.date_from);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      if (!groups.has(key)) groups.set(key, { key, monthDate: new Date(d.getFullYear(), d.getMonth(), 1), items: [], total: 0 });
      const g = groups.get(key);
      g.items.push(b);
      g.total += b.total;
    });
    return [...groups.values()].sort((a, b) => b.monthDate - a.monthDate);
  }, [rows, year]);

  const availableYears = useMemo(() => {
    if (!rows) return [];
    const years = new Set();
    rows.forEach(b => years.add(new Date(b.date_from).getFullYear()));
    return [...years].sort((a, b) => b - a);
  }, [rows]);

  if (rows === null) {
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : '20px 18px', maxWidth: 1100, margin: '0 auto' }}>
        <H T={T} size="h2">Pagamenti</H>
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 48 }}>Caricamento…</Txt>
      </div>
    );
  }

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <H T={T} size="h2">Pagamenti</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            Storico ricavi delle prenotazioni confermate e completate.
          </Txt>
        </div>
        {rows.length > 0 && availableYears.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} style={{
              padding: '8px 12px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8,
              fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none',
            }}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <Button T={T} variant="outline" size="sm" icon="share" onClick={() => downloadCSV(rows.filter(b => new Date(b.date_from).getFullYear() === year), profiles, year)}>
              Esporta CSV
            </Button>
          </div>
        )}
      </div>

      {/* Banner informativo */}
      <div style={{
        padding: 14, background: T.accentSoft, border: `1px solid ${T.accent}`,
        borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 22,
      }}>
        <Icon name="sparkle" size={18} color={T.accentDeep} T={T} />
        <div style={{ flex: 1 }}>
          <Txt T={T} size={13} weight={600} style={{ display: 'block', marginBottom: 4 }}>Incasso diretto cliente↔noleggiatore</Txt>
          <Txt T={T} size={12} color={T.ink1} style={{ lineHeight: 1.55 }}>
            MoviQ non gestisce i pagamenti — incassi direttamente dal cliente al ritiro (carta, contanti fino a 5000€, bonifico o quello che hai configurato in Profilo aziendale).
            Questo storico ti aiuta a tracciare le tue entrate per amministrazione e fatturazione.
          </Txt>
        </div>
      </div>

      {kpi && (
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
          <KpiCard T={T} label="Questo mese" value={kpi.mtm}
            sub={fmtMonthYear(new Date())} tone="accent" />
          <KpiCard T={T} label="Mese scorso" value={kpi.mlm}
            sub={fmtMonthYear(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))} />
          <KpiCard T={T} label={`Anno ${new Date().getFullYear()}`} value={kpi.yr}
            sub="da gennaio a oggi" tone="success" />
          <KpiCard T={T} label="Totale lifetime" value={kpi.lt}
            sub={`${kpi.cnt} prenotazioni`} />
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: T.surface, border: `1px dashed ${T.line}`, borderRadius: 14 }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="euro" size={24} color={T.ink2} T={T} />
          </span>
          <H T={T} size="h4">Ancora nessun incasso</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
            Quando confermi la prima prenotazione, comparirà qui con il dettaglio dell'importo.
          </Txt>
        </div>
      ) : byMonth.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
          <Txt T={T} size={14} color={T.ink2}>Nessuna entrata nel {year}.</Txt>
        </div>
      ) : (
        byMonth.map(group => (
          <section key={group.key} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
              <H T={T} size="h4">{MONTHS_LONG[group.monthDate.getMonth()]} {group.monthDate.getFullYear()}</H>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <Txt T={T} size={12} color={T.ink2}>{group.items.length} {group.items.length === 1 ? 'incasso' : 'incassi'}</Txt>
                <Txt T={T} size={18} weight={700} style={{ fontFamily: T.fontDisplay }}>{group.total}€</Txt>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.items.map(b => (
                <PaymentRow key={b.id} T={T} booking={b} profile={profiles[b.user_id]}
                  onClick={() => navigate(`/prenotazioni/${b.id}`)} />
              ))}
            </div>
          </section>
        ))
      )}

      {rows.length > 0 && (
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', textAlign: 'center', marginTop: 24, lineHeight: 1.5 }}>
          ⓘ I totali includono cauzione di 200€ per prenotazione (rimborsata al cliente alla riconsegna).
          L'importo effettivamente trattenuto dipende dalla tua policy.
        </Txt>
      )}
    </div>
  );
}
