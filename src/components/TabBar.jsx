import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './icons.jsx';

const TABS = [
  { id: 'home', icon: 'home', key: 'nav.explore', to: '/' },
  { id: 'search', icon: 'search', key: 'nav.search', to: '/cerca' },
  { id: 'fav', icon: 'heart', key: 'nav.saved', to: '/salvati' },
  { id: 'book', icon: 'calendar', key: 'nav.bookings', to: '/prenotazioni' },
  { id: 'user', icon: 'user', key: 'nav.profile', to: '/profilo' },
];

export function TabBar({ T }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const activeId =
    pathname === '/' ? 'home' :
    pathname.startsWith('/cerca') || pathname.startsWith('/auto') || pathname.startsWith('/prenota') || pathname.startsWith('/conferma') ? 'search' :
    pathname.startsWith('/salvati') ? 'fav' :
    pathname.startsWith('/prenotazioni') ? 'book' :
    pathname.startsWith('/profilo') ? 'user' : 'home';

  return (
    <nav style={{
      position: 'sticky', bottom: 0,
      background: T.bg,
      borderTop: `1px solid ${T.line}`,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 4px max(14px, env(safe-area-inset-bottom))',
      fontFamily: T.fontBody,
      zIndex: 30,
    }}>
      {TABS.map(tab => (
        <Link key={tab.id} to={tab.to} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: tab.id === activeId ? T.ink1 : T.ink3,
          textDecoration: 'none', flex: 1, padding: '2px 0',
        }}>
          <Icon name={tab.icon} size={22} color="currentColor" T={T} />
          <span style={{ fontSize: 10, fontWeight: tab.id === activeId ? 600 : 500, color: 'currentColor' }}>{t(tab.key)}</span>
        </Link>
      ))}
    </nav>
  );
}
