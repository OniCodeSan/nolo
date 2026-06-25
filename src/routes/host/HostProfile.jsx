import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '../../components/icons.jsx';
import { Button, H, Txt, Badge } from '../../components/ui.jsx';
import { updateHost } from '../../services/cars.js';
import { useToast } from '../../state/ToastContext.jsx';

const CARD_CIRCUITS = [
  { id: 'visa',       l: 'Visa' },
  { id: 'mastercard', l: 'Mastercard' },
  { id: 'amex',       l: 'American Express' },
  { id: 'maestro',    l: 'Maestro' },
  { id: 'jcb',        l: 'JCB' },
  { id: 'diners',     l: 'Diners' },
];

const CASH_LIMIT_EUR = 5000; // limite di legge

function Section({ T, title, hint, children }) {
  return (
    <section style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 22, boxShadow: T.sh.soft }}>
      <H T={T} size="h4">{title}</H>
      {hint && <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 4, lineHeight: 1.55 }}>{hint}</Txt>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Field({ T, label, hint, children, required }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: T.coral }}> *</span>}
      </Txt>
      {children}
      {hint && <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>{hint}</Txt>}
    </label>
  );
}

function input(T) {
  return {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8,
    fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
  };
}

function Check({ T, checked, onChange, children, hint }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12,
      background: checked ? T.accentSoft : T.surfaceAlt,
      border: `1px solid ${checked ? T.accent : T.line}`,
      borderRadius: 10, cursor: 'pointer',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2, accentColor: T.ink1 }}
      />
      <div style={{ flex: 1 }}>
        <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{children}</Txt>
        {hint && <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{hint}</Txt>}
      </div>
    </label>
  );
}

export function HostProfile({ T }) {
  const { host, setHost, isDesktop } = useOutletContext();
  const toast = useToast();

  const [form, setForm] = useState({
    name: host.n || '',
    city: host.city || '',
    description: host.description || '',
    businessEmail: host.businessEmail || '',
    businessPhone: host.businessPhone || '',
    vatNumber: host.vatNumber || '',
    terms: host.terms || '',
    paymentCards: new Set(host.paymentCards || []),
    paymentDebit: !!host.paymentDebit,
    paymentCash: !!host.paymentCash,
    paymentBankTransfer: !!host.paymentBankTransfer,
    bankIban: host.bankIban || '',
    bankBic: host.bankBic || '',
    bankHolder: host.bankHolder || '',
  });
  const [busy, setBusy] = useState(false);

  const set = (patch) => setForm(prev => ({ ...prev, ...patch }));
  const toggleCard = (id) => {
    setForm(prev => {
      const next = new Set(prev.paymentCards);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...prev, paymentCards: next };
    });
  };

  const ibanValid = !form.paymentBankTransfer || /^[A-Z]{2}[0-9]{2}[A-Z0-9 ]{10,30}$/.test(form.bankIban.replace(/\s+/g, '').toUpperCase());

  const save = async () => {
    if (form.paymentBankTransfer && !ibanValid) {
      toast.error('IBAN non valido. Controllalo prima di salvare.');
      return;
    }
    setBusy(true);
    try {
      const updated = await updateHost(host.id, {
        name: form.name,
        city: form.city,
        description: form.description,
        businessEmail: form.businessEmail || null,
        businessPhone: form.businessPhone || null,
        vatNumber: form.vatNumber || null,
        terms: form.terms,
        paymentCards: [...form.paymentCards],
        paymentDebit: form.paymentDebit,
        paymentCash: form.paymentCash,
        paymentBankTransfer: form.paymentBankTransfer,
        bankIban: form.paymentBankTransfer ? form.bankIban.replace(/\s+/g, '').toUpperCase() : null,
        bankBic: form.paymentBankTransfer ? (form.bankBic || null) : null,
        bankHolder: form.paymentBankTransfer ? (form.bankHolder || null) : null,
      });
      if (updated) setHost(updated);
      toast.success('Profilo aggiornato');
    } catch (err) {
      toast.error(err.message || 'Errore nel salvataggio');
    } finally {
      setBusy(false);
    }
  };

  const paymentsActive =
    form.paymentCards.size +
    (form.paymentDebit ? 1 : 0) +
    (form.paymentCash ? 1 : 0) +
    (form.paymentBankTransfer ? 1 : 0);

  return (
    <div style={{ padding: isDesktop ? '32px 36px 60px' : '20px 18px 32px', maxWidth: 980, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 18 }}>
        <div>
          <H T={T} size="h2">Profilo aziendale</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            Dati pubblici e modalità di pagamento accettate per i tuoi noleggi.
          </Txt>
        </div>
        <Button T={T} variant="accent" size="md" iconRight="check" onClick={save} disabled={busy}>
          {busy ? 'Salvo…' : 'Salva modifiche'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Section T={T} title="Anagrafica" hint="Visibile sulla scheda di ogni tua auto.">
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 14 }}>
            <Field T={T} label="Nome attività" required>
              <input value={form.name} onChange={(e) => set({ name: e.target.value })} style={input(T)} />
            </Field>
            <Field T={T} label="Città">
              <input value={form.city} onChange={(e) => set({ city: e.target.value })} style={input(T)} />
            </Field>
            <Field T={T} label="P.IVA / CF" hint="Opzionale, mostrato in fattura.">
              <input value={form.vatNumber} onChange={(e) => set({ vatNumber: e.target.value })} style={input(T)} />
            </Field>
            <Field T={T} label="Email contatto">
              <input type="email" value={form.businessEmail} onChange={(e) => set({ businessEmail: e.target.value })} style={input(T)} placeholder="hello@…"/>
            </Field>
            <Field T={T} label="Telefono">
              <input value={form.businessPhone} onChange={(e) => set({ businessPhone: e.target.value })} style={input(T)} placeholder="+39 …" />
            </Field>
          </div>
          <Field T={T} label="Descrizione" hint="Una breve presentazione, max 300 caratteri.">
            <textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value.slice(0, 300) })}
              rows={3}
              style={{ ...input(T), resize: 'vertical', minHeight: 80, fontFamily: T.fontBody }}
              placeholder="Es. Noleggio dal 2018 a Milano, flotta urbana e familiare…"
            />
          </Field>
        </Section>

        <Section
          T={T}
          title="Termini e condizioni del noleggio"
          hint="Mostrati all'utente nella scheda auto e in conferma prenotazione. Indica regole su carburante, chilometri, fumatori, animali, fascia oraria di ritiro, ecc."
        >
          <textarea
            value={form.terms}
            onChange={(e) => set({ terms: e.target.value })}
            rows={isDesktop ? 9 : 7}
            placeholder={'Es:\n• Ritiro/riconsegna a pieno (a pieno).\n• Massimo 200 km/giorno, oltre 0,15€/km.\n• Vietato fumare e portare animali senza preavviso.\n• In caso di multe o pedaggi non pagati, addebito immediato.'}
            style={{ ...input(T), resize: 'vertical', minHeight: 180, fontFamily: T.fontBody, lineHeight: 1.55 }}
          />
        </Section>

        <Section
          T={T}
          title="Modalità di pagamento accettate"
          hint="Sono mostrate al cliente prima della prenotazione. Seleziona almeno una."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Carte di credito accettate</Txt>
              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 8 }}>
                {CARD_CIRCUITS.map(c => (
                  <Check key={c.id} T={T} checked={form.paymentCards.has(c.id)} onChange={() => toggleCard(c.id)}>{c.l}</Check>
                ))}
              </div>
            </div>

            <Check T={T} checked={form.paymentDebit} onChange={(v) => set({ paymentDebit: v })}
              hint="Es. Bancomat / V Pay">
              Carte di debito
            </Check>

            <Check
              T={T} checked={form.paymentCash}
              onChange={(v) => set({ paymentCash: v })}
              hint={`Per legge italiana, contanti consentiti fino a ${CASH_LIMIT_EUR}€. Il limite è applicato automaticamente.`}
            >
              Contanti (fino a {CASH_LIMIT_EUR}€)
            </Check>

            <Check T={T} checked={form.paymentBankTransfer} onChange={(v) => set({ paymentBankTransfer: v })}
              hint="Se selezionato, inserisci le coordinate bancarie qui sotto.">
              Bonifico bancario
            </Check>

            {form.paymentBankTransfer && (
              <div style={{ padding: 14, background: T.surfaceAlt, borderRadius: 12, marginTop: 4 }}>
                <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Coordinate bancarie</Txt>
                <Field T={T} label="IBAN" required>
                  <input
                    value={form.bankIban}
                    onChange={(e) => set({ bankIban: e.target.value.toUpperCase() })}
                    placeholder="IT60 X054 2811 1010 0000 0123 456"
                    style={{
                      ...input(T),
                      borderColor: form.bankIban && !ibanValid ? T.coral : T.line,
                      fontFamily: T.fontMono, letterSpacing: '0.05em',
                    }}
                  />
                  {form.bankIban && !ibanValid && (
                    <Txt T={T} size={11} color={T.coral} style={{ display: 'block', marginTop: 4 }}>Formato IBAN non valido.</Txt>
                  )}
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 14 }}>
                  <Field T={T} label="Intestatario">
                    <input value={form.bankHolder} onChange={(e) => set({ bankHolder: e.target.value })} style={input(T)} placeholder="Mario Rossi" />
                  </Field>
                  <Field T={T} label="BIC / SWIFT" hint="Opzionale per bonifici interni SEPA.">
                    <input value={form.bankBic} onChange={(e) => set({ bankBic: e.target.value })} style={input(T)} placeholder="BPMOIT22XXX" />
                  </Field>
                </div>
              </div>
            )}

            {paymentsActive === 0 && (
              <div style={{ padding: 12, background: T.coralSoft, border: `1px solid ${T.coral}`, borderRadius: 10 }}>
                <Txt T={T} size={12} color={T.alert}>Seleziona almeno una modalità di pagamento.</Txt>
              </div>
            )}
            {paymentsActive > 0 && (
              <Badge T={T} tone="success" icon="check">{paymentsActive} modalità attive</Badge>
            )}
          </div>
        </Section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button T={T} variant="accent" size="lg" iconRight="check" onClick={save} disabled={busy}>
            {busy ? 'Salvo…' : 'Salva modifiche'}
          </Button>
        </div>
      </div>
    </div>
  );
}
