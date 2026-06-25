import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminListHostLeads, adminSetLeadStatus, LEAD_STATUSES } from '../../services/leads.js';
import { H, Txt, Badge, TabPills } from '../../components/ui.jsx';

function toneOf(status) {
  return LEAD_STATUSES.find(s => s.id === status)?.tone || 'neutral';
}
function labelOf(status) {
  return LEAD_STATUSES.find(s => s.id === status)?.l || status;
}
function fmtDate(s) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return s; }
}

function LeadCard({ T, lead, onStatus }) {
  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' · ');
  return (
    <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, boxShadow: T.sh.soft }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <H T={T} size="h4">{lead.business_name}</H>
          <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>
            {fmtDate(lead.created_at)}{lead.city ? ` · ${lead.city}` : ''}{lead.province ? ` (${lead.province})` : ''}
          </Txt>
        </div>
        <Badge T={T} tone={toneOf(lead.status)}>{labelOf(lead.status)}</Badge>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 12 }}>
        <Txt T={T} size={13}><a href={`mailto:${lead.email}`} style={{ color: T.blue, textDecoration: 'underline' }}>{lead.email}</a></Txt>
        {lead.phone && <Txt T={T} size={13} color={T.ink2}>{lead.phone}</Txt>}
        {lead.contact_name && <Txt T={T} size={13} color={T.ink2}>{lead.contact_name}</Txt>}
        {lead.fleet_size != null && <Txt T={T} size={13} color={T.ink2}>{lead.fleet_size} veicoli</Txt>}
        {lead.vehicle_types && <Txt T={T} size={13} color={T.ink2}>{lead.vehicle_types}</Txt>}
      </div>

      {lead.message && (
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 10, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          “{lead.message}”
        </Txt>
      )}

      {utm && (
        <Txt T={T} size={11} mono color={T.ink3} style={{ display: 'block', marginTop: 10 }}>
          {utm}
        </Txt>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
        {LEAD_STATUSES.map(s => (
          <button key={s.id} onClick={() => onStatus(lead.id, s.id)} disabled={s.id === lead.status} style={{
            padding: '6px 12px', borderRadius: 999, cursor: s.id === lead.status ? 'default' : 'pointer',
            background: s.id === lead.status ? T.ink1 : T.surface,
            color: s.id === lead.status ? '#fff' : T.ink1,
            border: `1px solid ${s.id === lead.status ? T.ink1 : T.line}`,
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, opacity: s.id === lead.status ? 1 : 0.85,
          }}>{s.l}</button>
        ))}
      </div>
    </div>
  );
}

export function AdminLeads() {
  const { T, isDesktop } = useOutletContext();
  const [leads, setLeads] = useState(null);
  const [filter, setFilter] = useState('all');
  const [err, setErr] = useState(null);

  const refresh = () => {
    adminListHostLeads({ status: filter === 'all' ? null : filter })
      .then(setLeads)
      .catch(e => setErr(e.message));
  };

  useEffect(() => { refresh(); }, [filter]);

  const onStatus = async (id, status) => {
    try {
      const updated = await adminSetLeadStatus(id, status);
      setLeads(list => (list || []).map(l => l.id === id ? updated : l)
        // se filtrato per stato, rimuovi quelli che escono dal filtro
        .filter(l => filter === 'all' || l.status === filter));
    } catch (e) {
      setErr(e.message);
    }
  };

  const tabs = [
    { id: 'all', l: 'Tutti', count: filter === 'all' ? leads?.length : undefined },
    ...LEAD_STATUSES.map(s => ({ id: s.id, l: s.l })),
  ];

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <H T={T} size="h2">Lead noleggiatori</H>
        <Txt T={T} size={13} color={T.ink2}>Richieste di attivazione dalla landing campagne (/benvenuti).</Txt>
      </div>

      <TabPills T={T} tabs={tabs} value={filter} onChange={setFilter} style={{ marginBottom: 18 }} />

      {err && (
        <div style={{ padding: 14, background: '#FEE2E2', borderRadius: 10, marginBottom: 18 }}>
          <Txt T={T} size={12} color="#991B1B">Errore: {err}</Txt>
        </div>
      )}

      {leads == null ? (
        <Txt T={T} size={13} color={T.ink3}>Caricamento…</Txt>
      ) : leads.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
          <Txt T={T} size={13} color={T.ink3}>Nessun lead{filter !== 'all' ? ` nello stato “${labelOf(filter)}”` : ''}.</Txt>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 14 }}>
          {leads.map(l => <LeadCard key={l.id} T={T} lead={l} onStatus={onStatus} />)}
        </div>
      )}
    </div>
  );
}
