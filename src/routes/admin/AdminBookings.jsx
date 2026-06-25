import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase, hasSupabase } from '../../lib/supabase.js';
import { useToast } from '../../state/ToastContext.jsx';
import { H, Txt, Badge } from '../../components/ui.jsx';

const STATUS_TONE = {
  requested: 'alert', accepted: 'success', confirmed: 'success',
  declined: 'neutral', cancelled: 'neutral', completed: 'success',
};

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
}

export function AdminBookings() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!hasSupabase) { setRows([]); return; }
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); setRows([]); return; }
        setRows(data || []);
      });
  }, []);

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 16 }}>Prenotazioni (ultime 100)</H>

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 40 }}>Nessuna prenotazione.</Txt>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(b => (
            <div key={b.id} style={{
              padding: 12, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Txt T={T} size={13} weight={600}>{b.car_id}</Txt>
                  <Badge T={T} tone={STATUS_TONE[b.status] || 'neutral'}>{b.status}</Badge>
                </div>
                <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
                  Host: {b.host_id} · User: {b.user_id}
                  · {b.date_from} → {b.date_to}
                  · {b.total}€
                  · creata {formatDate(b.created_at)}
                </Txt>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
