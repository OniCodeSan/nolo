import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/icons.jsx';
import { Button, H, Txt, Badge } from '../../components/ui.jsx';
import { listCarsByHost } from '../../services/cars.js';
import { listHostBookings, countHostPending } from '../../services/bookings.js';

function StatCard({ T, label, value, sub, tone }) {
  const bg = tone === 'accent' ? T.accent : tone === 'success' ? T.greenSoft : tone === 'alert' ? T.coralSoft : T.surface;
  return (
    <div style={{ padding: 18, background: bg, border: `1px solid ${T.line}`, borderRadius: 14 }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</Txt>
      <Txt T={T} size={32} weight={600} style={{ display: 'block', marginTop: 6, fontFamily: T.fontDisplay, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</Txt>
      <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>{sub}</Txt>
    </div>
  );
}

export function HostDashboard({ T }) {
  const { host, isDesktop } = useOutletContext();
  const navigate = useNavigate();

  const profileComplete = Boolean(host.terms) &&
    (host.paymentCards.length > 0 || host.paymentDebit || host.paymentCash || host.paymentBankTransfer);

  // Contatori reali (prima erano hardcoded a 0). Best-effort: se una fonte
  // fallisce, lasciamo il relativo valore a 0 senza rompere la dashboard.
  const [stats, setStats] = useState({ activeCars: 0, bookings: 0, pending: 0 });
  useEffect(() => {
    if (!host?.id) return;
    let cancelled = false;
    (async () => {
      const [cars, bookings, pending] = await Promise.all([
        listCarsByHost(host.id).catch(() => []),
        listHostBookings(host.id).catch(() => []),
        countHostPending(host.id).catch(() => 0),
      ]);
      if (cancelled) return;
      setStats({
        activeCars: cars.filter(c => c.status === 'active').length,
        bookings: bookings.length,
        pending,
      });
    })();
    return () => { cancelled = true; };
  }, [host?.id]);

  return (
    <div style={{ padding: isDesktop ? '32px 36px 60px' : '20px 18px 32px', maxWidth: 1280, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <Txt T={T} size={13} color={T.ink2}>Buongiorno,</Txt>
          <H T={T} size="h1" style={{ lineHeight: 1, marginTop: 2 }}>{host.n}</H>
        </div>
        {!host.verified && (
          <Badge T={T} tone="alert">Account non verificato</Badge>
        )}
      </div>

      {!profileComplete && (
        <div style={{
          marginTop: 22, padding: 16, background: T.accentSoft, border: `1px solid ${T.accent}`,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="sparkle" size={20} color={T.accentDeep} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={14} weight={600}>Completa il tuo profilo per iniziare</Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
              Imposta termini e modalità di pagamento accettate.
            </Txt>
          </div>
          <Button T={T} variant="primary" size="sm" iconRight="arrowRight" onClick={() => navigate('/noleggia/profilo')}>
            Completa
          </Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: 14, marginTop: 22 }}>
        <StatCard T={T} label="Veicoli attivi"      value={stats.activeCars} sub={stats.activeCars > 0 ? 'pubblicati' : 'aggiungi il primo'} />
        <StatCard T={T} label="Prenotazioni"        value={stats.bookings}   sub="totali"          tone="accent" />
        <StatCard T={T} label="Richieste da gestire" value={stats.pending}   sub={stats.pending > 0 ? 'da gestire' : 'nessuna in attesa'} tone="success" />
        <StatCard T={T} label="Rating"              value={host.rating || '—'} sub={`${host.reviews || 0} recensioni`} />
      </div>

      <div style={{ marginTop: 24, padding: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14 }}>
        <H T={T} size="h4">Cose da fare</H>
        <ul style={{ marginTop: 12, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name={host.terms ? 'check' : 'plus'} size={16} color={host.terms ? T.ok : T.ink2} T={T} />
            <Txt T={T} size={13} color={T.ink1} style={{ flex: 1, opacity: host.terms ? 0.6 : 1, textDecoration: host.terms ? 'line-through' : 'none' }}>
              Scrivi termini e condizioni del noleggio
            </Txt>
            {!host.terms && <Button T={T} variant="ghost" size="sm" onClick={() => navigate('/noleggia/profilo')}>Imposta</Button>}
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name={(host.paymentCards.length || host.paymentBankTransfer || host.paymentCash) ? 'check' : 'plus'} size={16} color={(host.paymentCards.length || host.paymentBankTransfer || host.paymentCash) ? T.ok : T.ink2} T={T} />
            <Txt T={T} size={13} color={T.ink1} style={{ flex: 1 }}>
              Configura modalità di pagamento accettate
            </Txt>
            <Button T={T} variant="ghost" size="sm" onClick={() => navigate('/noleggia/profilo')}>
              {host.paymentCards.length || host.paymentBankTransfer || host.paymentCash ? 'Modifica' : 'Imposta'}
            </Button>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="plus" size={16} color={T.ink2} T={T} />
            <Txt T={T} size={13} color={T.ink1} style={{ flex: 1 }}>
              Aggiungi il tuo primo veicolo
            </Txt>
            <Button T={T} variant="ghost" size="sm" onClick={() => navigate('/noleggia/veicoli')}>Aggiungi</Button>
          </li>
        </ul>
      </div>
    </div>
  );
}
