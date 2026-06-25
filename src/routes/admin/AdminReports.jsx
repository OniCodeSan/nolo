import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminListReports, adminSetReportStatus, REPORT_REASONS } from '../../services/moderation.js';
import { useToast } from '../../state/ToastContext.jsx';
import { Button, H, Txt, Badge, TabPills } from '../../components/ui.jsx';

const STATUS_TABS = [
  { id: 'pending',   l: 'In attesa',   tone: 'alert' },
  { id: 'reviewed',  l: 'Esaminati',   tone: 'default' },
  { id: 'dismissed', l: 'Archiviati',  tone: 'default' },
  { id: 'actioned',  l: 'Risolti',     tone: 'success' },
];

function reasonLabel(id) {
  return REPORT_REASONS.find(r => r.id === id)?.l || id;
}

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
}

export function AdminReports() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setRows(null);
    adminListReports({ status: tab }).then(setRows).catch(e => {
      toast.error(e.message);
      setRows([]);
    });
  };

  useEffect(() => { load(); }, [tab]);

  const act = async (id, status) => {
    setBusy(id);
    try {
      await adminSetReportStatus(id, status);
      toast.success(`Segnalazione ${status === 'actioned' ? 'risolta' : status === 'dismissed' ? 'archiviata' : 'esaminata'}`);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 16 }}>Segnalazioni</H>

      <TabPills T={T} tabs={STATUS_TABS} value={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 40 }}>
          Nessuna segnalazione in questo stato.
        </Txt>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(r => (
            <div key={r.id} style={{
              padding: 16, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: 12, boxShadow: T.sh.soft,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <div>
                  <Txt T={T} size={14} weight={600}>{reasonLabel(r.reason)}</Txt>
                  <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
                    {r.target_type} <code style={{ fontFamily: T.fontMono, fontSize: 11 }}>{r.target_id}</code>
                    · {formatDate(r.created_at)}
                  </Txt>
                </div>
                <Badge T={T} tone={r.status === 'pending' ? 'alert' : r.status === 'actioned' ? 'success' : 'neutral'}>
                  {r.status}
                </Badge>
              </div>
              {r.details && (
                <Txt T={T} size={13} color={T.ink1} style={{ display: 'block', marginTop: 8, padding: 10, background: T.surfaceAlt, borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {r.details}
                </Txt>
              )}
              {r.notes && (
                <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 8, fontStyle: 'italic' }}>
                  Note admin: {r.notes}
                </Txt>
              )}
              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button T={T} variant="outline" size="sm" disabled={busy === r.id} onClick={() => act(r.id, 'dismissed')}>
                    Archivia
                  </Button>
                  <Button T={T} variant="outline" size="sm" disabled={busy === r.id} onClick={() => act(r.id, 'reviewed')}>
                    Esaminato
                  </Button>
                  <Button T={T} variant="accent" size="sm" disabled={busy === r.id} onClick={() => act(r.id, 'actioned')}>
                    Risolto
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
