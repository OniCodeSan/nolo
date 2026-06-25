import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminListHosts, adminSetHostStatus, adminSetHostFeatured } from '../../services/moderation.js';
import { assignHostOwner } from '../../services/admin.js';
import { useToast } from '../../state/ToastContext.jsx';
import { Button, H, Txt, Badge, TabPills } from '../../components/ui.jsx';

const TABS = [
  { id: 'pending',   l: 'In attesa' },
  { id: 'verified',  l: 'Verificati' },
  { id: 'suspended', l: 'Sospesi' },
  { id: 'rejected',  l: 'Rifiutati' },
  { id: 'all',       l: 'Tutti' },
];

const STATUS_TONE = {
  pending: 'alert', verified: 'success', suspended: 'alert', rejected: 'neutral',
};

export function AdminHosts() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setRows(null);
    adminListHosts(tab === 'all' ? {} : { status: tab })
      .then(setRows)
      .catch(e => { toast.error(e.message); setRows([]); });
  };
  useEffect(() => { load(); }, [tab]);

  const setStatus = async (h, status) => {
    const reason = status === 'suspended' || status === 'rejected'
      ? window.prompt(`Motivo ${status === 'suspended' ? 'sospensione' : 'rifiuto'}:`) || null
      : null;
    setBusy(h.id);
    try {
      await adminSetHostStatus(h.id, status, reason);
      toast.success(`Host ora "${status}"`);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally { setBusy(null); }
  };

  const toggleFeatured = async (h) => {
    setBusy(h.id);
    try {
      await adminSetHostFeatured(h.id, !h.featured);
      toast.success(h.featured ? 'Rimosso da featured' : 'In evidenza');
      await load();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const assignOwner = async (h) => {
    const email = window.prompt(`Email dell'account noleggiatore da associare a "${h.name}":`, '');
    if (!email) return;
    setBusy(h.id);
    try {
      await assignHostOwner(h.id, email);
      toast.success(`Host "${h.name}" assegnato a ${email} (account promosso a noleggiatore)`);
      await load();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 16 }}>Host</H>

      <TabPills T={T} tabs={TABS} value={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 40 }}>Nessun host.</Txt>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(h => (
            <div key={h.id} style={{
              padding: 14, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Txt T={T} size={14} weight={600}>{h.name}</Txt>
                  <Badge T={T} tone={STATUS_TONE[h.status] || 'neutral'}>{h.status}</Badge>
                  {h.featured && <Badge T={T} tone="accent" icon="sparkle">Featured</Badge>}
                </div>
                <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
                  {h.city || '—'} · {h.business_email || '—'} · {h.id}
                </Txt>
                <Txt T={T} size={11} style={{ display: 'block', marginTop: 2 }}
                  color={h.owner_user_id ? T.ok : T.coral}>
                  {h.owner_user_id ? '● Proprietario associato' : '○ Nessun proprietario'}
                </Txt>
                {h.moderation_notes && (
                  <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4, fontStyle: 'italic' }}>
                    {h.moderation_notes}
                  </Txt>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {h.status !== 'verified' && (
                  <Button T={T} variant="accent" size="sm" disabled={busy === h.id} onClick={() => setStatus(h, 'verified')}>Verifica</Button>
                )}
                {h.status !== 'suspended' && (
                  <Button T={T} variant="outline" size="sm" disabled={busy === h.id} onClick={() => setStatus(h, 'suspended')}>Sospendi</Button>
                )}
                {h.status === 'suspended' && (
                  <Button T={T} variant="outline" size="sm" disabled={busy === h.id} onClick={() => setStatus(h, 'verified')}>Riattiva</Button>
                )}
                {h.status === 'verified' && (
                  <Button T={T} variant={h.featured ? 'outline' : 'ghost'} size="sm" disabled={busy === h.id} onClick={() => toggleFeatured(h)}>
                    {h.featured ? 'Rimuovi featured' : 'Featured'}
                  </Button>
                )}
                {h.status === 'pending' && (
                  <Button T={T} variant="ghost" size="sm" disabled={busy === h.id} onClick={() => setStatus(h, 'rejected')}>Rifiuta</Button>
                )}
                <Button T={T} variant="outline" size="sm" disabled={busy === h.id} onClick={() => assignOwner(h)}>
                  {h.owner_user_id ? 'Cambia proprietario' : 'Assegna proprietario'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
