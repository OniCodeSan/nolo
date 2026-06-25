import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { adminKpi, adminKpiExtended } from '../../services/moderation.js';
import { H, Txt } from '../../components/ui.jsx';

function KpiCard({ T, label, value, hint, tone = 'default', accent, to }) {
  const colorMap = {
    default: T.ink1,
    alert:   '#92400E',
    err:     '#991B1B',
    success: '#166534',
    info:    '#075985',
  };
  const bgMap = {
    default: T.surface,
    alert:   '#FEF3C7',
    err:     '#FEE2E2',
    success: '#DCFCE7',
    info:    '#E0F2FE',
  };
  const inner = (
    <div style={{
      padding: 16, background: bgMap[tone] || T.surface,
      border: `1px solid ${T.line}`, borderRadius: 12,
      boxShadow: T.sh.soft,
      height: '100%', boxSizing: 'border-box',
      cursor: to ? 'pointer' : 'default',
      transition: 'transform 120ms',
    }}>
      <Txt T={T} size={10} weight={600} color={T.ink2} style={{
        textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6,
      }}>{label}</Txt>
      <Txt T={T} size={26} weight={700} style={{ color: colorMap[tone], display: 'block', lineHeight: 1, fontFamily: T.fontDisplay }}>
        {accent}{value ?? '—'}
      </Txt>
      {hint && (
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>{hint}</Txt>
      )}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

function Section({ T, title, hint, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <H T={T} size="h4" style={{ marginBottom: 4 }}>{title}</H>
      {hint && <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginBottom: 12 }}>{hint}</Txt>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: hint ? 0 : 12 }}>
        {children}
      </div>
    </section>
  );
}

export function AdminDashboard() {
  const { T, isDesktop } = useOutletContext();
  const [kpi, setKpi] = useState(null);
  const [ext, setExt] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    adminKpi().then(setKpi).catch(e => setErr(e.message));
    adminKpiExtended().then(setExt).catch(e => console.warn('[admin-kpi-extended]', e.message));
  }, []);

  const bouncePct = ext?.mail_sent && (ext.mail_bounced + ext.mail_complained) > 0
    ? `${(((ext.mail_bounced + ext.mail_complained) / (ext.mail_sent + ext.mail_bounced + ext.mail_complained)) * 100).toFixed(1)}%`
    : '0%';

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <H T={T} size="h2">Panoramica MoviQ</H>
        <Txt T={T} size={13} color={T.ink2}>KPI in tempo reale: crescita, abbonamenti, verifica, deliverability.</Txt>
      </div>

      {err && (
        <div style={{ padding: 14, background: '#FEE2E2', borderRadius: 10, marginBottom: 18 }}>
          <Txt T={T} size={12} color="#991B1B">Errore caricamento KPI: {err}</Txt>
        </div>
      )}

      {/* ── Sezione 1: Crescita ─────────────────────────────────────── */}
      <Section T={T} title="Crescita" hint="Utenti e attività operativa">
        <KpiCard T={T} label="Utenti registrati"    value={kpi?.users_total} />
        <KpiCard T={T} label="Host totali"          value={kpi?.hosts_total} />
        <KpiCard T={T} label="Veicoli attivi"       value={kpi?.cars_active} />
        <KpiCard T={T} label="Prenotazioni 30gg"    value={ext?.bookings_30d} tone="info" />
      </Section>

      {/* ── Sezione 2: Subscription (MRR) ───────────────────────────── */}
      <Section T={T} title="Abbonamenti noleggiatori" hint="Stato fatturazione Stripe">
        <KpiCard T={T} label="MRR stimato"          value={ext?.mrr_eur} accent="€ " tone="success"
                 hint="Active + past_due × 49€" />
        <KpiCard T={T} label="In prova (trial)"     value={ext?.trialing} tone="info"
                 to="/admin/hosts?status=trialing" />
        <KpiCard T={T} label="Trial in scadenza"    value={ext?.trialing_ending_7d} tone="alert"
                 hint="≤ 7 giorni" />
        <KpiCard T={T} label="Abbonamenti attivi"   value={ext?.active} tone="success" />
        <KpiCard T={T} label="Pagamento fallito"    value={ext?.past_due} tone="err"
                 hint="grace period attivo" />
        <KpiCard T={T} label="Cancellazione prog."  value={ext?.canceling} tone="alert"
                 hint="cancel_at_period_end" />
      </Section>

      {/* ── Sezione 3: KYC verifiche ────────────────────────────────── */}
      <Section T={T} title="Verifiche KYC" hint="Solo noleggiatori con account utente collegato">
        <KpiCard T={T} label="Da revisionare"       value={ext?.kyc_submitted} tone="alert"
                 hint="aspettano admin" to="/admin/kyc" />
        <KpiCard T={T} label="Approvati"            value={ext?.kyc_approved} tone="success" />
        <KpiCard T={T} label="Rifiutati"            value={ext?.kyc_rejected} />
        <KpiCard T={T} label="In compilazione"      value={ext?.kyc_pending}
                 hint="non hanno ancora inviato" />
      </Section>

      {/* ── Sezione 4: Email deliverability ─────────────────────────── */}
      <Section T={T} title="Email" hint="Stato transazionali SMTP2GO">
        <KpiCard T={T} label="Inviate ok"           value={ext?.mail_sent} tone="success" />
        <KpiCard T={T} label="Ultime 24h"           value={ext?.mail_last_24h} tone="info" />
        <KpiCard T={T} label="Bounce"               value={ext?.mail_bounced} tone={ext?.mail_bounced > 0 ? 'err' : 'default'} />
        <KpiCard T={T} label="Reclamate spam"       value={ext?.mail_complained} tone={ext?.mail_complained > 0 ? 'err' : 'default'} />
        <KpiCard T={T} label="Failed (invio ko)"    value={ext?.mail_failed} tone={ext?.mail_failed > 0 ? 'err' : 'default'} />
        <KpiCard T={T} label="Bounce + spam rate"   value={bouncePct} tone={ext?.mail_complained > 0 || ext?.mail_bounced > 0 ? 'alert' : 'success'}
                 hint="ideale < 1%" />
      </Section>

      {/* ── Sezione 5: Booking pipeline ─────────────────────────────── */}
      <Section T={T} title="Prenotazioni" hint="Funnel richieste → conferme">
        <KpiCard T={T} label="Totali"               value={ext?.bookings_all} />
        <KpiCard T={T} label="In attesa risposta"   value={ext?.bookings_pending} tone={ext?.bookings_pending > 0 ? 'alert' : 'default'}
                 hint="host devono accettare" />
        <KpiCard T={T} label="Confermate"           value={ext?.bookings_confirmed} tone="success" />
        <KpiCard T={T} label="Segnalazioni aperte"  value={kpi?.reports_pending} tone={kpi?.reports_pending > 0 ? 'err' : 'default'}
                 to="/admin/reports" />
      </Section>

      {/* ── Sezione 6: Coupon ───────────────────────────────────────── */}
      <Section T={T} title="Coupon" hint="Codici promozionali abbonamento">
        <KpiCard T={T} label="Coupon attivi"        value={ext?.coupon_active} to="/admin/coupon" />
        <KpiCard T={T} label="Riscatti totali"      value={ext?.coupon_redemptions} tone="info" />
      </Section>
    </div>
  );
}
