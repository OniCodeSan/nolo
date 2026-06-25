import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './icons.jsx';
import { Avatar, Badge, Txt } from './ui.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { countUnreadNotifications } from '../services/notifications.js';
import { countUnreadMessages } from '../services/messages.js';

const ITEMS = [
  { id: 'panoramica',   k: 'profile.overview',      to: '/profilo',          i: 'home' },
  { id: 'prenotazioni', k: 'bookings.title',        to: '/prenotazioni',     i: 'calendar' },
  { id: 'salvati',      k: 'saved.title',           to: '/salvati',          i: 'heart' },
  { id: 'messaggi',     k: 'messages.title',        to: '/profilo/messaggi', i: 'chat' },
  { id: 'profilo',      k: 'profile.header',        to: '/profilo/dati',     i: 'user' },
  { id: 'notifiche',    k: 'notifications.title',   to: '/profilo/notifiche', i: 'bell' },
  { id: 'impostazioni', k: 'settings.title',        to: '/profilo/impostazioni', i: 'sliders' },
];

export function UserSidebar({ T, counts = {} }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || t('profile.user_fallback');
  const [unread, setUnread] = useState({ msgs: 0, notif: 0 });

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const [m, n] = await Promise.all([countUnreadMessages(), countUnreadNotifications()]);
      if (!cancelled) setUnread({ msgs: m, notif: n });
    };
    refresh();
    const t = setInterval(refresh, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [pathname, user?.id]);

  counts = { ...counts, messaggi: unread.msgs || undefined, notifiche: unread.notif || undefined };

  return (
    <aside style={{
      padding: '24px 16px', borderRight: `1px solid ${T.line}`,
      background: T.surfaceAlt, height: '100%', boxSizing: 'border-box', minWidth: 260,
    }}>
      <div style={{
        padding: 14, background: T.surface, border: `1px solid ${T.line}`,
        borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, boxShadow: T.sh.soft,
      }}>
        <Avatar T={T} name={displayName} size={42} tone="accent" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Txt T={T} size={13} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</Txt>
          <Txt T={T} size={12} color={T.ink2}>{user?.email || ''}</Txt>
        </div>
      </div>
      <nav style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 2 }} aria-label={t('nav.profile')}>
        {ITEMS.map(it => {
          const active = pathname === it.to;
          const badge = counts[it.id];
          return (
            <Link key={it.id} to={it.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: active ? T.accent : 'transparent',
              color: T.ink1, borderRadius: 10,
              fontFamily: T.fontBody, fontSize: 14, fontWeight: active ? 600 : 500,
              textDecoration: 'none',
            }}>
              <Icon name={it.i} size={17} color={T.ink1} T={T} />
              <span style={{ flex: 1 }}>{t(it.k)}</span>
              {badge != null && badge > 0 && (
                <Badge T={T} tone={active ? 'dark' : 'neutral'}>{badge}</Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
