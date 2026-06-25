import { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, CarRender } from '../components/icons.jsx';
import { Avatar, Badge, Button, H, Txt, Rating } from '../components/ui.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useToast } from '../state/ToastContext.jsx';
import { getBooking, cancelBooking } from '../services/bookings.js';
import { getCar, getHost } from '../services/cars.js';
import i18n from '../i18n/index.js';
import { HostPoliciesBlock } from '../components/HostPolicies.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';

const STATUS_TONE = {
  requested: 'accent', confirmed: 'success', declined: 'alert', cancelled: 'neutral', completed: 'neutral',
};

function formatIsoRange(fromIso, toIso) {
  if (!fromIso || !toIso) return '';
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const month = (d) => new Intl.DateTimeFormat(i18n.language || 'it', { month: 'short' }).format(d);
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  if (sameMonth) return `${from.getDate()} — ${to.getDate()} ${month(from)} ${from.getFullYear()}`;
  return `${from.getDate()} ${month(from)} — ${to.getDate()} ${month(to)} ${to.getFullYear()}`;
}

function ScreenHeader({ T, title, onBack }) {
  const { t } = useTranslation();
  return (
    <div style={{
      flex: 'none', display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px', background: T.bg, borderBottom: `1px solid ${T.line}`,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <button onClick={onBack} aria-label={t('common.back')} style={{
        border: 'none', background: 'transparent', cursor: 'pointer', padding: 6,
        margin: '-6px 0 -6px -6px',
      }}>
        <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
      </button>
      <H T={T} size="h5" style={{ flex: 1 }}>{title}</H>
    </div>
  );
}

function CostRow({ T, label, value, hint, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <Txt T={T} size={bold ? 15 : 13} weight={bold ? 700 : 400} color={bold ? T.ink1 : T.ink2}>{label}</Txt>
        {hint && <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{hint}</Txt>}
      </div>
      <Txt T={T} size={bold ? 18 : 14} weight={bold ? 700 : 500} color={T.ink1} style={bold ? { fontFamily: T.fontDisplay } : {}}>{value}</Txt>
    </div>
  );
}

export function BookingDetail({ T }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthed } = useAuth();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (!isAuthed || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const b = await getBooking(user.id, id);
        if (cancelled) return;
        if (!b) { setError(t('booking_detail.not_found')); setLoading(false); return; }
        setBooking(b);
        const [c, h] = await Promise.all([
          b.car_id ? getCar(b.car_id) : Promise.resolve(null),
          b.host_id ? getHost(b.host_id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setCar(c); setHost(h);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthed, user?.id, id]);

  if (!isAuthed) return <Navigate to="/prenotazioni" replace />;

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
        <ScreenHeader T={T} title={t('booking_detail.title')} onBack={() => navigate('/prenotazioni')} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Txt T={T} size={13} color={T.ink3}>{t('common.loading')}</Txt>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
        <ScreenHeader T={T} title={t('booking_detail.title')} onBack={() => navigate('/prenotazioni')} />
        <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Txt T={T} size={13} color={T.coral}>{error || t('booking_detail.not_found')}</Txt>
        </div>
      </div>
    );
  }

  const statusKey = STATUS_TONE[booking.status] ? booking.status : 'requested';
  const statusTone = STATUS_TONE[statusKey];
  const canCancel = booking.status === 'requested' || booking.status === 'confirmed';

  const onCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(user.id, booking.id);
      setBooking({ ...booking, status: 'cancelled' });
      toast.success(t('booking_detail.cancelled_toast'));
      setConfirmCancel(false);
    } catch (err) {
      toast.error(t('common.error_generic'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <ScreenHeader T={T} title="Prenotazione" onBack={() => navigate('/prenotazioni')} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 24px' }}>
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, boxShadow: T.sh.soft, display: 'flex', gap: 12, alignItems: 'center' }}>
          {car ? (
            <div style={{ width: 110, flex: 'none', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
              <CarRender T={T} variant={car.variant} tone={car.tone} />
            </div>
          ) : <div style={{ width: 110, aspectRatio: '1.4 / 1', background: T.surfaceAlt, borderRadius: T.r.md }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>
              {car ? `${car.brand} ${car.model} · ${car.year}` : t('bookings.car_fallback')}
            </Txt>
            {host && <Txt T={T} size={12} color={T.ink2}>{host.n} · {car?.city}</Txt>}
            <Badge T={T} tone={statusTone} style={{ marginTop: 6 }}>{t(`booking_detail.status_${statusKey}`)}</Badge>
          </div>
        </div>

        <div style={{ marginTop: 14, padding: 12, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="bell" size={16} color={T.accentDeep} T={T} />
          <Txt T={T} size={12} color={T.ink1} style={{ flex: 1, lineHeight: 1.5 }}>{t(`booking_detail.hint_${statusKey}`)}</Txt>
        </div>

        {booking.host_response && booking.status === 'confirmed' && (
          <div style={{ marginTop: 12, padding: 14, background: T.greenSoft, borderRadius: T.r.md }}>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              {t('booking_detail.message_from', { host: host?.n || t('booking_detail.host_fallback') })}
            </Txt>
            <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{booking.host_response}</Txt>
          </div>
        )}

        {booking.decline_reason && booking.status === 'declined' && (
          <div style={{ marginTop: 12, padding: 14, background: T.coralSoft, borderRadius: T.r.md }}>
            <Txt T={T} size={11} weight={600} color={T.alert} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              {t('booking_detail.decline_reason')}
            </Txt>
            <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{booking.decline_reason}</Txt>
          </div>
        )}

        <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 8 }}>{t('confirmation.dates')}</H>
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg }}>
          <Txt T={T} size={14} weight={600}>{formatIsoRange(booking.date_from, booking.date_to)}</Txt>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
            {t('bookings.days', { count: booking.days })} · {t('booking_detail.pickup_at')} {booking.time_from || '10:00'} · {t('booking_detail.return_at')} {booking.time_to || '18:00'}
          </Txt>
        </div>

        {host && (
          <>
            <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 8 }}>{t('booking_detail.host')}</H>
            <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar T={T} name={host.n} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{host.n}</Txt>
                <Rating T={T} value={host.rating} count={host.reviews} size={12} />
              </div>
              <Button T={T} variant="outline" size="sm" icon="chat" onClick={() => navigate(`/profilo/messaggi?b=${booking.id}`)}>{t('booking_detail.write')}</Button>
            </div>
          </>
        )}

        <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 8 }}>{t('booking_detail.costs')}</H>
        <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CostRow T={T} label={`${booking.price_per_day}€ × ${t('bookings.days', { count: booking.days })}`} value={`${booking.subtotal}€`} />
          <CostRow T={T} label={t('booking_detail.deposit')} value={`${booking.deposit}€`} hint={t('booking_detail.deposit_hint')} />
          <CostRow T={T} label={t('booking_detail.platform_fee')} value={t('booking_detail.included')} />
          <div style={{ height: 1, background: T.line, margin: '4px 0' }} />
          <CostRow T={T} label={t('confirmation.total')} value={`${booking.total}€`} bold />
        </div>

        {host && <HostPoliciesBlock T={T} host={host} title={t('confirmation.terms_of', { host: host.n })} />}

        {booking.message && (
          <>
            <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 8 }}>{t('booking_detail.your_message')}</H>
            <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg }}>
              <Txt T={T} size={13} color={T.ink1} style={{ lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{booking.message}</Txt>
            </div>
          </>
        )}

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {car && (
            <Button T={T} variant="outline" size="md" iconRight="chevron" full onClick={() => navigate(`/auto/${car.id}`)}>
              {t('booking_detail.view_car')}
            </Button>
          )}
          {canCancel && (
            <Button T={T} variant="ghost" size="md" full onClick={() => setConfirmCancel(true)} disabled={cancelling}
              style={{ color: T.coral }}>
              {t('booking_detail.cancel_booking')}
            </Button>
          )}
        </div>

        <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginTop: 18, textAlign: 'center' }}>
          {t('booking_detail.booking_code', { code: booking.id.slice(0, 8).toUpperCase() })}
        </Txt>
      </div>

      <ConfirmDialog
        T={T}
        open={confirmCancel}
        title={t('booking_detail.cancel_confirm_title')}
        body={booking.status === 'confirmed'
          ? t('booking_detail.cancel_confirm_body_confirmed', { host: host?.n || t('booking_detail.host_fallback') })
          : t('booking_detail.cancel_confirm_body_requested')}
        confirmLabel={t('booking_detail.cancel_yes')}
        cancelLabel={t('booking_detail.cancel_no')}
        tone="danger"
        onConfirm={onCancel}
        onClose={() => setConfirmCancel(false)}
        busy={cancelling}
      />
    </div>
  );
}
