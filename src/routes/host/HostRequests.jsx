import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon, CarRender } from '../../components/icons.jsx';
import { Avatar, Badge, Button, H, Txt, TabPills } from '../../components/ui.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { listHostRequests, acceptHostBooking, declineHostBooking } from '../../services/bookings.js';
import { events as analyticsEvents } from '../../lib/analytics.js';

const MONTHS = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtRange(fromIso, toIso) {
  if (!fromIso || !toIso) return '';
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  if (sameMonth) return `${from.getDate()} — ${to.getDate()} ${MONTHS[from.getMonth()]} ${from.getFullYear()}`;
  if (sameYear) return `${from.getDate()} ${MONTHS[from.getMonth()]} — ${to.getDate()} ${MONTHS[to.getMonth()]} ${from.getFullYear()}`;
  return `${fmt(fromIso)} — ${fmt(toIso)}`;
}

const TABS = [
  { id: 'requested', l: 'Da gestire',  tone: 'accent' },
  { id: 'confirmed', l: 'Confermate',  tone: 'success' },
  { id: 'declined',  l: 'Rifiutate',   tone: 'alert' },
  { id: 'cancelled', l: 'Annullate',   tone: 'neutral' },
  { id: 'all',       l: 'Tutte',       tone: 'neutral' },
];

function StatusBadge({ T, status }) {
  const map = {
    requested: { l: 'In attesa',   tone: 'accent', icon: 'bell' },
    confirmed: { l: 'Confermata',  tone: 'success', icon: 'check' },
    declined:  { l: 'Rifiutata',   tone: 'alert',   icon: 'x' },
    cancelled: { l: 'Annullata',   tone: 'neutral', icon: 'x' },
    completed: { l: 'Completata',  tone: 'neutral', icon: 'check' },
  };
  const s = map[status] || map.requested;
  return <Badge T={T} tone={s.tone} icon={s.icon}>{s.l}</Badge>;
}

function RequestActions({ T, booking, onAccept, onDecline, busy }) {
  const [showAccept, setShowAccept] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');

  if (booking.status !== 'requested') return null;

  if (showAccept) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: T.greenSoft, borderRadius: 10 }}>
        <Txt T={T} size={12} weight={600}>Messaggio per il cliente (opzionale)</Txt>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Es. Confermo per le 10:00. A presto!"
          style={{
            width: '100%', boxSizing: 'border-box', padding: '8px 10px',
            background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8,
            fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none', resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button T={T} variant="ghost" size="sm" onClick={() => { setShowAccept(false); setMessage(''); }} disabled={busy}>Annulla</Button>
          <Button T={T} variant="primary" size="sm" iconRight="check" onClick={() => onAccept(message)} disabled={busy}>
            {busy ? 'Confermo…' : 'Conferma'}
          </Button>
        </div>
      </div>
    );
  }

  if (showDecline) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: T.coralSoft, borderRadius: 10 }}>
        <Txt T={T} size={12} weight={600}>Motivo del rifiuto (opzionale, visibile al cliente)</Txt>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Es. Auto già impegnata in quelle date."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '8px 10px',
            background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8,
            fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none', resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button T={T} variant="ghost" size="sm" onClick={() => { setShowDecline(false); setReason(''); }} disabled={busy}>Annulla</Button>
          <Button T={T} variant="primary" size="sm" iconRight="x" onClick={() => onDecline(reason)} disabled={busy} style={{ background: T.coral, color: '#fff' }}>
            {busy ? 'Rifiuto…' : 'Conferma rifiuto'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button T={T} variant="ghost" size="sm" onClick={() => setShowDecline(true)} style={{ color: T.coral }}>
        Rifiuta
      </Button>
      <Button T={T} variant="accent" size="sm" iconRight="check" onClick={() => setShowAccept(true)}>
        Accetta
      </Button>
    </div>
  );
}

function RequestCard({ T, booking, onAccept, onDecline, busyId, isDesktop }) {
  const car = booking.cars;
  const busy = busyId === booking.id;
  const carName = car ? `${car.brand} ${car.model}${car.year ? ' · ' + car.year : ''}` : 'Veicolo';

  return (
    <div style={{
      background: T.surface, border: `1px solid ${booking.status === 'requested' ? T.accent : T.line}`,
      borderRadius: 14, padding: 16, boxShadow: T.sh.soft,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {car && (
          <div style={{ width: 100, height: 64, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.line}`, flex: 'none' }}>
            <CarRender T={T} variant={car.variant || 'hatch'} tone={car.tone || 'neutral'} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Txt T={T} size={15} weight={700}>{carName}</Txt>
            <StatusBadge T={T} status={booking.status} />
          </div>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
            {fmtRange(booking.date_from, booking.date_to)} · {booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}
          </Txt>
          {(booking.time_from || booking.time_to) && (
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
              Ritiro {booking.time_from || '—'} · Riconsegna {booking.time_to || '—'}
            </Txt>
          )}
          <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>
            Richiesta ricevuta il {fmt(booking.created_at)}
          </Txt>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Txt T={T} size={20} weight={700} style={{ fontFamily: T.fontDisplay }}>{booking.total}€</Txt>
          <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>{booking.price_per_day}€/giorno</Txt>
        </div>
      </div>

      {booking.message && (
        <div style={{ padding: 10, background: T.surfaceAlt, borderRadius: 8 }}>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Messaggio dal cliente</Txt>
          <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{booking.message}</Txt>
        </div>
      )}

      {booking.host_response && (
        <div style={{ padding: 10, background: T.greenSoft, borderRadius: 8 }}>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>La tua risposta</Txt>
          <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{booking.host_response}</Txt>
        </div>
      )}

      {booking.decline_reason && booking.status === 'declined' && (
        <div style={{ padding: 10, background: T.coralSoft, borderRadius: 8 }}>
          <Txt T={T} size={11} weight={600} color={T.alert} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Motivo rifiuto</Txt>
          <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{booking.decline_reason}</Txt>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <RequestActions T={T} booking={booking} busy={busy}
          onAccept={(msg) => onAccept(booking, msg)}
          onDecline={(reason) => onDecline(booking, reason)}
        />
      </div>

      <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', textAlign: 'right' }}>
        Codice {booking.id.slice(0, 8).toUpperCase()}
      </Txt>
    </div>
  );
}

export function HostRequests({ T }) {
  const { host, isDesktop } = useOutletContext();
  const toast = useToast();
  const [tab, setTab] = useState('requested');
  const [rows, setRows] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const status = tab === 'all' ? undefined : tab;
      const list = await listHostRequests(host.id, { status });
      setRows(list);
    } catch (err) {
      toast.error(err.message || 'Errore caricamento');
      setRows([]);
    }
  };

  useEffect(() => {
    setRows(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host.id, tab]);

  const counts = useMemo(() => {
    // Solo i requested li mostriamo nel badge, ma anche gli altri.
    if (!rows) return {};
    return rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  }, [rows]);

  const onAccept = async (booking, message) => {
    setBusyId(booking.id);
    try {
      await acceptHostBooking(booking.id, message);
      toast.success('Richiesta accettata');
      analyticsEvents.hostAccept({ booking_id: booking.id, car_id: booking.car_id });
      await load();
    } catch (err) {
      toast.error(err.message || 'Errore conferma');
    } finally {
      setBusyId(null);
    }
  };

  const onDecline = async (booking, reason) => {
    setBusyId(booking.id);
    try {
      await declineHostBooking(booking.id, reason);
      toast.info('Richiesta rifiutata');
      analyticsEvents.hostDecline({ booking_id: booking.id, car_id: booking.car_id });
      await load();
    } catch (err) {
      toast.error(err.message || 'Errore rifiuto');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <H T={T} size="h2">Richieste</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            Gestisci le prenotazioni in arrivo per i tuoi veicoli.
          </Txt>
        </div>
      </div>

      <TabPills T={T} tabs={TABS} value={tab} onChange={setTab} style={{ marginBottom: 18, paddingBottom: 4 }} />

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: T.surface, border: `1px dashed ${T.line}`, borderRadius: 14 }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="bell" size={24} color={T.ink2} T={T} />
          </span>
          <H T={T} size="h4">Nessuna richiesta</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            {tab === 'requested'
              ? 'Tutte le tue richieste sono state gestite. Buon lavoro!'
              : 'Nessuna richiesta in questa categoria.'}
          </Txt>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map(b => (
            <RequestCard
              key={b.id} T={T} booking={b}
              busyId={busyId} isDesktop={isDesktop}
              onAccept={onAccept} onDecline={onDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
