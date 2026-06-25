import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../state/SearchContext.jsx';
import { Icon } from '../components/icons.jsx';
import { Button, H, Txt } from '../components/ui.jsx';
import { DesktopModal } from '../components/DesktopModal.jsx';
import { TimePicker } from '../components/TimePicker.jsx';
import { formatDates, daysBetween } from '../utils/dates.js';

function ScreenHeader({ T, title, onBack, right }) {
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
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
        </button>
      )}
      {title && <H T={T} size="h5" style={{ flex: 1 }}>{title}</H>}
      {right}
    </div>
  );
}

function CalendarMonth({ T, year, monthIndex, today, from, to, onTap }) {
  const { t, i18n } = useTranslation();
  const monthLong = useMemo(() => new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(year, monthIndex, 1)), [i18n.language, year, monthIndex]);
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(i18n.language, { weekday: 'narrow' });
    // 2024-01-01 is a Monday
    return [...Array(7)].map((_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [i18n.language]);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isPast = (d) => {
    if (year < today.y) return true;
    if (year === today.y && monthIndex < today.m) return true;
    if (year === today.y && monthIndex === today.m && d < today.d) return true;
    return false;
  };
  const isToday = (d) => year === today.y && monthIndex === today.m && d === today.d;

  const cmp = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
  const here = (d) => ({ y: year, m: monthIndex, d });
  const isInRange = (d) => {
    if (!from || !to) return false;
    const x = here(d);
    return cmp(x, from) >= 0 && cmp(x, to) <= 0;
  };
  const isStart = (d) => from && cmp(here(d), from) === 0;
  const isEnd = (d) => to && cmp(here(d), to) === 0;
  // Padded first/last day of WEEK have no right/left highlight (so it stays inside the grid).
  const isFirstColumn = (cellIndex) => cellIndex % 7 === 0;
  const isLastColumn = (cellIndex) => cellIndex % 7 === 6;

  return (
    <div style={{ marginBottom: 24 }}>
      <H T={T} size="h5" style={{ marginBottom: 12, textTransform: 'capitalize' }}>{monthLong} {year}</H>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 6 }}>
        {weekdays.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.ink3, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const inRange = isInRange(d);
          const start = isStart(d);
          const end = isEnd(d);
          const past = isPast(d);
          const today_ = isToday(d);
          const firstCol = isFirstColumn(i);
          const lastCol = isLastColumn(i);
          const ariaDate = `${d} ${monthLong} ${year}`;
          const ariaState = past ? t('datepicker.aria_past') :
            (start && end) ? t('datepicker.aria_single') :
            start ? t('datepicker.aria_pickup') :
            end ? t('datepicker.aria_return') :
            inRange ? t('datepicker.aria_inrange') :
            today_ ? t('datepicker.aria_today') : '';
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              aria-label={`${ariaDate}${ariaState}`}
              aria-pressed={start || end || inRange}
              onClick={() => !past && onTap(d)}
              style={{
                border: 'none', background: 'transparent', cursor: past ? 'default' : 'pointer',
                padding: 0, height: 42,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                opacity: past ? 0.3 : 1,
              }}
            >
              {inRange && !start && !end && (
                <span style={{
                  position: 'absolute',
                  top: 4, bottom: 4,
                  left: firstCol ? 4 : 0,
                  right: lastCol ? 4 : 0,
                  background: T.accentSoft,
                }} />
              )}
              {start && to && !end && (
                <span style={{
                  position: 'absolute', top: 4, bottom: 4,
                  left: '50%', right: lastCol ? 4 : 0,
                  background: T.accentSoft,
                }} />
              )}
              {end && from && !start && (
                <span style={{
                  position: 'absolute', top: 4, bottom: 4,
                  left: firstCol ? 4 : 0, right: '50%',
                  background: T.accentSoft,
                }} />
              )}
              {(start || end) && (
                <span style={{ position: 'absolute', width: 36, height: 36, borderRadius: '50%', background: T.ink1 }} />
              )}
              {today_ && !start && !end && (
                <span style={{ position: 'absolute', width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.ink1}` }} />
              )}
              <span style={{
                position: 'relative', zIndex: 1,
                fontFamily: T.fontBody, fontSize: 14, fontWeight: (start || end || today_) ? 700 : 500,
                color: (start || end) ? '#fff' : T.ink1,
              }}>{d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function withYear(stored, defaultYear) {
  if (!stored) return null;
  if (typeof stored.y === 'number') return stored;
  return { ...stored, y: defaultYear };
}

export function DatePicker({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search, updateSearch } = useSearch();
  const todayDate = useMemo(() => new Date(), []);
  const today = useMemo(() => ({
    y: todayDate.getFullYear(),
    m: todayDate.getMonth(),
    d: todayDate.getDate(),
  }), [todayDate]);
  const [from, setFrom] = useState(withYear(search.from, today.y));
  const [to, setTo] = useState(withYear(search.to, today.y));
  const [timeFrom, setTimeFrom] = useState(search.timeFrom || '10:00');
  const [timeTo, setTimeTo] = useState(search.timeTo || '18:00');

  const months = useMemo(() => {
    const list = [];
    for (let i = 0; i < 4; i++) {
      const dt = new Date(today.y, today.m + i, 1);
      list.push({ y: dt.getFullYear(), m: dt.getMonth() });
    }
    return list;
  }, [today]);

  const cmp = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);

  const onTap = (d, m, y) => {
    const date = { d, m, y };
    if (!from || (from && to)) {
      setFrom(date);
      setTo(null);
    } else if (from && !to) {
      if (cmp(date, from) < 0) {
        setFrom(date);
        setTo(null);
      } else if (cmp(date, from) === 0) {
        // tap same day → keep as single-day start, clear to
        setTo(null);
      } else {
        setTo(date);
      }
    }
  };

  const confirm = () => {
    updateSearch({ from, to, timeFrom, timeTo });
    navigate(-1);
  };

  const inner = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      {!isDesktop && (
        <ScreenHeader T={T} title={t('datepicker.title')} onBack={() => navigate(-1)} right={
          <button onClick={() => { setFrom(null); setTo(null); }} aria-label={t('datepicker.reset_aria')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <Txt T={T} size={13} color={T.ink2} style={{ textDecoration: 'underline' }}>{t('datepicker.reset')}</Txt>
          </button>
        } />
      )}
      {isDesktop && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 6px' }}>
          <H T={T} size="h3">{t('datepicker.title')}</H>
          <button onClick={() => { setFrom(null); setTo(null); }} aria-label={t('datepicker.reset')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginRight: 40 }}>
            <Txt T={T} size={13} color={T.ink2} style={{ textDecoration: 'underline' }}>{t('datepicker.reset')}</Txt>
          </button>
        </div>
      )}

      {(from || to) && (
        <div style={{
          flex: 'none', background: T.surfaceAlt, borderBottom: `1px solid ${T.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px' }}>
            <Icon name="calendar" size={14} color={T.ink2} T={T} />
            <Txt T={T} size={13} weight={600} style={{ flex: 1 }}>
              {from && to
                ? `${formatDates(from, to)} · ${t('bookings.days', { count: daysBetween(from, to) })}`
                : from ? t('datepicker.choose_return') : t('datepicker.choose_pickup')}
            </Txt>
            {from && to && (
              <Button T={T} variant="accent" size="sm" iconRight="check" onClick={confirm}>{t('common.confirm')}</Button>
            )}
          </div>
          {from && to && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px 12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Txt T={T} size={12} color={T.ink2}>{t('home.pickup')}</Txt>
                <TimePicker T={T} label={t('booking_form.time_pickup_aria')} value={timeFrom} onChange={setTimeFrom} ariaLabel={t('booking_form.time_pickup_aria')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Txt T={T} size={12} color={T.ink2}>{t('home.return')}</Txt>
                <TimePicker T={T} label={t('booking_form.time_return_aria')} value={timeTo} onChange={setTimeTo} ariaLabel={t('booking_form.time_return_aria')} />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 24px' }}>
        {months.map(({ y, m }) => (
          <CalendarMonth
            key={`${y}-${m}`}
            T={T}
            year={y}
            monthIndex={m}
            today={today}
            from={from}
            to={to}
            onTap={(d) => onTap(d, m, y)}
          />
        ))}
      </div>
      <div style={{ flex: 'none', padding: '12px 18px max(20px, env(safe-area-inset-bottom))', background: T.bg, borderTop: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {from && to ? (
            <>
              <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{formatDates(from, to)}</Txt>
              <Txt T={T} size={11} color={T.ink2}>{t('bookings.days', { count: daysBetween(from, to) })}</Txt>
            </>
          ) : from ? (
            <Txt T={T} size={13} color={T.ink2}>{t('datepicker.choose_return')}</Txt>
          ) : (
            <Txt T={T} size={13} color={T.ink2}>{t('datepicker.choose_pickup')}</Txt>
          )}
        </div>
        <Button T={T} variant="accent" size="lg" disabled={!from || !to} onClick={confirm} iconRight="check"
          style={!(from && to) ? { opacity: 0.45, pointerEvents: 'none' } : {}}>{t('common.confirm')}</Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return <DesktopModal T={T} ariaLabel={t('booking_form.cta_choose_dates')} width={620} height={700}>{inner}</DesktopModal>;
  }
  return inner;
}
