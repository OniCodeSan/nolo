import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Txt } from './ui.jsx';
import { Icon } from './icons.jsx';
import { getSubscriptionStatus } from '../services/subscriptions.js';

// Banner persistente in cima al backoffice noleggiatore.
// Mostra avvisi solo quando richiede azione: trial in scadenza,
// pagamento fallito, account sospeso, oppure nessuna sub attivata.
// Non mostra nulla se la sub è 'active' in regola.

const PALETTE = {
  warn:   { bg: '#FEF3C7', border: '#FCD34D', fg: '#92400E', icon: 'bell' },
  err:    { bg: '#FEE2E2', border: '#FCA5A5', fg: '#991B1B', icon: 'bell' },
  info:   { bg: '#E0F2FE', border: '#7DD3FC', fg: '#075985', icon: 'sparkle' },
  muted:  { bg: '#F4F0E8', border: '#E2D9C9', fg: '#5B5246', icon: 'creditCard' },
};

function pickBanner(sub) {
  // Nessuna sub mai creata → invito ad attivare
  if (!sub || sub.status === 'none') {
    return {
      tone: 'info',
      title: 'Attiva l\'abbonamento per pubblicare i tuoi veicoli',
      body: '30 giorni gratuiti, poi 49 € + IVA al mese. Cancel anytime.',
      cta: 'Attiva ora',
    };
  }

  // Trial: avvisa solo negli ultimi 7 giorni
  if (sub.status === 'trialing') {
    const d = sub.trial_days_remaining;
    if (d != null && d <= 7) {
      return {
        tone: d <= 2 ? 'warn' : 'info',
        title: d === 0
          ? 'Il periodo di prova termina oggi'
          : `Periodo di prova: ${d} giorn${d === 1 ? 'o' : 'i'} rimanent${d === 1 ? 'e' : 'i'}`,
        body: 'Al termine partirà il primo addebito mensile. Verifica che la carta sia valida.',
        cta: 'Vai all\'abbonamento',
      };
    }
    return null; // trial sano, niente banner
  }

  if (sub.status === 'past_due') {
    return {
      tone: 'warn',
      title: 'Pagamento non riuscito',
      body: sub.last_payment_error
        || 'L\'ultimo addebito è fallito. Aggiorna il metodo di pagamento per evitare la sospensione.',
      cta: 'Aggiorna carta',
    };
  }

  if (sub.status === 'unpaid') {
    return {
      tone: 'err',
      title: 'Account sospeso — pagamento non riuscito',
      body: 'I tuoi veicoli sono temporaneamente non visibili. Riattiva l\'abbonamento aggiornando la carta.',
      cta: 'Riattiva',
    };
  }

  if (sub.status === 'canceled') {
    return {
      tone: 'muted',
      title: 'Abbonamento disattivato',
      body: 'I tuoi veicoli non sono pubblicati. Riattiva quando vuoi — i dati restano salvati.',
      cta: 'Riattiva',
    };
  }

  if (sub.cancel_at_period_end && sub.status === 'active') {
    return {
      tone: 'muted',
      title: 'Disattivazione programmata',
      body: `L'abbonamento si chiuderà al termine del ciclo corrente. Puoi annullare la disattivazione in qualsiasi momento.`,
      cta: 'Gestisci',
    };
  }

  if (sub.status === 'incomplete' || sub.status === 'incomplete_expired') {
    return {
      tone: 'warn',
      title: 'Pagamento da completare',
      body: 'Il pagamento iniziale non è stato completato (manca la conferma 3D Secure). Riprova dal portale.',
      cta: 'Completa pagamento',
    };
  }

  return null; // status 'active' in regola → nessun banner
}

export function HostSubscriptionBanner({ T, host }) {
  const [sub, setSub] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!host?.id) return;
    let cancelled = false;
    getSubscriptionStatus(host.id).then(s => {
      if (cancelled) return;
      setSub(s);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [host?.id]);

  if (!loaded) return null;
  const banner = pickBanner(sub);
  if (!banner) return null;

  const c = PALETTE[banner.tone];

  return (
    <Link
      to="/noleggia/abbonamento"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 18px',
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        textDecoration: 'none',
        color: c.fg,
      }}
    >
      <span style={{
        flex: 'none', width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={c.icon} size={16} color={c.fg} T={T} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <Txt T={T} size={13} weight={600} color={c.fg} style={{ display: 'block', lineHeight: 1.3 }}>
          {banner.title}
        </Txt>
        <Txt T={T} size={12} color={c.fg} style={{ display: 'block', opacity: 0.85, marginTop: 2, lineHeight: 1.35 }}>
          {banner.body}
        </Txt>
      </span>
      <span style={{
        flex: 'none',
        padding: '6px 12px',
        borderRadius: 999,
        background: c.fg,
        color: c.bg,
        fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {banner.cta}
      </span>
    </Link>
  );
}
