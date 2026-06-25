import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminListCars, adminRejectCar } from '../../services/moderation.js';
import { reassignCar, listHostsBrief } from '../../services/admin.js';
import { useToast } from '../../state/ToastContext.jsx';
import { Button, H, Txt, Badge, TabPills } from '../../components/ui.jsx';

const TABS = [
  { id: 'active',   l: 'Attivi' },
  { id: 'draft',    l: 'Bozze' },
  { id: 'rejected', l: 'Rifiutati' },
  { id: 'all',      l: 'Tutti' },
];

const STATUS_TONE = {
  active: 'success', draft: 'neutral', rejected: 'alert',
};

export function AdminCars() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [tab, setTab] = useState('active');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(null);
  const [hosts, setHosts] = useState([]);

  const load = () => {
    setRows(null);
    adminListCars(tab === 'all' ? {} : { status: tab })
      .then(setRows)
      .catch(e => { toast.error(e.message); setRows([]); });
  };
  useEffect(() => { load(); }, [tab]);
  useEffect(() => { listHostsBrief().then(setHosts).catch(() => {}); }, []);

  const moveCar = async (c, newHostId) => {
    if (!newHostId || newHostId === c.host_id) return;
    setBusy(c.id);
    try {
      await reassignCar(c.id, newHostId);
      toast.success(`Auto spostata sotto "${hosts.find(h => h.id === newHostId)?.name || newHostId}"`);
      await load();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const reject = async (c) => {
    const reason = window.prompt('Motivo rifiuto (visibile all\'host):');
    if (!reason) return;
    setBusy(c.id);
    try {
      await adminRejectCar(c.id, reason);
      toast.success('Veicolo rifiutato');
      await load();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 16 }}>Veicoli</H>

      <TabPills T={T} tabs={TABS} value={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 40 }}>Nessun veicolo.</Txt>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(c => (
            <div key={c.id} style={{
              padding: 14, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Txt T={T} size={14} weight={600}>{c.brand} {c.model}{c.year ? ` · ${c.year}` : ''}</Txt>
                  <Badge T={T} tone={STATUS_TONE[c.status] || 'neutral'}>{c.status}</Badge>
                </div>
                <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
                  Host: {c.hosts?.name || c.host_id} · {c.city || '—'} · {c.price_per_day}€/giorno
                  {' · '}<code style={{ fontFamily: T.fontMono, fontSize: 11 }}>{c.id}</code>
                </Txt>
                {c.moderation_notes && (
                  <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4, fontStyle: 'italic' }}>
                    {c.moderation_notes}
                  </Txt>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={c.host_id || ''}
                  disabled={busy === c.id}
                  onChange={(e) => moveCar(c, e.target.value)}
                  title="Sposta sotto un altro host"
                  style={{ padding: '6px 8px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.sm, fontFamily: T.fontBody, fontSize: 12, maxWidth: 200 }}
                >
                  {hosts.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.cars_count})</option>
                  ))}
                </select>
                <a href={`/auto/${c.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <Button T={T} variant="outline" size="sm">Apri</Button>
                </a>
                {c.status !== 'rejected' && (
                  <Button T={T} variant="ghost" size="sm" disabled={busy === c.id} onClick={() => reject(c)}>Rifiuta</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
