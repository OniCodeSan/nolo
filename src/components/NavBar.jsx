import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Button, Txt, Avatar } from './ui.jsx';
import { Icon } from './icons.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { countUnreadNotifications } from '../services/notifications.js';

// Nav principale. La voce "Per noleggiatori" porta alla LANDING marketing,
// non al backoffice. Per gli host la nascondiamo (loro sono già dentro).
// id = identità stabile (stato attivo), key = chiave i18n del testo.
const BASE_ITEMS = [
  { id: 'explore', to: '/',      key: 'nav.explore' },
  { id: 'map',     to: '/cerca', key: 'nav.map' },
  { id: 'help',    to: '/aiuto', key: 'nav.help' },
];
const PER_NOLEGGIATORI = { id: 'hosts', to: '/per-noleggiatori', key: 'nav.for_hosts' };

function ProfileMenu({ T, displayName, isHost, onClose, onNavigate, onSignOut }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [onClose]);

  const Item = ({ icon, label, onClick, danger }) => (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      color: danger ? T.coral : T.ink1,
    }}>
      <Icon name={icon} size={16} color={danger ? T.coral : T.ink2} T={T} />
      <Txt T={T} size={14} color="currentColor">{label}</Txt>
    </button>
  );

  return (
    <div ref={ref} role="menu" style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60,
      minWidth: 220, background: T.bg, border: `1px solid ${T.line}`,
      borderRadius: T.r.md, boxShadow: T.sh.deep, overflow: 'hidden',
      padding: '6px 0',
    }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.line}` }}>
        <Txt T={T} size={13} weight={600}>{displayName}</Txt>
      </div>
      {isHost ? (
        <Item icon="car" label={t('nav.host_backoffice')} onClick={() => onNavigate('/noleggia')} />
      ) : (
        <>
          <Item icon="user" label={t('nav.profile')} onClick={() => onNavigate('/profilo')} />
          <Item icon="calendar" label={t('nav.bookings')} onClick={() => onNavigate('/prenotazioni')} />
          <Item icon="heart" label={t('nav.saved')} onClick={() => onNavigate('/salvati')} />
        </>
      )}
      <div style={{ height: 1, background: T.line, margin: '6px 0' }} />
      <Item icon="x" label={t('auth.sign_out')} onClick={onSignOut} danger />
    </div>
  );
}

export function NavBar({ T }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthed, isHost, user, profile, openAuthModal, signOut } = useAuth();
  const items = isHost ? BASE_ITEMS : [...BASE_ITEMS.slice(0, 2), PER_NOLEGGIATORI, ...BASE_ITEMS.slice(2)];
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthed) { setUnread(0); return; }
    let cancelled = false;
    const refresh = async () => {
      const n = await countUnreadNotifications();
      if (!cancelled) setUnread(n);
    };
    refresh();
    const t = setInterval(refresh, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [isAuthed, user?.id, pathname]);

  const activeId =
    pathname === '/' ? 'explore' :
    pathname.startsWith('/cerca') || pathname.startsWith('/auto') ? 'map' :
    pathname.startsWith('/aiuto') ? 'help' :
    null;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || t('nav.profile');

  const goAndClose = (to) => { setMenuOpen(false); navigate(to); };
  const doSignOut = async () => { setMenuOpen(false); await signOut(); };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 40px',
      borderBottom: `1px solid ${T.line}`,
      background: T.bg,
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <Link to="/" style={{ display: 'inline-flex' }} aria-label="Home MoviQ">
        <Logo T={T} size={22} />
      </Link>
      <nav style={{ display: 'flex', gap: 28 }} aria-label="Menu principale">
        {items.map(item => (
          <Link key={item.id} to={item.to} style={{
            fontFamily: T.fontBody, fontSize: 14,
            fontWeight: item.id === activeId ? 600 : 500,
            color: item.id === activeId ? T.ink1 : T.ink2,
            textDecoration: 'none',
          }}>{t(item.key)}</Link>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        {isAuthed ? (
          <>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Menu profilo"
              style={{
                position: 'relative',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.pill,
                padding: '4px 12px 4px 4px', cursor: 'pointer',
              }}
            >
              <Avatar T={T} name={displayName} size={28} />
              <Txt T={T} size={13} weight={500}>{displayName}</Txt>
              <Icon name="chevronDown" size={14} color={T.ink2} T={T} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 2, left: 24, minWidth: 16, height: 16,
                  borderRadius: 8, background: T.coral, color: '#fff',
                  fontFamily: T.fontBody, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: `2px solid ${T.bg}`,
                }}>{unread > 9 ? '9+' : unread}</span>
              )}
            </button>
            {menuOpen && (
              <ProfileMenu T={T} displayName={displayName} isHost={isHost} onClose={() => setMenuOpen(false)} onNavigate={goAndClose} onSignOut={doSignOut} />
            )}
          </>
        ) : (
          <>
            <button onClick={openAuthModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Txt T={T} size={14} weight={500}>{t('auth.sign_in')}</Txt>
            </button>
            <Button T={T} variant="primary" size="sm" onClick={openAuthModal}>{t('auth.sign_up')}</Button>
          </>
        )}
      </div>
    </header>
  );
}
