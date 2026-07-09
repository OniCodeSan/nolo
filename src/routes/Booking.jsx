import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useSearch } from '../state/SearchContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { Icon, CarRender } from '../components/icons.jsx';
import { Button, H, Txt, Rating, Price } from '../components/ui.jsx';
import { TimePicker } from '../components/TimePicker.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getCar, getHost } from '../services/cars.js';
import { daysBetween, monthName } from '../utils/dates.js';

function ScreenHeader({ T, title, onBack }) {
  return (
    <div style={{
      flex: 'none',
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px',
      background: T.bg,
      borderBottom: `1px solid ${T.line}`,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 6,
          margin: '-6px 0 -6px -6px',
        }}>
          <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
        </button>
      )}
      {title && <H T={T} size="h5" style={{ flex: 1 }}>{title}</H>}
    </div>
  );
}

function DateBlock({ T, label, date, time, onDateClick, onTimeChange, ariaTimeLabel, changeAria, chooseLabel }) {
  return (
    <div style={{ flex: 1, padding: '14px 16px' }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{label}</Txt>
      <button onClick={onDateClick} aria-label={changeAria} style={{
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'block', textAlign: 'left',
      }}>
        <Txt T={T} size={15} weight={600} style={{ display: 'block', marginTop: 4 }}>
          {date ? `${date.d} ${monthName(date.m)}` : chooseLabel}
        </Txt>
      </button>
      <div style={{ marginTop: 6 }}>
        <TimePicker T={T} label={label} value={time} onChange={onTimeChange} ariaLabel={ariaTimeLabel} />
      </div>
    </div>
  );
}

function CostRow({ T, label, value, hint, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <Txt T={T} size={bold ? 15 : 13} weight={bold ? 700 : 400} color={bold ? T.ink1 : T.ink2}>{label}</Txt>
        {hint && <Txt T={T} size={10} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{hint}</Txt>}
      </div>
      <Txt T={T} size={bold ? 18 : 14} weight={bold ? 700 : 500} color={T.ink1} style={bold ? { fontFamily: T.fontDisplay } : {}}>{value}</Txt>
    </div>
  );
}

export function Booking({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { search, updateSearch, setBooking } = useSearch();
  const { isAuthed, openAuthModal } = useAuth();
  const [message, setMessage] = useState('');

  const carQ = useAsync(() => getCar(id), [id]);
  const car = carQ.data;
  const hostQ = useAsync(() => car ? getHost(car.host) : Promise.resolve(null), [car?.host]);
  const host = hostQ.data;

  if (carQ.loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <Txt T={T} size={13} color={T.ink3}>{t('common.loading')}</Txt>
      </div>
    );
  }
  if (!car) return <Navigate to="/cerca" replace />;
  if (!host) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <Txt T={T} size={13} color={T.ink3}>{t('booking_form.loading_host')}</Txt>
      </div>
    );
  }
  const hasDates = Boolean(search.from && search.to);
  const days = daysBetween(search.from, search.to);
  const subtotal = car.pricePerDay * days;
  const deposit = car.deposit ?? 200;
  const total = subtotal + deposit;

  const confirm = () => {
    if (!hasDates) {
      navigate('/cerca/quando');
      return;
    }
    setBooking({
      car, host, days, subtotal, deposit, total,
      from: search.from, to: search.to,
      timeFrom: search.timeFrom, timeTo: search.timeTo,
      message: message.trim() || null,
    });
    if (!isAuthed) {
      openAuthModal();
      return;
    }
    navigate('/conferma');
  };

  const ctaLabel = !hasDates
    ? t('booking_form.cta_choose_dates')
    : !isAuthed
      ? t('booking_form.cta_signin_send')
      : t('booking_form.cta_confirm_send');

  if (isDesktop) {
    return (
      <div style={{ flex: 1, background: T.bg, overflow: 'auto' }}>
        <div style={{ padding: '24px 40px 0', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 0', color: T.ink2, fontFamily: T.fontBody, fontSize: 13 }}>
            <Icon name="chevronLeft" size={16} color={T.ink2} T={T} /> {t('booking_form.back_to_car')}
          </button>
          <H T={T} size="h1" style={{ marginTop: 14 }}>{t('booking_form.title')}</H>
        </div>
        <div style={{ padding: '24px 40px 60px', maxWidth: 1100, margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
          <div>
            <div style={{ padding: 18, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', gap: 16, boxShadow: T.sh.soft }}>
              <div style={{ width: 160, flex: 'none', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
                <CarRender T={T} variant={car.variant} tone={car.tone} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Txt T={T} size={16} weight={600} style={{ display: 'block' }}>{car.brand} {car.model} · {car.year}</Txt>
                <Txt T={T} size={13} color={T.ink2}>{host.n} · {car.city}</Txt>
                <Rating T={T} value={host.rating} count={host.reviews} size={12} />
              </div>
            </div>

            <H T={T} size="h4" style={{ marginTop: 24, marginBottom: 10 }}>{t('booking_form.your_dates')}</H>
            {!hasDates && (
              <div style={{ marginBottom: 10, padding: '10px 12px', background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="calendar" size={14} color={T.accentDeep} T={T} />
                <Txt T={T} size={12} color={T.ink1}>{t('booking_form.choose_dates_hint')}</Txt>
              </div>
            )}
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', position: 'relative' }}>
              <DateBlock T={T} label={t('home.pickup')} date={search.from} time={search.timeFrom}
                onDateClick={() => navigate('/cerca/quando')}
                onTimeChange={(tt) => updateSearch({ timeFrom: tt })}
                ariaTimeLabel={t('booking_form.time_pickup_aria')}
                changeAria={t('booking_form.change_date_aria', { label: t('home.pickup') })}
                chooseLabel={t('booking_form.choose_date')} />
              <div style={{ width: 1, background: T.line }} />
              <DateBlock T={T} label={t('home.return')} date={search.to} time={search.timeTo}
                onDateClick={() => navigate('/cerca/quando')}
                onTimeChange={(tt) => updateSearch({ timeTo: tt })}
                ariaTimeLabel={t('booking_form.time_return_aria')}
                changeAria={t('booking_form.change_date_aria', { label: t('home.return') })}
                chooseLabel={t('booking_form.choose_date')} />
            </div>

            <H T={T} size="h4" style={{ marginTop: 24, marginBottom: 10 }}>{t('booking_form.pickup_at_label')}</H>
            <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="pin" size={20} color={T.ink1} T={T} />
              <div style={{ flex: 1 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{car.pickupLocation || car.city || '—'}</Txt>
                <Txt T={T} size={12} color={T.ink2}>{[car.city, car.distance && `${t('listing.at')} ${car.distance}`].filter(Boolean).join(' · ')}</Txt>
              </div>
              <Icon name="map" size={20} color={T.ink2} T={T} />
            </div>

            <H T={T} size="h4" style={{ marginTop: 24, marginBottom: 10 }}>{t('booking_form.message_to', { host: host.n })} <Txt T={T} size={12} color={T.ink2}>{t('booking_form.optional')}</Txt></H>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('booking_form.message_ph')}
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '14px 16px', background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: T.r.md, minHeight: 96,
                fontFamily: T.fontBody, fontSize: 14, color: T.ink1,
                resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          <aside>
            <div style={{
              position: 'sticky', top: 90,
              background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.lg, padding: 22, boxShadow: T.sh.raised,
            }}>
              <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{t('booking_form.cost_summary')}</Txt>
              {hasDates ? (
                <>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <CostRow T={T} label={`${car.pricePerDay}€ × ${t('bookings.days', { count: days })}`} value={`${subtotal}€`} />
                    <CostRow T={T} label={t('booking_detail.deposit')} value={`${deposit}€`} hint={t('booking_detail.deposit_hint')} />
                    <CostRow T={T} label={t('booking_detail.platform_fee')} value={t('booking_detail.included')} />
                  </div>
                  <div style={{ height: 1, background: T.line, margin: '14px 0' }} />
                  <CostRow T={T} label={t('confirmation.total')} value={`${total}€`} bold />
                </>
              ) : (
                <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 12 }}>
                  {t('booking_form.set_dates_for_total')}
                </Txt>
              )}

              <div style={{ marginTop: 18, padding: 12, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Icon name="sparkle" size={14} color={T.accentDeep} T={T} />
                <Txt T={T} size={12} color={T.ink1} style={{ flex: 1, lineHeight: 1.5 }}>
                  <strong>{t('booking_form.no_charge')}</strong> {t('booking_form.pay_at_pickup')}
                </Txt>
              </div>

              <Button T={T} variant="accent" size="lg" full iconRight="arrowRight" onClick={confirm} style={{ marginTop: 18 }}>
                {ctaLabel}
              </Button>
              <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
                {t('booking_form.replies_24h', { host: host.n })}
              </Txt>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <ScreenHeader T={T} title={t('booking_form.title')} onBack={() => navigate(-1)} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px' }}>
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', gap: 12, boxShadow: T.sh.soft }}>
          <div style={{ width: 100, flex: 'none' }}>
            <div style={{ borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
              <CarRender T={T} variant={car.variant} tone={car.tone} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{car.brand} {car.model} · {car.year}</Txt>
            <Txt T={T} size={11} color={T.ink2}>{host.n} · {car.city}</Txt>
            <Rating T={T} value={host.rating} count={host.reviews} size={11} />
          </div>
        </div>

        <H T={T} size="h5" style={{ marginTop: 20, marginBottom: 8 }}>{t('booking_form.your_dates')}</H>
        {!hasDates && (
          <div style={{ marginBottom: 8, padding: '10px 12px', background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="calendar" size={14} color={T.accentDeep} T={T} />
            <Txt T={T} size={12} color={T.ink1}>{t('booking_form.choose_dates_hint')}</Txt>
          </div>
        )}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', position: 'relative' }}>
          <DateBlock T={T} label={t('home.pickup')} date={search.from} time={search.timeFrom}
            onDateClick={() => navigate('/cerca/quando')}
            onTimeChange={(tt) => updateSearch({ timeFrom: tt })}
            ariaTimeLabel={t('booking_form.time_pickup_aria')}
            changeAria={t('booking_form.change_date_aria', { label: t('home.pickup') })}
            chooseLabel={t('booking_form.choose_date')} />
          <div style={{ width: 1, background: T.line }} />
          <DateBlock T={T} label={t('home.return')} date={search.to} time={search.timeTo}
            onDateClick={() => navigate('/cerca/quando')}
            onTimeChange={(tt) => updateSearch({ timeTo: tt })}
            ariaTimeLabel={t('booking_form.time_return_aria')}
            changeAria={t('booking_form.change_date_aria', { label: t('home.return') })}
            chooseLabel={t('booking_form.choose_date')} />
        </div>

        <H T={T} size="h5" style={{ marginTop: 20, marginBottom: 8 }}>{t('booking_form.pickup_at_label')}</H>
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="pin" size={20} color={T.ink1} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{car.pickupLocation || car.city || '—'}</Txt>
            <Txt T={T} size={11} color={T.ink2}>{[car.city, car.distance && `${t('listing.at')} ${car.distance}`].filter(Boolean).join(' · ')}</Txt>
          </div>
          <Icon name="map" size={20} color={T.ink2} T={T} />
        </div>

        <H T={T} size="h5" style={{ marginTop: 20, marginBottom: 8 }}>{t('booking_form.cost_summary')}</H>
        <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hasDates ? (
            <>
              <CostRow T={T} label={`${car.pricePerDay}€ × ${t('bookings.days', { count: days })}`} value={`${subtotal}€`} />
              <CostRow T={T} label={t('booking_detail.deposit')} value={`${deposit}€`} hint={t('booking_detail.deposit_hint')} />
              <CostRow T={T} label={t('booking_detail.platform_fee')} value={t('booking_detail.included')} />
              <div style={{ height: 1, background: T.line, margin: '4px 0' }} />
              <CostRow T={T} label={t('confirmation.total')} value={`${total}€`} bold />
            </>
          ) : (
            <Txt T={T} size={13} color={T.ink2}>{t('booking_form.set_dates_for_total')}</Txt>
          )}
        </div>

        <div style={{ marginTop: 16, padding: 12, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="sparkle" size={16} color={T.accentDeep} T={T} />
          <Txt T={T} size={12} color={T.ink1} style={{ flex: 1, lineHeight: 1.5 }}>
            <strong>{t('booking_form.no_charge')}</strong> {t('booking_form.no_charge_body_mobile', { host: host.n })}
          </Txt>
        </div>

        <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 8 }}>{t('booking_form.message_to', { host: host.n })} <Txt T={T} size={11} color={T.ink2}>{t('booking_form.optional')}</Txt></H>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('booking_form.message_ph')}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 14px', background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.md, minHeight: 70, marginBottom: 24,
            fontFamily: T.fontBody, fontSize: 13, color: T.ink1,
            resize: 'vertical', outline: 'none',
          }}
        />
      </div>

      <div style={{
        flex: 'none',
        background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: '12px 18px max(20px, env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div>
          {hasDates ? (
            <>
              <Price T={T} value={total} unit="" size="lg" weight={700} />
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>{t('booking_form.all_included')}</Txt>
            </>
          ) : (
            <Txt T={T} size={12} color={T.ink2}>{t('confirmation.no_dates')}</Txt>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={confirm}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
