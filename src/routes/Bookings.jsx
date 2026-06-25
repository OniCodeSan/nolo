import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, CarRender } from '../components/icons.jsx';
import { Badge, Button, H, Txt } from '../components/ui.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { listMyBookings } from '../services/bookings.js';
import { getCar } from '../services/cars.js';

const STATUS_TONE = {
  requested: 'accent', confirmed: 'success', declined: 'alert', cancelled: 'neutral', completed: 'neutral',
};

function formatIsoRange(fromIso, toIso, lang) {
  if (!fromIso || !toIso) return '';
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const month = (d) => new Intl.DateTimeFormat(lang, { month: 'short' }).format(d);
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  if (sameMonth) return `${from.getDate()} — ${to.getDate()} ${month(from)}`;
  return `${from.getDate()} ${month(from)} — ${to.getDate()} ${month(to)}`;
}

function BookingCard({ T, booking, onClick }) {
  const { t, i18n } = useTranslation();
  const car = booking._car;
  const tone = STATUS_TONE[booking.status] || STATUS_TONE.requested;
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', border: 'none',
      background: T.surface, borderRadius: T.r.lg, padding: 14,
      boxShadow: T.sh.soft, cursor: 'pointer',
      display: 'flex', gap: 12, alignItems: 'stretch',
    }}>
      <div style={{ width: 110, flex: 'none' }}>
        <div style={{ borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
          {car ? <CarRender T={T} variant={car.variant} tone={car.tone} /> : <div style={{ background: T.surfaceAlt, height: '100%' }} />}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {car ? `${car.brand} ${car.model}` : t('bookings.car_fallback')}
            </Txt>
            <Badge T={T} tone={tone}>{t(`bookings.status_${booking.status}`, { defaultValue: t('bookings.status_requested') })}</Badge>
          </div>
          <Txt T={T} size={11} color={T.ink2}>
            {formatIsoRange(booking.date_from, booking.date_to, i18n.language)} · {t('bookings.days', { count: booking.days })}
            {(booking.time_from || booking.time_to) && ` · ${booking.time_from || '—'}–${booking.time_to || '—'}`}
          </Txt>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Txt T={T} size={11} color={T.ink3}>{t('bookings.requested_on', { date: new Date(booking.created_at).toLocaleDateString(i18n.language) })}</Txt>
          <Txt T={T} size={14} weight={700}>{booking.total}€</Txt>
        </div>
      </div>
    </button>
  );
}

function SignedOutHero({ T, onLogin }) {
  const { t } = useTranslation();
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 320 }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="calendar" size={26} color={T.ink1} T={T} />
        </span>
        <H T={T} size="h4">{t('bookings.signed_out_title')}</H>
        <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.5 }}>
          {t('bookings.signed_out_body')}
        </Txt>
        <Button T={T} variant="accent" size="md" iconRight="arrowRight" onClick={onLogin}>{t('auth.sign_in')}</Button>
      </div>
    </div>
  );
}

export function Bookings({ T }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthed, user, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthed || !user) return;
    let cancelled = false;
    setLoading(true);
    listMyBookings(user.id)
      .then(async (rows) => {
        const carIds = [...new Set(rows.map(r => r.car_id))];
        const cars = await Promise.all(carIds.map(id => getCar(id).catch(() => null)));
        const carMap = Object.fromEntries(carIds.map((id, i) => [id, cars[i]]));
        if (cancelled) return;
        setBookings(rows.map(r => ({ ...r, _car: carMap[r.car_id] })));
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthed, user?.id]);

  if (!isAuthed) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
        <div style={{ flex: 'none', padding: '14px 18px 12px', borderBottom: `1px solid ${T.line}` }}>
          <H T={T} size="h3">{t('bookings.title')}</H>
        </div>
        <SignedOutHero T={T} onLogin={openAuthModal} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 'none', padding: '14px 18px 12px', borderBottom: `1px solid ${T.line}` }}>
        <H T={T} size="h3">Prenotazioni</H>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Txt T={T} size={13} color={T.ink3}>{t('common.loading')}</Txt>
        </div>
      ) : error ? (
        <div style={{ flex: 1, padding: 24 }}>
          <Txt T={T} size={13} color={T.coral}>{t('common.error_generic')}</Txt>
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: 320 }}>
            <span style={{ width: 48, height: 48, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="calendar" size={22} color={T.ink2} T={T} />
            </span>
            <H T={T} size="h4">{t('bookings.empty_title')}</H>
            <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.5 }}>
              {t('bookings.empty_body')}
            </Txt>
            <Button T={T} variant="accent" size="md" iconRight="arrowRight" onClick={() => navigate('/cerca')}>{t('bookings.search_car')}</Button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookings.map(b => (
            <BookingCard key={b.id} T={T} booking={b} onClick={() => navigate(`/prenotazioni/${b.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
