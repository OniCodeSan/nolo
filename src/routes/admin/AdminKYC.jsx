import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Card, H, Txt, TabPills } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { adminReviewKYC, getSignedDocumentUrl } from '../../services/kyc.js';

const TABS = [
  { id: 'submitted', l: 'Da revisionare' },
  { id: 'approved',  l: 'Approvati' },
  { id: 'rejected',  l: 'Rifiutati' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const KYC_FIELDS = `
  id, name, city, kyc_status, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason,
  legal_name, vat_number, ateco_code, fiscal_code, rea_number,
  legal_address, legal_city, legal_zip, legal_province,
  representative_name, id_document_type, id_document_number, id_document_path, id_document_expires,
  insurance_company, insurance_policy_number, insurance_expires_at,
  business_email, business_phone, owner_user_id
`;

export function AdminKYC({ T: TProp }) {
  const ctx = useOutletContext() || {};
  const T = TProp || ctx.T;
  const toast = useToast();
  const [tab, setTab] = useState('submitted');
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openHost, setOpenHost] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hosts')
        .select(KYC_FIELDS)
        .eq('kyc_status', tab)
        .order('kyc_submitted_at', { ascending: false });
      if (error) throw error;
      setHosts(data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [tab]);

  const openDoc = async (host) => {
    setOpenHost(host);
    setDocUrl(null);
    if (host.id_document_path) {
      const url = await getSignedDocumentUrl(host.id_document_path, 600);
      setDocUrl(url);
    }
  };

  const approve = async (host) => {
    if (!confirm(`Approvare il KYC di ${host.legal_name || host.name}?`)) return;
    setBusy(true);
    try {
      await adminReviewKYC(host.id, 'approve');
      toast.success('Host approvato');
      setOpenHost(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const reject = async (host) => {
    const reason = prompt('Motivo del rifiuto (sarà mostrato al noleggiatore):');
    if (!reason || !reason.trim()) return;
    setBusy(true);
    try {
      await adminReviewKYC(host.id, 'reject', reason.trim());
      toast.success('Host rifiutato');
      setOpenHost(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, width: '100%', boxSizing: 'border-box' }}>
      <H T={T} size="h2" style={{ marginBottom: 6 }}>Verifica noleggiatori (KYC)</H>
      <Txt T={T} color={T.ink2} style={{ display: 'block', marginBottom: 18 }}>
        Revisione dati anagrafici, fiscali e documento del legale rappresentante.
      </Txt>

      <TabPills T={T} tabs={TABS} value={tab} onChange={setTab} style={{ marginBottom: 16 }} />

      {loading ? (
        <Txt T={T} color={T.ink3}>Caricamento…</Txt>
      ) : hosts.length === 0 ? (
        <Card T={T} padding={32} style={{ textAlign: 'center' }}>
          <Txt T={T} color={T.ink2}>Nessun host in questo stato.</Txt>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hosts.map(h => (
            <Card key={h.id} T={T} padding={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Txt T={T} size={15} weight={600} color={T.ink1}>{h.legal_name || h.name}</Txt>
                <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
                  P.IVA {h.vat_number || '—'} · ATECO {h.ateco_code || '—'} · {h.legal_city || h.city || '—'}
                </Txt>
                <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>
                  Inviato il {fmtDate(h.kyc_submitted_at)} · ID: {h.id}
                </Txt>
              </div>
              <Button T={T} variant="secondary" size="sm" icon="eye" onClick={() => openDoc(h)}>
                Dettagli
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal dettagli ─────────────────────────────────────────────────── */}
      {openHost && (
        <div onClick={() => setOpenHost(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: T.surface, borderRadius: 14, maxWidth: 720, width: '100%',
            maxHeight: '90vh', overflow: 'auto', padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <H T={T} size="h3">{openHost.legal_name || openHost.name}</H>
              <button onClick={() => setOpenHost(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.ink2 }}>
                <Icon name="x" size={20} color={T.ink2} T={T} />
              </button>
            </div>

            <H T={T} size="h5" style={{ marginBottom: 6, color: T.ink2 }}>Dati aziendali</H>
            <dl style={{ margin: '0 0 18px', display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 14, rowGap: 6, fontSize: 13 }}>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Ragione sociale</dt><dd style={{ margin: 0 }}>{openHost.legal_name}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>P.IVA</dt><dd style={{ margin: 0 }}>{openHost.vat_number}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>ATECO</dt><dd style={{ margin: 0 }}>{openHost.ateco_code}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Codice fiscale</dt><dd style={{ margin: 0 }}>{openHost.fiscal_code || '—'}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>N. REA</dt><dd style={{ margin: 0 }}>{openHost.rea_number || '—'}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Sede legale</dt><dd style={{ margin: 0 }}>{openHost.legal_address}, {openHost.legal_zip} {openHost.legal_city} ({openHost.legal_province})</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Email business</dt><dd style={{ margin: 0 }}>{openHost.business_email || '—'}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Telefono</dt><dd style={{ margin: 0 }}>{openHost.business_phone || '—'}</dd>
            </dl>

            <H T={T} size="h5" style={{ marginBottom: 6, color: T.ink2 }}>Documento legale rappresentante</H>
            <dl style={{ margin: '0 0 14px', display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 14, rowGap: 6, fontSize: 13 }}>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Nome</dt><dd style={{ margin: 0 }}>{openHost.representative_name}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Tipo</dt><dd style={{ margin: 0 }}>{openHost.id_document_type === 'id_card' ? 'Carta identità' : openHost.id_document_type === 'passport' ? 'Passaporto' : 'Patente'}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Numero</dt><dd style={{ margin: 0 }}>{openHost.id_document_number}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Scadenza</dt><dd style={{ margin: 0 }}>{openHost.id_document_expires || '—'}</dd>
            </dl>
            {docUrl ? (
              <a href={docUrl} target="_blank" rel="noopener noreferrer"
                 style={{ display: 'inline-block', padding: '8px 14px', background: T.ink1, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, marginBottom: 18 }}>
                Apri documento (link valido 10 min)
              </a>
            ) : openHost.id_document_path ? (
              <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginBottom: 18 }}>Generazione link…</Txt>
            ) : (
              <Txt T={T} size={12} color="#991B1B" style={{ display: 'block', marginBottom: 18 }}>Nessun documento caricato</Txt>
            )}

            <H T={T} size="h5" style={{ marginBottom: 6, color: T.ink2 }}>Polizza RC</H>
            <dl style={{ margin: '0 0 22px', display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 14, rowGap: 6, fontSize: 13 }}>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Compagnia</dt><dd style={{ margin: 0 }}>{openHost.insurance_company}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>N. polizza</dt><dd style={{ margin: 0 }}>{openHost.insurance_policy_number}</dd>
              <dt style={{ color: T.ink2, fontWeight: 600 }}>Scadenza</dt><dd style={{ margin: 0 }}>{openHost.insurance_expires_at}</dd>
            </dl>

            {openHost.kyc_status === 'submitted' && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
                <Button T={T} variant="outline" size="md" onClick={() => reject(openHost)} disabled={busy}>
                  Rifiuta
                </Button>
                <Button T={T} variant="primary" size="md" icon="check" onClick={() => approve(openHost)} disabled={busy}>
                  Approva
                </Button>
              </div>
            )}
            {openHost.kyc_status === 'rejected' && openHost.kyc_rejection_reason && (
              <div style={{ background: '#FEE2E2', borderRadius: 8, padding: 12, fontSize: 13, color: '#991B1B' }}>
                Motivo rifiuto: {openHost.kyc_rejection_reason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
