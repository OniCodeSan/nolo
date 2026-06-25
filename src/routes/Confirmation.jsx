import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../state/SearchContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { Icon, CarRender } from '../components/icons.jsx';
import { Button, H, Txt } from '../components/ui.jsx';
import { formatDates } from '../utils/dates.js';
import { createBooking } from '../services/bookings.js';
import { hasSupabase } from '../lib/supabase.js';
import { events as analyticsEvents } from '../lib/analytics.js';
import { HostPoliciesBlock } from '../components/HostPolicies.jsx';

function SummaryRow({ T, icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={14} color={T.ink2} T={T} />
      <Txt T={T} size={12} color={T.ink2} style={{ width: 70 }}>{label}</Txt>
      <Txt T={T} size={13} weight={500} style={{ flex: 1 }}>{value}</Txt>
    </div>
  );
}

function NextStep({ T, icon, l, sub, action }) {
  return (
    <div onClick={action} style={{
      padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md,
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={T.ink1} T={T} />
      </span>
      <div style={{ flex: 1 }}>
        <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{l}</Txt>
        <Txt T={T} size={11} color={T.ink2}>{sub}</Txt>
      </div>
      <Icon name="chevron" size={16} color={T.ink2} T={T} />
    </div>
  );
}

export function Confirmation({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { booking, setBooking } = useSearch();
  const { user, isAuthed } = useAuth();
  const [animateIn, setAnimateIn] = useState(false);
  const [syncState, setSyncState] = useState(hasSupabase && isAuthed ? 'syncing' : 'skipped');
  const insertedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (insertedRef.current) return;
    if (!booking || !isAuthed || !user || !hasSupabase) return;
    insertedRef.current = true;
    setSyncState('syncing');
    createBooking(user.id, booking)
      .then(() => {
        setSyncState('synced');
        analyticsEvents.bookingCompleted({
          car_id: booking.car?.id,
          host_id: booking.host?.id,
          days: booking.days,
          total: booking.total,
        });
      })
      .catch((err) => {
        // In dev logghiamo tutto; in prod Sentry intercetta la creazione (vedi ErrorBoundary
        // e captureException). Evitiamo di stampare l'oggetto err intero per non leakare
        // payload nei breadcrumb console.
        if (import.meta.env.DEV) console.error('[MoviQ] createBooking failed', err);
        else console.error('[MoviQ] createBooking failed:', err?.message || 'unknown');
        setSyncState('error');
      });
  }, [booking, isAuthed, user]);

  if (!booking) return <Navigate to="/" replace />;

  const { car, host } = booking;
  const dateLabel = formatDates(booking.from, booking.to) || t('confirmation.no_dates');

  const goHome = () => {
    setBooking(null);
    navigate('/');
  };

  const wrapPad = isDesktop ? '60px 40px 80px' : '40px 24px 80px';
  const heroBg = T.accent;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          background: heroBg, padding: wrapPad, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ maxWidth: isDesktop ? 720 : '100%', margin: '0 auto' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: T.ink1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: animateIn ? 'scale(1)' : 'scale(0.2)',
            opacity: animateIn ? 1 : 0,
            transition: 'all 500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}>
            <Icon name="check" size={36} color={T.accent} T={T} stroke={3} />
          </div>
          <H T={T} size="h1" style={{
            color: T.ink1, marginTop: 24, lineHeight: 1,
            opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 400ms 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}>
            {t('confirmation.title')}
          </H>
          <Txt T={T} size={15} color={T.ink1} style={{
            display: 'block', marginTop: 10,
            transition: 'opacity 400ms 300ms',
            opacity: animateIn ? 0.78 : 0,
          }}>
            {t('confirmation.subtitle', { host: host.n })}
          </Txt>
          </div>
        </div>

        <div style={{
          padding: isDesktop ? '0 40px 24px' : '0 18px 24px',
          marginTop: -50,
          opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 400ms 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          maxWidth: isDesktop ? 720 : '100%', margin: isDesktop ? '-50px auto 0' : undefined,
          width: '100%', boxSizing: 'border-box',
        }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg,
            padding: 18, boxShadow: T.sh.deep,
          }}>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{t('confirmation.summary')}</Txt>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 80, height: 56, borderRadius: T.r.md, overflow: 'hidden' }}>
                <CarRender T={T} variant={car.variant} tone={car.tone} />
              </div>
              <div style={{ flex: 1 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{car.brand} {car.model} · {car.year}</Txt>
                <Txt T={T} size={11} color={T.ink2}>{host.n}</Txt>
              </div>
            </div>
            <div style={{ height: 1, background: T.line, margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SummaryRow T={T} icon="calendar" label={t('confirmation.dates')} value={booking.days ? `${dateLabel} · ${t('bookings.days', { count: booking.days })}` : dateLabel} />
              <SummaryRow T={T} icon="pin" label={t('home.pickup')} value="Via Milano 12, Sesto S.G." />
              <SummaryRow T={T} icon="euro" label={t('confirmation.total')} value={`${booking.total}€ ${t('confirmation.at_pickup')}`} />
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 14, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Icon name="bell" size={16} color={T.accentDeep} T={T} />
            <div style={{ flex: 1 }}>
              <Txt T={T} size={13} weight={600}>{t('confirmation.push_title')}</Txt>
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>
                {t('confirmation.push_body', { host: host.n, time: host.responseTime })}
              </Txt>
            </div>
          </div>

          {syncState === 'error' && (
            <div style={{ marginTop: 10, padding: 12, background: T.coralSoft, borderRadius: T.r.md }}>
              <Txt T={T} size={12} color={T.alert}>{t('confirmation.sync_error')}</Txt>
            </div>
          )}
          {syncState === 'skipped' && !isAuthed && (
            <div style={{ marginTop: 10, padding: 12, background: T.surfaceAlt, borderRadius: T.r.md }}>
              <Txt T={T} size={12} color={T.ink2}>{t('confirmation.sign_in_to_save')}</Txt>
            </div>
          )}

          <HostPoliciesBlock T={T} host={host} title={t('confirmation.terms_of', { host: host.n })} />

          <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 10 }}>{t('confirmation.what_next')}</H>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <NextStep T={T} icon="chat" l={t('confirmation.message_host', { host: host.n })} sub={t('confirmation.message_host_sub')}
              action={() => navigate('/profilo/messaggi')} />
            <NextStep T={T} icon="heart" l={t('confirmation.save_similar')} sub={t('confirmation.save_similar_sub')}
              action={() => navigate('/cerca')} />
            <NextStep T={T} icon="user" l={t('confirmation.complete_profile')} sub={t('confirmation.complete_profile_sub')}
              action={() => navigate('/profilo/dati')} />
          </div>
        </div>
      </div>

      <div style={{
        flex: 'none',
        background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: isDesktop ? '14px 40px 20px' : '12px 18px max(20px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: isDesktop ? 720 : '100%', margin: '0 auto', display: 'flex', gap: 10 }}>
          <Button T={T} variant="outline" onClick={goHome}>{t('nav.home')}</Button>
          <Button T={T} variant="accent" iconRight="arrowRight" full onClick={() => navigate('/prenotazioni')}>
            {t('confirmation.go_to_bookings')}
          </Button>
        </div>
      </div>
    </div>
  );
}
