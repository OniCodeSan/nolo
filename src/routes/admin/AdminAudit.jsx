import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase, hasSupabase } from '../../lib/supabase.js';
import { useToast } from '../../state/ToastContext.jsx';
import { H, Txt, Badge } from '../../components/ui.jsx';

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'medium' });
}

export function AdminAudit() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!hasSupabase) { setRows([]); return; }
    supabase.rpc('admin_audit_log', { p_limit: 200, p_offset: 0 })
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); setRows([]); return; }
        setRows(data || []);
      });
  }, []);

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 6 }}>Audit log</H>
      <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 18 }}>
        Cronologia di tutte le azioni amministrative (ultime 200).
      </Txt>

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 40 }}>Nessuna voce di audit.</Txt>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(r => (
            <div key={r.id} style={{
              padding: 12, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: 10, fontSize: 12, fontFamily: T.fontBody,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <Badge T={T} tone="neutral">{r.action}</Badge>
                {r.target_type && (
                  <Txt T={T} size={12} color={T.ink2}>
                    {r.target_type} <code style={{ fontFamily: T.fontMono, fontSize: 11 }}>{r.target_id}</code>
                  </Txt>
                )}
                <div style={{ flex: 1 }} />
                <Txt T={T} size={11} color={T.ink3}>{formatDate(r.created_at)}</Txt>
              </div>
              <Txt T={T} size={12} color={T.ink2} style={{ display: 'block' }}>
                {r.actor_email || r.actor_id || 'system'}
              </Txt>
              {r.payload && (
                <pre style={{
                  margin: '6px 0 0', padding: 8, background: T.surfaceAlt, borderRadius: 6,
                  fontFamily: T.fontMono, fontSize: 11, color: T.ink2, overflow: 'auto', maxHeight: 120,
                }}>{JSON.stringify(r.payload, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
