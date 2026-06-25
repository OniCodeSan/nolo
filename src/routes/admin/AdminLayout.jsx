import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { isAdmin } from '../../services/moderation.js';
import { Icon } from '../../components/icons.jsx';
import { H, Txt } from '../../components/ui.jsx';

const SECTIONS = [
  { id: 'dashboard', l: 'Dashboard',     path: '/admin', exact: true, icon: 'grid' },
  { id: 'users',     l: 'Utenti',        path: '/admin/utenti',       icon: 'user' },
  { id: 'sessions',  l: 'Sessioni live', path: '/admin/sessioni',     icon: 'bolt' },
  { id: 'leads',     l: 'Lead host',     path: '/admin/lead',         icon: 'bell' },
  { id: 'blog',      l: 'Magazine',      path: '/admin/blog',         icon: 'edit' },
  { id: 'ai',        l: 'AI & chiavi',   path: '/admin/ai',           icon: 'sparkle' },
  { id: 'searches',  l: 'Ricerche',      path: '/admin/ricerche',     icon: 'search' },
  { id: 'reports',   l: 'Segnalazioni',  path: '/admin/reports',      icon: 'bell' },
  { id: 'hosts',     l: 'Host',          path: '/admin/hosts',        icon: 'user' },
  { id: 'kyc',       l: 'Verifiche KYC', path: '/admin/kyc',          icon: 'check' },
  { id: 'cars',      l: 'Veicoli',       path: '/admin/veicoli',      icon: 'car' },
  { id: 'bookings',  l: 'Prenotazioni',  path: '/admin/prenotazioni', icon: 'calendar' },
  { id: 'images',    l: 'Immagini',      path: '/admin/immagini',     icon: 'grid' },
  { id: 'coupon',    l: 'Coupon',        path: '/admin/coupon',       icon: 'sparkle' },
  { id: 'audit',     l: 'Audit log',     path: '/admin/audit',        icon: 'list' },
];

export function AdminLayout({ T, isDesktop }) {
  const { user, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error('Accesso riservato agli amministratori.');
      navigate('/');
      return;
    }
    isAdmin(user.id).then(ok => {
      setAllowed(ok);
      setChecking(false);
      if (!ok) {
        toast.error('Non hai i permessi di amministratore.');
        navigate('/');
      }
    });
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Txt T={T} size={13} color={T.ink3}>Verifico permessi…</Txt>
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, background: T.bg }}>
      {isDesktop && (
        <aside style={{
          width: 240, background: T.surface, borderRight: `1px solid ${T.line}`,
          padding: '24px 14px', display: 'flex', flexDirection: 'column', gap: 4,
          flex: 'none',
        }}>
          <div style={{ padding: '0 8px 16px', borderBottom: `1px solid ${T.line}`, marginBottom: 12 }}>
            <H T={T} size="h4">Admin</H>
            <Txt T={T} size={11} color={T.ink3}>{user.email}</Txt>
          </div>
          {SECTIONS.map(s => (
            <NavLink key={s.id} to={s.path} end={s.exact} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              background: isActive ? T.accent : 'transparent',
              color: T.ink1, fontFamily: T.fontBody, fontSize: 13,
              fontWeight: isActive ? 600 : 500, textDecoration: 'none',
            })}>
              <Icon name={s.icon} size={16} color={T.ink1} T={T} />
              {s.l}
            </NavLink>
          ))}
        </aside>
      )}

      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {!isDesktop && (
          <div style={{ display: 'flex', gap: 6, padding: 12, overflowX: 'auto', borderBottom: `1px solid ${T.line}` }}>
            {SECTIONS.map(s => (
              <NavLink key={s.id} to={s.path} end={s.exact} style={({ isActive }) => ({
                padding: '8px 12px', borderRadius: 999,
                background: isActive ? T.ink1 : T.surface,
                color: isActive ? '#fff' : T.ink1,
                border: `1px solid ${isActive ? T.ink1 : T.line}`,
                fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
                whiteSpace: 'nowrap', textDecoration: 'none',
              })}>{s.l}</NavLink>
            ))}
          </div>
        )}
        <Outlet context={{ T, isDesktop }} />
      </main>
    </div>
  );
}
