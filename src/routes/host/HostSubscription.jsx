import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Button, Card, H, Txt } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import {
  getSubscriptionStatus,
  startCheckout,
  openBillingPortal,
  statusLabel,
} from '../../services/subscriptions.js';

const PRICE_EUR = 49;
const TRIAL_DAYS = 30;

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function StatusBadge({ T, tone, children }) {
  const colors = {
    info:  { bg: '#E0F2FE', fg: '#075985' },
    ok:    { bg: '#DCFCE7', fg: '#166534' },
    warn:  { bg: '#FEF3C7', fg: '#92400E' },
    err:   { bg: '#FEE2E2', fg: '#991B1B' },
    muted: { bg: T.surfaceAlt, fg: T.ink2 },
  }[tone] || { bg: T.surfaceAlt, fg: T.ink2 };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      background: colors.bg, color: colors.fg,
      fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
      letterSpacing: '0.02em',
    }}>{children}</span>
  );
}

export function HostSubscription({ T, host: hostProp }) {
  const ctx = useOutletContext() || {};
  const host = hostProp || ctx.host;
  const toast = useToast();
  const [params] = useSearchParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!host?.id) return;
    setLoading(true);
    try {
      const s = await getSubscriptionStatus(host.id);
      setSub(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [host?.id]);

  // Dopo redirect da Stripe: success / cancel
  useEffect(() => {
    const checkout = params.get('checkout');
    if (checkout === 'success') {
      toast.success('Abbonamento attivato! Aggiornamento in corso…');
      // Stripe può impiegare 1-3s a inviare il webhook → ricarichiamo dopo 2.5s
      const t = setTimeout(load, 2500);
      return () => clearTimeout(t);
    }
    if (checkout === 'cancel') {
      toast.info('Checkout annullato.');
    }
    // eslint-disable-next-line
  }, [params]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Txt T={T} color={T.ink2}>Caricamento…</Txt>
      </div>
    );
  }

  const status = sub?.status || 'none';
  const badge = statusLabel(status);
  const hasCustomer = !!sub;
  const canCheckout = !sub || ['none', 'canceled', 'incomplete_expired', 'unpaid'].includes(status);

  const onCheckout = async () => {
    setBusy(true);
    try { await startCheckout(host.id); }
    catch (e) { toast.error(e.message); setBusy(false); }
  };

  const onPortal = async () => {
    setBusy(true);
    try { await openBillingPortal(host.id); }
    catch (e) { toast.error(e.message); setBusy(false); }
  };

  return (
    <div style={{ padding: 24, maxWidth: 760, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <H T={T} size="h2">Abbonamento</H>
        <StatusBadge T={T} tone={badge.tone}>{badge.label}</StatusBadge>
      </div>
      <Txt T={T} color={T.ink2} style={{ display: 'block', marginBottom: 24 }}>
        Gestisci il tuo abbonamento MoviQ. {PRICE_EUR} € + IVA al mese, primi {TRIAL_DAYS} giorni gratuiti.
      </Txt>

      {/* ── Carta stato corrente ─────────────────────────────────── */}
      <Card T={T} padding={22} style={{ marginBottom: 20 }}>
        {status === 'trialing' && (
          <>
            <H T={T} size="h4" style={{ marginBottom: 8 }}>Periodo di prova attivo</H>
            <Txt T={T} color={T.ink1} style={{ display: 'block', marginBottom: 6 }}>
              Ti restano <strong>{sub.trial_days_remaining ?? '—'} giorni</strong> di prova gratuita.
            </Txt>
            <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 4 }}>
              Primo addebito: <strong>{fmtDate(sub.trial_end)}</strong>
            </Txt>
            <Txt T={T} size={13} color={T.ink2}>
              Importo: <strong>{PRICE_EUR} € + IVA</strong> · Rinnovo automatico mensile
            </Txt>
          </>
        )}

        {status === 'active' && (
          <>
            <H T={T} size="h4" style={{ marginBottom: 8 }}>Abbonamento attivo</H>
            <Txt T={T} color={T.ink1} style={{ display: 'block', marginBottom: 4 }}>
              Prossimo rinnovo: <strong>{fmtDate(sub.current_period_end)}</strong>
            </Txt>
            <Txt T={T} size={13} color={T.ink2}>
              Ultimo pagamento: {fmtDate(sub.last_invoice_paid_at)} · {PRICE_EUR} € + IVA
            </Txt>
            {sub.cancel_at_period_end && (
              <Txt T={T} size={13} color={'#92400E'} style={{ display: 'block', marginTop: 10 }}>
                ⚠ Disattivazione programmata: l'abbonamento si chiuderà il {fmtDate(sub.current_period_end)}.
              </Txt>
            )}
          </>
        )}

        {status === 'past_due' && (
          <>
            <H T={T} size="h4" style={{ marginBottom: 8 }}>Pagamento non riuscito</H>
            <Txt T={T} color={T.ink1} style={{ display: 'block', marginBottom: 6 }}>
              L'ultimo addebito è fallito. {sub.last_payment_error}
            </Txt>
            <Txt T={T} size={13} color={T.ink2}>
              Aggiorna il metodo di pagamento dal portale per evitare la sospensione.
            </Txt>
          </>
        )}

        {status === 'unpaid' && (
          <>
            <H T={T} size="h4" style={{ marginBottom: 8 }}>Account sospeso</H>
            <Txt T={T} color={T.ink1}>
              Più tentativi di addebito sono falliti. Riattiva l'abbonamento aggiornando la carta dal portale.
            </Txt>
          </>
        )}

        {status === 'canceled' && (
          <>
            <H T={T} size="h4" style={{ marginBottom: 8 }}>Abbonamento disattivato</H>
            <Txt T={T} color={T.ink1}>
              Puoi riattivarlo in qualsiasi momento. I tuoi dati e veicoli restano salvati.
            </Txt>
          </>
        )}

        {(status === 'none' || !sub) && (
          <>
            <H T={T} size="h4" style={{ marginBottom: 8 }}>Inizia la prova gratuita di {TRIAL_DAYS} giorni</H>
            <Txt T={T} color={T.ink1} style={{ display: 'block', marginBottom: 8 }}>
              Pubblica la tua flotta, ricevi prenotazioni, gestisci tutto dal backoffice.
              Nessun addebito per i primi {TRIAL_DAYS} giorni — puoi disattivare quando vuoi.
            </Txt>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: 20, color: T.ink2, fontFamily: T.fontBody, fontSize: 14, lineHeight: 1.7 }}>
              <li>{PRICE_EUR} € + IVA al mese dopo il periodo di prova</li>
              <li>Rinnovo automatico mensile, cancel anytime</li>
              <li>Nessuna commissione sui noleggi, nessuna fee per richiesta</li>
            </ul>
          </>
        )}
      </Card>

      {/* ── Azioni ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {canCheckout && (
          <Button T={T} variant="primary" size="md" icon="creditCard"
            onClick={onCheckout} disabled={busy}>
            {sub?.stripe_customer_id ? 'Riattiva abbonamento' : `Attiva ora — ${TRIAL_DAYS} giorni gratuiti`}
          </Button>
        )}
        {hasCustomer && (
          <Button T={T} variant={canCheckout ? 'secondary' : 'primary'} size="md" icon="settings"
            onClick={onPortal} disabled={busy}>
            Gestisci pagamento e fatture
          </Button>
        )}
      </div>

      {/* ── Dettagli legali ──────────────────────────────────────── */}
      <div style={{ marginTop: 32, padding: '16px 18px', background: T.surfaceAlt, borderRadius: T.r.md }}>
        <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', lineHeight: 1.55 }}>
          Pagamenti gestiti in sicurezza da Stripe. MoviQ non memorizza i dati della tua carta.
          Le fatture mensili sono scaricabili dal portale.
          La disattivazione è immediata: il tuo account resta operativo fino alla fine del ciclo pagato.
        </Txt>
      </div>
    </div>
  );
}
