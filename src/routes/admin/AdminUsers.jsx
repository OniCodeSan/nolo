import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listAllUsers } from '../../services/admin.js';
import { H, Txt, Badge } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';

const ROLE_TONES = { admin: 'dark', host: 'accent', customer: 'neutral' };

function fmt(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AdminUsers() {
  const { T, isDesktop } = useOutletContext();
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    listAllUsers().then(setUsers).catch(e => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const needle = q.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (needle && !(u.email?.toLowerCase().includes(needle) || u.full_name?.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [users, q, roleFilter]);

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <H T={T} size="h2">Utenti registrati</H>
        <Txt T={T} size={13} color={T.ink2}>{users ? `${users.length} utenti totali · ${filtered.length} visualizzati` : 'Caricamento…'}</Txt>
      </div>

      {err && (
        <div style={{ padding: 14, background: '#FEE2E2', borderRadius: 10, marginBottom: 18 }}>
          <Txt T={T} size={12} color="#991B1B">Errore: {err}</Txt>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 220, display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: T.r.md,
        }}>
          <Icon name="search" size={14} color={T.ink2} T={T} />
          <input type="text" placeholder="Cerca per email o nome…" value={q} onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: T.fontBody, fontSize: 13 }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px 12px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, fontFamily: T.fontBody, fontSize: 13 }}>
          <option value="all">Tutti i ruoli</option>
          <option value="customer">Clienti</option>
          <option value="host">Noleggiatori</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead style={{ background: T.surfaceAlt, position: 'sticky', top: 0 }}>
            <tr>
              <Th T={T}>Email</Th>
              <Th T={T}>Nome</Th>
              <Th T={T}>Ruolo</Th>
              <Th T={T} align="right">Prenotazioni</Th>
              <Th T={T} align="right">Salvati</Th>
              <Th T={T}>Iscritto</Th>
              <Th T={T}>Ultimo accesso</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderTop: `1px solid ${T.line}` }}>
                <Td T={T}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Txt T={T} size={13} weight={600}>{u.email || '—'}</Txt>
                    {u.is_admin && <Txt T={T} size={10} color={T.coral} style={{ marginTop: 2, fontWeight: 700, textTransform: 'uppercase' }}>SUPER ADMIN</Txt>}
                  </div>
                </Td>
                <Td T={T}>{u.full_name || '—'}{u.host_id ? <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>Host id: {u.host_id}</Txt> : null}</Td>
                <Td T={T}><Badge T={T} tone={ROLE_TONES[u.role] || 'neutral'}>{u.role}</Badge></Td>
                <Td T={T} align="right"><Txt T={T} size={13} weight={600}>{u.bookings_count}</Txt></Td>
                <Td T={T} align="right"><Txt T={T} size={13}>{u.saved_count}</Txt></Td>
                <Td T={T}><Txt T={T} size={12} color={T.ink2}>{fmt(u.created_at)}</Txt></Td>
                <Td T={T}><Txt T={T} size={12} color={T.ink2}>{fmt(u.last_sign_in_at)}</Txt></Td>
              </tr>
            ))}
            {users && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                <Txt T={T} size={13} color={T.ink3}>Nessun utente con questi filtri.</Txt>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ T, children, align = 'left' }) {
  return <th style={{
    textAlign: align, padding: '10px 14px',
    fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink2,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }}>{children}</th>;
}

function Td({ T, children, align = 'left' }) {
  return <td style={{ padding: '10px 14px', textAlign: align, verticalAlign: 'top' }}>{children}</td>;
}
