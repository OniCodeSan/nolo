import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './icons.jsx';
import { Avatar, Logo, Txt } from './ui.jsx';
import { countHostPending } from '../services/bookings.js';
import { useAuth } from '../state/AuthContext.jsx';

export const ITEMS = [
  { id: 'dashboard',    l: 'Dashboard',         to: '/noleggia',                i: 'home' },
  { id: 'veicoli',      l: 'I miei veicoli',    to: '/noleggia/veicoli',        i: 'car' },
  { id: 'prenotazioni', l: 'Prenotazioni',      to: '/noleggia/prenotazioni',   i: 'calendar' },
  { id: 'richieste',    l: 'Richieste',         to: '/noleggia/richieste',      i: 'chat' },
  { id: 'pagamenti',    l: 'Pagamenti',         to: '/noleggia/pagamenti',      i: 'euro' },
  { id: 'statistiche',  l: 'Statistiche',       to: '/noleggia/statistiche',    i: 'eye' },
  { id: 'profilo',      l: 'Profilo aziendale', to: '/noleggia/profilo',        i: 'user' },
  { id: 'verifica',     l: 'Verifica account',  to: '/noleggia/verifica',       i: 'check' },
  { id: 'abbonamento',  l: 'Abbonamento',       to: '/noleggia/abbonamento',    i: 'creditCard' },
];

export function HostSidebar({ T, host }) {
  const { pathname } = useLocation();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!host?.id) return;
    let cancelled = false;
    countHostPending(host.id).then(n => { if (!cancelled) setPending(n); });
    const t = setInterval(() => {
      countHostPending(host.id).then(n => { if (!cancelled) setPending(n); });
    }, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [host?.id, pathname]);

  return (
    <aside style={{
      background: T.ink1, padding: '24px 18px', height: '100%',
      display: 'flex', flexDirection: 'column', color: '#fff', minWidth: 240,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Logo T={{ ...T, ink1: '#fff', ink2: 'rgba(255,255,255,0.7)' }} size={20} />
      </div>
      <Txt T={T} size={11} weight={600} color="rgba(255,255,255,0.55)" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
        Per noleggiatori
      </Txt>

      {host && (
        <div style={{
          padding: 12, background: 'rgba(255,255,255,0.06)',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
        }}>
          <Avatar T={T} name={host.n} size={36} tone="accent" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Txt T={T} size={13} weight={600} color="#fff" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.n}</Txt>
            <Txt T={T} size={11} color="rgba(255,255,255,0.6)">{host.city}</Txt>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {ITEMS.map(it => {
          const active = pathname === it.to || (it.to !== '/noleggia' && pathname.startsWith(it.to));
          const badge = it.id === 'richieste' && pending > 0 ? pending : null;
          return (
            <Link key={it.id} to={it.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              background: active ? T.accent : 'transparent',
              color: active ? T.ink1 : '#fff',
              fontFamily: T.fontBody, fontSize: 14, fontWeight: active ? 600 : 500,
              textDecoration: 'none',
            }}>
              <Icon name={it.i} size={17} color="currentColor" T={T} />
              <span style={{ flex: 1 }}>{it.l}</span>
              {badge != null && (
                <span style={{
                  background: active ? T.ink1 : T.coral, color: '#fff',
                  fontSize: 11, fontWeight: 700, fontFamily: T.fontBody,
                  padding: '1px 7px', borderRadius: 10,
                }}>{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', marginTop: 16, color: 'rgba(255,255,255,0.7)',
        fontFamily: T.fontBody, fontSize: 13, textDecoration: 'none',
        borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14,
      }}>
        <Icon name="chevronLeft" size={14} color="currentColor" T={T} />
        Torna al sito
      </Link>
    </aside>
  );
}

// Drawer di navigazione per mobile: stesse voci della sidebar, in un pannello
// a scomparsa aperto dal bottone hamburger nell'header del backoffice.
export function HostMobileMenu({ T, host, open, onClose }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!open || !host?.id) return;
    let cancelled = false;
    countHostPending(host.id).then(n => { if (!cancelled) setPending(n); });
    return () => { cancelled = true; };
  }, [open, host?.id]);

  // Chiudi con Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const itemBase = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 12px', borderRadius: 8,
    fontFamily: T.fontBody, fontSize: 15, textDecoration: 'none',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.45)', zIndex: 1600 }} />
      <div role="dialog" aria-modal="true" aria-label="Menu noleggiatore" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '84%', maxWidth: 320, zIndex: 1601,
        background: T.ink1, color: '#fff', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 40px rgba(0,0,0,0.4)', overflowY: 'auto',
        padding: '16px 14px max(18px, env(safe-area-inset-bottom))', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Logo T={{ ...T, ink1: '#fff', ink2: 'rgba(255,255,255,0.7)' }} size={20} />
          <button onClick={onClose} aria-label="Chiudi menu" style={{
            border: 'none', background: 'rgba(255,255,255,0.12)', borderRadius: '50%',
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon name="x" size={18} color="#fff" T={T} />
          </button>
        </div>

        {host && (
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Avatar T={T} name={host.n} size={36} tone="accent" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Txt T={T} size={13} weight={600} color="#fff" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.n}</Txt>
              <Txt T={T} size={11} color="rgba(255,255,255,0.6)">{host.city}</Txt>
            </div>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {ITEMS.map(it => {
            const active = pathname === it.to || (it.to !== '/noleggia' && pathname.startsWith(it.to));
            const badge = it.id === 'richieste' && pending > 0 ? pending : null;
            return (
              <Link key={it.id} to={it.to} onClick={onClose} style={{
                ...itemBase,
                background: active ? T.accent : 'transparent',
                color: active ? T.ink1 : '#fff',
                fontWeight: active ? 600 : 500,
              }}>
                <Icon name={it.i} size={18} color="currentColor" T={T} />
                <span style={{ flex: 1 }}>{it.l}</span>
                {badge != null && (
                  <span style={{
                    background: active ? T.ink1 : T.coral, color: '#fff',
                    fontSize: 11, fontWeight: 700, fontFamily: T.fontBody,
                    padding: '1px 7px', borderRadius: 10,
                  }}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link to="/" onClick={onClose} style={{ ...itemBase, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            <Icon name="chevronLeft" size={16} color="currentColor" T={T} />
            <span style={{ flex: 1 }}>Torna al sito</span>
          </Link>
          <button onClick={() => { onClose(); signOut(); }} style={{
            ...itemBase, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.8)',
            fontSize: 14, cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <Icon name="user" size={16} color="currentColor" T={T} />
            <span style={{ flex: 1 }}>Esci</span>
          </button>
        </div>
      </div>
    </>
  );
}
