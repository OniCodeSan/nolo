import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon, CarRender } from '../../components/icons.jsx';
import { Avatar, Badge, Button, H, Txt } from '../../components/ui.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { listHostBookings, getProfilesByIds, completeHostBooking } from '../../services/bookings.js';

const MONTHS = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const WEEKDAYS = ['dom','lun','mar','mer','gio','ven','sab'];

const dayStart = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const today = () => dayStart(new Date());

function classify(b) {
  if (b.status === 'completed') return 'storico';
  const tStart = dayStart(b.date_from);
  const tEnd = dayStart(b.date_to);
  const t = today();
  if (t >= tStart && t <= tEnd) return 'in_corso';
  if (tStart > t) return 'in_arrivo';
  return 'storico'; // confirmed ma data passata = storico in attesa di completion
}

function daysFromNow(iso) {
  const ms = dayStart(iso).getTime() - today().getTime();
  return Math.round(ms / 86400000);
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function fmtRange(fromIso, toIso) {
  const from = new Date(fromIso); const to = new Date(toIso);
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  if (sameMonth) return `${from.getDate()} — ${to.getDate()} ${MONTHS[from.getMonth()]} ${from.getFullYear()}`;
  return `${from.getDate()} ${MONTHS[from.getMonth()]} — ${to.getDate()} ${MONTHS[to.getMonth()]} ${from.getFullYear()}`;
}

function DateBlock({ T, iso, label, time }) {
  const d = new Date(iso);
  return (
    <div style={{ flex: 'none', minWidth: 60, padding: '8px 10px', background: T.surfaceAlt, borderRadius: 10, textAlign: 'center' }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>{label}</Txt>
      <Txt T={T} size={20} weight={700} style={{ fontFamily: T.fontDisplay, lineHeight: 1, display: 'block', marginTop: 4 }}>{d.getDate()}</Txt>
      <Txt T={T} size={10} color={T.ink2} style={{ display: 'block' }}>{MONTHS[d.getMonth()]}</Txt>
      {time && <Txt T={T} size={11} weight={600} style={{ display: 'block', marginTop: 4 }}>{time}</Txt>}
    </div>
  );
}

function BookingRow({ T, booking, profile, onComplete, busyId }) {
  const car = booking.cars;
  const carName = car ? `${car.brand} ${car.model}${car.year ? ' · ' + car.year : ''}` : 'Veicolo';
  const kind = classify(booking);
  const inDays = daysFromNow(booking.date_from);
  const customerName = profile?.full_name || `Cliente ${booking.user_id?.slice(0, 6)}`;
  const customerPhone = profile?.phone;
  const completable = booking.status === 'confirmed' && (kind === 'storico' || kind === 'in_corso');
  const busy = busyId === booking.id;
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: 14, boxShadow: T.sh.soft, display: 'flex', gap: 14, alignItems: 'stretch', flexWrap: 'wrap',
    }}>
      <DateBlock T={T} iso={booking.date_from} label="Ritiro"     time={booking.time_from} />
      <DateBlock T={T} iso={booking.date_to}   label="Riconsegna" time={booking.time_to} />

      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Txt T={T} size={14} weight={700}>{carName}</Txt>
          {booking.status === 'completed' && <Badge T={T} tone="neutral" icon="check">Completata</Badge>}
          {kind === 'in_corso' && booking.status === 'confirmed' && <Badge T={T} tone="success" icon="bolt">In corso</Badge>}
          {kind === 'in_arrivo' && booking.status === 'confirmed' && (
            <Badge T={T} tone="accent">In arrivo · {inDays === 0 ? 'oggi' : inDays === 1 ? 'domani' : `tra ${inDays}g`}</Badge>
          )}
          {kind === 'storico' && booking.status === 'confirmed' && <Badge T={T} tone="alert">Da completare</Badge>}
        </div>
        <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
          {fmtRange(booking.date_from, booking.date_to)} · {booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}
        </Txt>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar T={T} name={customerName} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{customerName}</Txt>
            {customerPhone && <Txt T={T} size={11} color={T.ink2}>{customerPhone}</Txt>}
          </div>
        </div>

        {booking.message && (
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 8, lineHeight: 1.5 }}>
            <strong>Note cliente:</strong> {booking.message}
          </Txt>
        )}
        {booking.host_notes && (
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 6, lineHeight: 1.5 }}>
            <strong>Note ritiro:</strong> {booking.host_notes}
          </Txt>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: 130 }}>
        <Txt T={T} size={20} weight={700} style={{ fontFamily: T.fontDisplay }}>{booking.total}€</Txt>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {customerPhone && (
            <a href={`tel:${customerPhone}`} style={{ textDecoration: 'none' }}>
              <Button T={T} variant="outline" size="sm" icon="phone">Chiama</Button>
            </a>
          )}
          {completable && (
            <Button T={T} variant="accent" size="sm" iconRight="check" onClick={() => setShowCompleteForm(true)} disabled={busy}>
              {busy ? '…' : 'Completa'}
            </Button>
          )}
        </div>
      </div>

      {showCompleteForm && (
        <div style={{ flex: '1 0 100%', padding: 12, background: T.accentSoft, borderRadius: 10, marginTop: 4 }}>
          <Txt T={T} size={12} weight={600} style={{ display: 'block', marginBottom: 6 }}>
            Note riconsegna (opzionale)
          </Txt>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Es. Pieno fatto, nessun danno, km 42.350."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 10px',
              background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8,
              fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none', resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button T={T} variant="ghost" size="sm" onClick={() => { setShowCompleteForm(false); setNotes(''); }} disabled={busy}>Annulla</Button>
            <Button T={T} variant="primary" size="sm" iconRight="check" onClick={() => onComplete(booking, notes)} disabled={busy}>
              {busy ? 'Completo…' : 'Marca come completata'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupSection({ T, title, count, color, children, hint }) {
  if (count === 0) return null;
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <H T={T} size="h4">{title}</H>
        <Badge T={T} tone={color}>{count}</Badge>
        {hint && <Txt T={T} size={12} color={T.ink3}>{hint}</Txt>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </section>
  );
}

export function HostBookings({ T }) {
  const { host, isDesktop } = useOutletContext();
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const list = await listHostBookings(host.id);
      setRows(list);
      const userIds = [...new Set(list.map(b => b.user_id).filter(Boolean))];
      if (userIds.length) {
        const profs = await getProfilesByIds(userIds);
        setProfiles(profs);
      }
    } catch (err) {
      toast.error(err.message || 'Errore caricamento prenotazioni');
      setRows([]);
    }
  };

  useEffect(() => {
    setRows(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host.id]);

  const groups = useMemo(() => {
    if (!rows) return null;
    const inCorso = []; const inArrivo = []; const daCompletare = []; const completate = [];
    rows.forEach(b => {
      if (b.status === 'completed') { completate.push(b); return; }
      const k = classify(b);
      if (k === 'in_corso') inCorso.push(b);
      else if (k === 'in_arrivo') inArrivo.push(b);
      else daCompletare.push(b);
    });
    inArrivo.sort((a, b) => new Date(a.date_from) - new Date(b.date_from));
    inCorso.sort((a, b) => new Date(a.date_to) - new Date(b.date_to));
    daCompletare.sort((a, b) => new Date(b.date_to) - new Date(a.date_to));
    completate.sort((a, b) => new Date(b.completed_at || b.date_to) - new Date(a.completed_at || a.date_to));
    return { inCorso, inArrivo, daCompletare, completate };
  }, [rows]);

  const onComplete = async (booking, notes) => {
    setBusyId(booking.id);
    try {
      await completeHostBooking(booking.id, notes);
      toast.success('Prenotazione completata');
      await load();
    } catch (err) {
      toast.error(err.message || 'Errore completamento');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <H T={T} size="h2">Prenotazioni</H>
      <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, marginBottom: 24 }}>
        Pianifica ritiri e riconsegne. Le richieste in attesa di conferma sono in <strong>Richieste</strong>.
      </Txt>

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: T.surface, border: `1px dashed ${T.line}`, borderRadius: 14 }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="calendar" size={24} color={T.ink2} T={T} />
          </span>
          <H T={T} size="h4">Nessuna prenotazione</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
            Quando accetterai una richiesta, comparirà qui con tutti i dettagli operativi.
          </Txt>
        </div>
      ) : (
        <>
          <GroupSection T={T} title="In corso" count={groups.inCorso.length} color="success" hint="il cliente ha già ritirato">
            {groups.inCorso.map(b => <BookingRow key={b.id} T={T} booking={b} profile={profiles[b.user_id]} onComplete={onComplete} busyId={busyId} />)}
          </GroupSection>

          <GroupSection T={T} title="Da completare" count={groups.daCompletare.length} color="alert" hint="riconsegna passata, marcale completate">
            {groups.daCompletare.map(b => <BookingRow key={b.id} T={T} booking={b} profile={profiles[b.user_id]} onComplete={onComplete} busyId={busyId} />)}
          </GroupSection>

          <GroupSection T={T} title="In arrivo" count={groups.inArrivo.length} color="accent" hint="prossimi ritiri">
            {groups.inArrivo.map(b => <BookingRow key={b.id} T={T} booking={b} profile={profiles[b.user_id]} onComplete={onComplete} busyId={busyId} />)}
          </GroupSection>

          <GroupSection T={T} title="Storico" count={groups.completate.length} color="neutral" hint="prenotazioni concluse">
            {groups.completate.map(b => <BookingRow key={b.id} T={T} booking={b} profile={profiles[b.user_id]} onComplete={onComplete} busyId={busyId} />)}
          </GroupSection>
        </>
      )}
    </div>
  );
}
