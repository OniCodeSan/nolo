import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Card, H, Txt } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import {
  uploadIdDocument, updateHostKYC, submitKYC,
  ATECO_OPTIONS, PROVINCE_IT,
} from '../../services/kyc.js';

const STEPS = [
  { id: 'company',   l: 'Dati aziendali' },
  { id: 'address',   l: 'Sede legale' },
  { id: 'insurance', l: 'Assicurazione RC' },
  { id: 'review',    l: 'Conferma e invia' },
];

function StatusBadge({ T, status }) {
  if (status === 'approved') return <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✓ Verificato</span>;
  if (status === 'submitted') return <span style={{ background: '#E0F2FE', color: '#075985', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>In revisione</span>;
  if (status === 'rejected') return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Da correggere</span>;
  return <span style={{ background: T.surfaceAlt, color: T.ink2, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Da completare</span>;
}

const inputBase = (T) => ({
  padding: '10px 12px', fontFamily: T.fontBody, fontSize: 14,
  border: `1px solid ${T.line}`, borderRadius: T.r.sm || 8,
  background: T.surface, color: T.ink1,
  width: '100%', boxSizing: 'border-box',
});

const labelBase = (T) => ({
  display: 'block', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
  color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em',
  marginBottom: 4,
});

function Field({ T, label, hint, children, required }) {
  return (
    <div>
      <label style={labelBase(T)}>{label}{required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}</label>
      {children}
      {hint && <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>{hint}</Txt>}
    </div>
  );
}

export function HostKYC({ T }) {
  const navigate = useNavigate();
  const { host, setHost } = useOutletContext() || {};
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [form, setForm] = useState({
    legal_name: host?.legal_name || '',
    vat_number: host?.vat_number || '',
    ateco_code: host?.ateco_code || '',
    fiscal_code: host?.fiscal_code || '',
    rea_number: host?.rea_number || '',
    legal_address: host?.legal_address || '',
    legal_city: host?.legal_city || '',
    legal_zip: host?.legal_zip || '',
    legal_province: host?.legal_province || '',
    representative_name: host?.representative_name || '',
    id_document_type: host?.id_document_type || 'id_card',
    id_document_number: host?.id_document_number || '',
    id_document_expires: host?.id_document_expires || '',
    id_document_path: host?.id_document_path || '',
    insurance_declared: host?.insurance_declared || false,
    insurance_company: host?.insurance_company || '',
    insurance_policy_number: host?.insurance_policy_number || '',
    insurance_expires_at: host?.insurance_expires_at || '',
  });

  useEffect(() => {
    if (host?.kyc_status === 'approved') {
      // Già approvato — non ha senso restare qui
    }
  }, [host?.kyc_status]);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const canNext = useMemo(() => {
    const id = STEPS[step]?.id;
    if (id === 'company') return form.legal_name && form.vat_number && /^[A-Z]{0,2}\d{11}$/i.test(form.vat_number.replace(/\s/g,'')) && form.ateco_code;
    if (id === 'address') return form.legal_address && form.legal_city && /^\d{5}$/.test(form.legal_zip) && form.legal_province;
    if (id === 'insurance') return form.insurance_declared && form.insurance_company && form.insurance_policy_number && form.insurance_expires_at;
    return true;
  }, [step, form]);

  const save = async (patch) => {
    if (!host?.id) return;
    const updated = await updateHostKYC(host.id, patch);
    setHost?.(updated);
  };

  const next = async () => {
    if (!canNext) { toast.error('Compila tutti i campi obbligatori'); return; }
    setBusy(true);
    try {
      // Salva i campi del passo corrente
      const id = STEPS[step]?.id;
      if (id === 'company') {
        await save({
          legal_name: form.legal_name.trim(),
          vat_number: form.vat_number.replace(/\s/g,'').toUpperCase(),
          ateco_code: form.ateco_code,
          fiscal_code: form.fiscal_code.trim() || null,
          rea_number: form.rea_number.trim() || null,
        });
      } else if (id === 'address') {
        await save({
          legal_address: form.legal_address.trim(),
          legal_city: form.legal_city.trim(),
          legal_zip: form.legal_zip,
          legal_province: form.legal_province,
        });
      } else if (id === 'insurance') {
        await save({
          insurance_declared: form.insurance_declared,
          insurance_company: form.insurance_company.trim(),
          insurance_policy_number: form.insurance_policy_number.trim(),
          insurance_expires_at: form.insurance_expires_at,
        });
      }
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async () => {
    setBusy(true);
    try {
      const updated = await submitKYC(host.id);
      setHost?.(updated);
      toast.success('Verifica inviata. Ti contattiamo entro 48h.');
      navigate('/noleggia');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!host) {
    return <div style={{ padding: 24 }}><Txt T={T} color={T.ink2}>Caricamento…</Txt></div>;
  }

  if (host.kyc_status === 'submitted') {
    return (
      <div style={{ padding: 24, maxWidth: 720 }}>
        <H T={T} size="h2">Verifica in corso</H>
        <Txt T={T} color={T.ink2} style={{ display: 'block', marginTop: 8 }}>
          Abbiamo ricevuto i tuoi dati il <strong>{new Date(host.kyc_submitted_at).toLocaleDateString('it-IT')}</strong>.
          Ti risponderemo entro 48 ore lavorative all'indirizzo associato all'account.
        </Txt>
        <Card T={T} padding={18} style={{ marginTop: 18 }}>
          <Txt T={T} size={13} color={T.ink2}>
            Nel frattempo puoi caricare auto in bozza, impostare condizioni e profilo. La pubblicazione sarà attiva quando completiamo la verifica e tu attivi l'abbonamento.
          </Txt>
        </Card>
      </div>
    );
  }

  if (host.kyc_status === 'approved') {
    return (
      <div style={{ padding: 24, maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <H T={T} size="h2">Account verificato</H>
          <StatusBadge T={T} status="approved" />
        </div>
        <Txt T={T} color={T.ink2} style={{ display: 'block' }}>
          Il tuo profilo è verificato. Puoi pubblicare la flotta e ricevere prenotazioni.
        </Txt>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <H T={T} size="h2">Verifica noleggiatore</H>
        <StatusBadge T={T} status={host.kyc_status || 'pending'} />
      </div>
      <Txt T={T} color={T.ink2} style={{ display: 'block', marginBottom: 6 }}>
        Per pubblicare veicoli su MoviQ ci servono dati aziendali, documento del legale rappresentante e dichiarazione della polizza RC.
        Tempo richiesto: ~5 minuti. La revisione admin avviene entro 48h.
      </Txt>

      {host.kyc_status === 'rejected' && host.kyc_rejection_reason && (
        <Card T={T} padding={14} style={{ marginTop: 12, marginBottom: 6, background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
          <Txt T={T} size={13} color="#991B1B" weight={600}>Verifica precedente rifiutata</Txt>
          <Txt T={T} size={13} color="#991B1B" style={{ display: 'block', marginTop: 4 }}>{host.kyc_rejection_reason}</Txt>
        </Card>
      )}

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, margin: '20px 0 24px' }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? T.ink1 : T.surfaceAlt,
            transition: 'background 200ms',
          }} title={s.l} />
        ))}
      </div>

      <Card T={T} padding={20}>
        <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
          Passo {step + 1} di {STEPS.length}
        </Txt>
        <H T={T} size="h4" style={{ marginBottom: 16 }}>{STEPS[step].l}</H>

        {/* ── Dati aziendali ─────────────────────────────────────────── */}
        {STEPS[step].id === 'company' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field T={T} label="Ragione sociale" required hint="Es. Autonoleggio Rossi S.r.l.">
                <input style={inputBase(T)} value={form.legal_name}
                  onChange={e => set({ legal_name: e.target.value })} maxLength={120} />
              </Field>
            </div>
            <Field T={T} label="Partita IVA" required hint="11 cifre, opzionalmente preceduta da IT">
              <input style={inputBase(T)} value={form.vat_number}
                onChange={e => set({ vat_number: e.target.value })}
                placeholder="IT01234567890" maxLength={13} />
            </Field>
            <Field T={T} label="Codice ATECO" required>
              <select style={inputBase(T)} value={form.ateco_code}
                onChange={e => set({ ateco_code: e.target.value })}>
                <option value="">Seleziona…</option>
                {ATECO_OPTIONS.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
              </select>
            </Field>
            <Field T={T} label="Codice fiscale (se diverso dalla P.IVA)">
              <input style={inputBase(T)} value={form.fiscal_code}
                onChange={e => set({ fiscal_code: e.target.value.toUpperCase() })} maxLength={16} />
            </Field>
            <Field T={T} label="Numero REA (opzionale)" hint="Camera di Commercio">
              <input style={inputBase(T)} value={form.rea_number}
                onChange={e => set({ rea_number: e.target.value })} maxLength={20} />
            </Field>
          </div>
        )}

        {/* ── Sede legale ────────────────────────────────────────────── */}
        {STEPS[step].id === 'address' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field T={T} label="Indirizzo" required hint="Via/Piazza, numero civico">
                <input style={inputBase(T)} value={form.legal_address}
                  onChange={e => set({ legal_address: e.target.value })} maxLength={160} />
              </Field>
            </div>
            <Field T={T} label="Città" required>
              <input style={inputBase(T)} value={form.legal_city}
                onChange={e => set({ legal_city: e.target.value })} maxLength={80} />
            </Field>
            <Field T={T} label="CAP" required>
              <input style={inputBase(T)} value={form.legal_zip}
                onChange={e => set({ legal_zip: e.target.value.replace(/\D/g,'').slice(0,5) })}
                inputMode="numeric" placeholder="20121" />
            </Field>
            <Field T={T} label="Provincia" required>
              <select style={inputBase(T)} value={form.legal_province}
                onChange={e => set({ legal_province: e.target.value })}>
                <option value="">—</option>
                {PROVINCE_IT.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* ── Assicurazione ──────────────────────────────────────────── */}
        {STEPS[step].id === 'insurance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 8 }}>
                Dichiari, sotto la tua responsabilità, di avere copertura assicurativa RC valida su tutti i veicoli che pubblicherai su MoviQ.
                MoviQ può richiedere l'esibizione della polizza in qualsiasi momento.
              </Txt>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.insurance_declared}
                  onChange={e => set({ insurance_declared: e.target.checked })} />
                <Txt T={T} size={14} color={T.ink1}>Dichiaro di avere polizza RC valida sulla flotta</Txt>
              </label>
            </div>
            <Field T={T} label="Compagnia assicurativa" required>
              <input style={inputBase(T)} value={form.insurance_company}
                onChange={e => set({ insurance_company: e.target.value })} maxLength={100}
                placeholder="es. Generali, Unipol…" />
            </Field>
            <Field T={T} label="Numero polizza" required>
              <input style={inputBase(T)} value={form.insurance_policy_number}
                onChange={e => set({ insurance_policy_number: e.target.value })} maxLength={50} />
            </Field>
            <Field T={T} label="Scadenza polizza" required>
              <input type="date" style={inputBase(T)} value={form.insurance_expires_at}
                onChange={e => set({ insurance_expires_at: e.target.value })} />
            </Field>
          </div>
        )}

        {/* ── Conferma ───────────────────────────────────────────────── */}
        {STEPS[step].id === 'review' && (
          <div>
            <Txt T={T} color={T.ink1} style={{ display: 'block', marginBottom: 12 }}>
              Verifica che i dati siano corretti, poi premi <strong>Invia per la verifica</strong>.
              Riceverai un'email entro 48h con l'esito.
            </Txt>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 16, rowGap: 8 }}>
              <dt style={{ fontSize: 13, color: T.ink2, fontWeight: 600 }}>Ragione sociale</dt><dd style={{ margin: 0 }}>{form.legal_name}</dd>
              <dt style={{ fontSize: 13, color: T.ink2, fontWeight: 600 }}>P.IVA</dt><dd style={{ margin: 0 }}>{form.vat_number}</dd>
              <dt style={{ fontSize: 13, color: T.ink2, fontWeight: 600 }}>ATECO</dt><dd style={{ margin: 0 }}>{form.ateco_code}</dd>
              <dt style={{ fontSize: 13, color: T.ink2, fontWeight: 600 }}>Sede</dt><dd style={{ margin: 0 }}>{form.legal_address}, {form.legal_zip} {form.legal_city} ({form.legal_province})</dd>
              <dt style={{ fontSize: 13, color: T.ink2, fontWeight: 600 }}>Polizza RC</dt><dd style={{ margin: 0 }}>{form.insurance_company} · n° {form.insurance_policy_number} · scad. {form.insurance_expires_at}</dd>
            </dl>
          </div>
        )}

        {/* ── Footer navigazione ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, gap: 10 }}>
          <Button T={T} variant="ghost" size="md" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0 || busy}>
            Indietro
          </Button>
          {step < STEPS.length - 1 ? (
            <Button T={T} variant="primary" size="md" iconRight="chevron" onClick={next} disabled={busy || !canNext}>
              {busy ? 'Salvataggio…' : 'Avanti'}
            </Button>
          ) : (
            <Button T={T} variant="primary" size="md" icon="check" onClick={onSubmit} disabled={busy}>
              {busy ? 'Invio…' : 'Invia per la verifica'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
