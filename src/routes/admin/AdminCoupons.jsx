import { useEffect, useState } from 'react';
import { Button, Card, H, Txt } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import {
  listCoupons, createCoupon, deactivateCoupon, syncCoupons,
} from '../../services/admin-coupons.js';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function discountLabel(c) {
  if (c.percent_off != null) return `${c.percent_off}%`;
  if (c.amount_off_cents != null) return `${(c.amount_off_cents / 100).toFixed(2)} €`;
  return '—';
}

function durationLabel(c) {
  if (c.duration === 'once') return '1ª fattura';
  if (c.duration === 'forever') return 'sempre';
  return `${c.duration_in_months} mes${c.duration_in_months === 1 ? 'e' : 'i'}`;
}

// Preset rapidi — il primo è quello che hai chiesto: 50% per 12 mesi
const PRESETS = [
  { label: '50% — 12 mesi (campagna lancio)', percent_off: 50, duration: 'repeating', duration_in_months: 12 },
  { label: '30% — 3 mesi',                     percent_off: 30, duration: 'repeating', duration_in_months: 3 },
  { label: '100% — 1 mese (primo mese gratis)', percent_off: 100, duration: 'once' },
  { label: '20% — sempre (partner pluriennale)', percent_off: 20, duration: 'forever' },
];

function CreateForm({ T, onCreated }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    discountType: 'percent',
    percent_off: 50,
    amount_off_cents: '',
    duration: 'repeating',
    duration_in_months: 12,
    max_redemptions: '',
    expires_at_iso: '',
  });

  const applyPreset = (p) => {
    setForm(f => ({
      ...f,
      discountType: p.percent_off != null ? 'percent' : 'amount',
      percent_off: p.percent_off ?? '',
      amount_off_cents: p.amount_off_cents ?? '',
      duration: p.duration,
      duration_in_months: p.duration_in_months || '',
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim() || null,
        duration: form.duration,
        duration_in_months: form.duration === 'repeating' ? Number(form.duration_in_months) : null,
        max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
        expires_at_iso: form.expires_at_iso || null,
      };
      if (form.discountType === 'percent') payload.percent_off = Number(form.percent_off);
      else payload.amount_off_cents = Math.round(Number(form.amount_off_cents) * 100);

      const created = await createCoupon(payload);
      toast.success(`Coupon ${created.code} creato`);
      setForm({
        code: '', name: '', discountType: 'percent',
        percent_off: 50, amount_off_cents: '',
        duration: 'repeating', duration_in_months: 12,
        max_redemptions: '', expires_at_iso: '',
      });
      onCreated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    padding: '8px 10px', fontFamily: T.fontBody, fontSize: 14,
    border: `1px solid ${T.line}`, borderRadius: T.r.sm || 8,
    background: T.surface, color: T.ink1,
    width: '100%', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
    color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: 4,
  };

  return (
    <Card T={T} padding={20} style={{ marginBottom: 24 }}>
      <H T={T} size="h4" style={{ marginBottom: 4 }}>Nuovo coupon</H>
      <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 14 }}>
        Lo sconto viene applicato al checkout Stripe sull'abbonamento {49} € + IVA. Il noleggiatore digita il codice e il prezzo si aggiorna.
      </Txt>

      {/* Preset rapidi */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {PRESETS.map((p, i) => (
          <button key={i} type="button" onClick={() => applyPreset(p)}
            style={{
              padding: '6px 12px', borderRadius: 999,
              background: T.surfaceAlt, color: T.ink1,
              border: `1px solid ${T.line}`,
              fontFamily: T.fontBody, fontSize: 12, cursor: 'pointer',
            }}>
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Codice</label>
          <input style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: T.fontMono || T.fontBody, letterSpacing: '0.05em' }}
            value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="WELCOME50" required maxLength={32} pattern="[A-Z0-9_-]{3,32}" />
        </div>
        <div>
          <label style={labelStyle}>Nome interno (facoltativo)</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Campagna lancio 2026" />
        </div>

        <div>
          <label style={labelStyle}>Tipo sconto</label>
          <select style={inputStyle} value={form.discountType}
            onChange={e => setForm({ ...form, discountType: e.target.value })}>
            <option value="percent">Percentuale (%)</option>
            <option value="amount">Importo fisso (€)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>
            {form.discountType === 'percent' ? 'Percentuale di sconto' : 'Importo sconto (€)'}
          </label>
          {form.discountType === 'percent' ? (
            <input type="number" min={1} max={100} style={inputStyle}
              value={form.percent_off} onChange={e => setForm({ ...form, percent_off: e.target.value })} required />
          ) : (
            <input type="number" min={0.5} step={0.5} style={inputStyle}
              value={form.amount_off_cents} onChange={e => setForm({ ...form, amount_off_cents: e.target.value })} required
              placeholder="es. 20.00" />
          )}
        </div>

        <div>
          <label style={labelStyle}>Durata</label>
          <select style={inputStyle} value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })}>
            <option value="once">Una sola fattura</option>
            <option value="repeating">Per N mesi consecutivi</option>
            <option value="forever">Per sempre</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Mesi (se "Per N mesi")</label>
          <input type="number" min={1} max={36} style={inputStyle}
            value={form.duration_in_months}
            onChange={e => setForm({ ...form, duration_in_months: e.target.value })}
            disabled={form.duration !== 'repeating'} />
        </div>

        <div>
          <label style={labelStyle}>Riscatti massimi (vuoto = illimitato)</label>
          <input type="number" min={1} style={inputStyle}
            value={form.max_redemptions}
            onChange={e => setForm({ ...form, max_redemptions: e.target.value })}
            placeholder="100" />
        </div>
        <div>
          <label style={labelStyle}>Scadenza (vuoto = nessuna)</label>
          <input type="date" style={inputStyle}
            value={form.expires_at_iso ? form.expires_at_iso.slice(0,10) : ''}
            onChange={e => setForm({ ...form, expires_at_iso: e.target.value ? `${e.target.value}T23:59:59Z` : '' })} />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <Button T={T} variant="primary" size="md" icon="plus" disabled={busy}>
            {busy ? 'Creazione…' : 'Crea coupon'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function AdminCoupons({ T }) {
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listCoupons();
      setCoupons(list);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, []);

  const onDeactivate = async (id, code) => {
    if (!confirm(`Disattivare il coupon ${code}? Gli abbonamenti già scontati non saranno toccati, ma il codice non potrà più essere riscattato da nuovi noleggiatori.`)) return;
    try {
      await deactivateCoupon(id);
      toast.success(`Coupon ${code} disattivato`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSync = async () => {
    try {
      const n = await syncCoupons();
      toast.success(`${n} coupon sincronizzati da Stripe`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 10 }}>
        <H T={T} size="h2">Coupon abbonamento</H>
        <Button T={T} variant="ghost" size="sm" icon="bolt" onClick={onSync}>
          Sincronizza riscatti
        </Button>
      </div>
      <Txt T={T} color={T.ink2} style={{ display: 'block', marginBottom: 22 }}>
        Codici promozionali applicabili dai noleggiatori al checkout Stripe.
        Sincronizzati automaticamente con Stripe Coupons e Promotion Codes.
      </Txt>

      <CreateForm T={T} onCreated={load} />

      <H T={T} size="h4" style={{ marginBottom: 10 }}>
        Coupon esistenti {coupons.length > 0 && <span style={{ color: T.ink3, fontWeight: 400 }}>· {coupons.length}</span>}
      </H>

      {loading ? (
        <Txt T={T} color={T.ink3}>Caricamento…</Txt>
      ) : coupons.length === 0 ? (
        <Card T={T} padding={28} style={{ textAlign: 'center' }}>
          <Txt T={T} color={T.ink2}>
            Nessun coupon ancora creato. Inizia con un preset rapido qui sopra.
          </Txt>
        </Card>
      ) : (
        <Card T={T} padding={0} style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.fontBody }}>
            <thead>
              <tr style={{ background: T.surfaceAlt, textAlign: 'left' }}>
                {['Codice','Sconto','Durata','Riscatti','Scadenza','Stato',''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${T.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${T.line}` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontFamily: T.fontMono || 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>{c.code}</span>
                    {c.name && <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{c.name}</Txt>}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{discountLabel(c)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>{durationLabel(c)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {c.times_redeemed}{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: T.ink2 }}>{fmtDate(c.expires_at)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: c.active ? '#DCFCE7' : T.surfaceAlt,
                      color:      c.active ? '#166534' : T.ink3,
                    }}>{c.active ? 'Attivo' : 'Disattivo'}</span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {c.active && (
                      <button onClick={() => onDeactivate(c.id, c.code)}
                        style={{
                          padding: '6px 10px', cursor: 'pointer',
                          background: 'transparent', color: T.ink2,
                          border: `1px solid ${T.line}`,
                          borderRadius: T.r.sm || 8,
                          fontFamily: T.fontBody, fontSize: 12,
                        }}>Disattiva</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
