import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon, CarRender } from '../components/icons.jsx';
import { Avatar, Badge, Button, H, Txt, Price } from '../components/ui.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useSearch } from '../state/SearchContext.jsx';
import { useToast } from '../state/ToastContext.jsx';
import { UserSidebar } from '../components/UserSidebar.jsx';
import { MessagesSection } from '../components/account/MessagesSection.jsx';
import { NotificationsSection } from '../components/account/NotificationsSection.jsx';
import { SettingsSection } from '../components/account/SettingsSection.jsx';
import { listMyBookings } from '../services/bookings.js';
import { listCars, getMyHost } from '../services/cars.js';

function formatRange(fromIso, toIso, locale) {
  if (!fromIso || !toIso) return '';
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const mf = new Intl.DateTimeFormat(locale, { month: 'short' });
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  if (sameMonth) return `${from.getDate()} — ${to.getDate()} ${mf.format(to)}`;
  return `${from.getDate()} ${mf.format(from)} — ${to.getDate()} ${mf.format(to)}`;
}

function isInArrivo(b) {
  if (!b?.date_from) return false;
  const from = new Date(b.date_from);
  return from.getTime() >= Date.now() - 24 * 3600 * 1000;
}

function SignedOutHero({ T, onLogin }) {
  const { t } = useTranslation();
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 360 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={28} color={T.ink1} T={T} />
        </span>
        <H T={T} size="h3">{t('profile.signed_out_title')}</H>
        <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.55 }}>
          {t('profile.signed_out_body')}
        </Txt>
        <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={onLogin}>{t('profile.signed_out_cta')}</Button>
        <Txt T={T} size={11} color={T.ink3}>{t('profile.signed_out_note')}</Txt>
      </div>
    </div>
  );
}

function StatCard({ T, label, value, sub }) {
  return (
    <div style={{ padding: 18, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14 }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Txt>
      <Txt T={T} size={32} weight={600} style={{ display: 'block', marginTop: 6, fontFamily: T.fontDisplay, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</Txt>
      <Txt T={T} size={12} color={T.ink2}>{sub}</Txt>
    </div>
  );
}

function PanoramicaContent({ T, isDesktop, displayName, bookings, allCars, hostLink }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { saved } = useSearch();
  const upcoming = bookings.filter(isInArrivo)[0];
  const carById = useMemo(() => Object.fromEntries(allCars.map(c => [c.id, c])), [allCars]);
  const upcomingCar = upcoming && carById[upcoming.car_id];

  const stats = [
    { l: t('profile.stat_bookings'), v: bookings.length, s: t('profile.stat_bookings_sub') },
    { l: t('profile.stat_upcoming'), v: bookings.filter(isInArrivo).length, s: t('profile.stat_upcoming_sub') },
    { l: t('profile.stat_saved'), v: saved.size, s: t('profile.stat_saved_sub') },
    { l: t('profile.stat_account'), v: hostLink ? t('profile.account_pro') : t('profile.account_std'), s: hostLink ? t('profile.account_pro_sub') : t('profile.account_std_sub') },
  ];

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px' }}>
      <Txt T={T} size={13} color={T.ink2}>{t('profile.hello')}</Txt>
      <H T={T} size={isDesktop ? 'h1' : 'h2'} style={{ lineHeight: 1, marginTop: 2 }}>{displayName} 👋</H>

      {upcoming && upcomingCar ? (
        <div style={{
          marginTop: 24, background: T.accent, borderRadius: 18, padding: isDesktop ? 24 : 18,
          boxShadow: T.sh.raised, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', gap: isDesktop ? 24 : 14, flexWrap: 'wrap',
        }}>
          <div style={{ width: isDesktop ? 220 : 130, height: isDesktop ? 140 : 90, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
            <CarRender T={T} variant={upcomingCar.variant} tone={upcomingCar.tone} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Badge T={T} tone="dark">{t('profile.upcoming_prefix')} · {t('bookings.days', { count: Math.max(0, Math.ceil((new Date(upcoming.date_from).getTime() - Date.now()) / (24*3600*1000))) })}</Badge>
            <H T={T} size={isDesktop ? 'h2' : 'h3'} style={{ marginTop: 8, color: T.ink1, lineHeight: 1.1 }}>{upcomingCar.brand} {upcomingCar.model} · {upcomingCar.year}</H>
            <Txt T={T} size={isDesktop ? 14 : 12} color={T.ink1} style={{ display: 'block', marginTop: 4, opacity: 0.78 }}>
              {formatRange(upcoming.date_from, upcoming.date_to, i18n.language)} · {upcoming.total}€
            </Txt>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <Button T={T} variant="primary" size="sm" iconRight="arrowRight" onClick={() => navigate(`/prenotazioni/${upcoming.id}`)}>{t('profile.see_details')}</Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: 24, padding: 24, background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="car" size={26} color={T.ink2} T={T} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <H T={T} size="h4">{t('profile.no_upcoming_title')}</H>
            <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>{t('profile.no_upcoming_body')}</Txt>
          </div>
          <Button T={T} variant="accent" size="md" iconRight="arrowRight" onClick={() => navigate('/cerca')}>{t('bookings.search_car')}</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: 14, marginTop: 24 }}>
        {stats.map((s, i) => <StatCard key={i} T={T} label={s.l} value={s.v} sub={s.s} />)}
      </div>

      <div style={{ marginTop: 24, padding: 18, background: hostLink ? T.greenSoft : T.surface, border: `1px solid ${T.line}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: T.ink1, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="car" size={20} color="#fff" T={T} />
        </span>
        <div style={{ flex: 1 }}>
          <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>
            {hostLink ? t('profile.host_have_title') : t('profile.host_promo_title')}
          </Txt>
          <Txt T={T} size={12} color={T.ink2}>
            {hostLink ? t('profile.host_backoffice', { name: hostLink.n }) : t('profile.host_promo_body')}
          </Txt>
        </div>
        <Button T={T} variant={hostLink ? 'outline' : 'accent'} size="sm" iconRight="arrowRight" onClick={() => navigate('/noleggia')}>
          {hostLink ? t('profile.host_open') : t('profile.host_become')}
        </Button>
      </div>
    </div>
  );
}

function ProfileDataContent({ T, isDesktop }) {
  const { t } = useTranslation();
  const { user, profile, updateProfile, signOut } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setCity(profile?.city || '');
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: name, phone, city });
      toast.success(t('profile.toast_saved'));
    } catch (err) {
      toast.error(err.message || t('profile.toast_error'));
    } finally {
      setSaving(false);
    }
  };

  const input = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10,
    fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 760 }}>
      <H T={T} size="h2">{t('profile.my_data')}</H>
      <div style={{ marginTop: 20, padding: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label>
          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{t('profile.full_name')}</Txt>
          <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
        </label>
        <label>
          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{t('profile.email')}</Txt>
          <input value={user.email} disabled style={{ ...input, opacity: 0.6 }} />
        </label>
        <label>
          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{t('profile.phone')}</Txt>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 …" style={input} />
        </label>
        <label>
          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{t('profile.city')}</Txt>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Milano" style={input} />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Button T={T} variant="ghost" size="md" onClick={signOut}>{t('auth.sign_out')}</Button>
          <Button T={T} variant="accent" size="md" iconRight="check" onClick={save} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionPlaceholder({ T, isDesktop, title, hint, icon = 'sparkle' }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: isDesktop ? '28px 36px' : '20px 18px' }}>
      <H T={T} size="h2">{title}</H>
      <div style={{ marginTop: 22, padding: 48, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={26} color={T.ink2} T={T} />
        </span>
        <H T={T} size="h4" style={{ marginTop: 12 }}>{t('profile.coming_soon')}</H>
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>{hint}</Txt>
      </div>
    </div>
  );
}

export function Profile({ T, isDesktop, section = 'panoramica' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthed, user, profile, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [hostLink, setHostLink] = useState(null);

  useEffect(() => {
    if (!isAuthed || !user) return;
    let cancelled = false;
    Promise.all([listMyBookings(user.id), listCars(), getMyHost(user.id).catch(() => null)])
      .then(([bks, cars, myHost]) => {
        if (cancelled) return;
        setBookings(bks); setAllCars(cars); setHostLink(myHost);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthed, user?.id]);

  if (!isAuthed) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
        <div style={{ flex: 'none', padding: '14px 18px 12px', borderBottom: `1px solid ${T.line}` }}>
          <H T={T} size="h3">{t('profile.header')}</H>
        </div>
        <SignedOutHero T={T} onLogin={openAuthModal} />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || t('profile.user_fallback');
  const inArrivoCount = bookings.filter(isInArrivo).length;
  const counts = {
    prenotazioni: bookings.length,
    salvati: undefined,
    messaggi: undefined,
  };

  const Content = () => {
    if (section === 'panoramica') return <PanoramicaContent T={T} isDesktop={isDesktop} displayName={displayName} bookings={bookings} allCars={allCars} hostLink={hostLink} />;
    if (section === 'dati') return <ProfileDataContent T={T} isDesktop={isDesktop} />;
    if (section === 'messaggi') return <MessagesSection T={T} isDesktop={isDesktop} />;
    if (section === 'notifiche') return <NotificationsSection T={T} isDesktop={isDesktop} />;
    if (section === 'impostazioni') return <SettingsSection T={T} isDesktop={isDesktop} />;
    return <PanoramicaContent T={T} isDesktop={isDesktop} displayName={displayName} bookings={bookings} allCars={allCars} hostLink={hostLink} />;
  };

  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 60px)' }}>
        <UserSidebar T={T} counts={counts} />
        <div style={{ background: T.bg, overflow: 'auto', minWidth: 0 }}>
          <Content />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <Content />
    </div>
  );
}
