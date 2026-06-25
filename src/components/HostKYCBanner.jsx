import { Link } from 'react-router-dom';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';

// Banner persistente: l'host non può pubblicare veicoli finché kyc non è approved.
// Visibilità: tutto tranne kyc_status === 'approved'.

const PALETTE = {
  pending:   { bg: '#FEF3C7', border: '#FCD34D', fg: '#92400E', icon: 'bell',  cta: 'Completa verifica',
               title: 'Completa la verifica per pubblicare i tuoi veicoli',
               body:  'Servono ragione sociale, P.IVA, documento del legale rappresentante e dichiarazione RC. ~5 minuti.' },
  submitted: { bg: '#E0F2FE', border: '#7DD3FC', fg: '#075985', icon: 'check', cta: 'Vedi stato',
               title: 'Verifica in corso',
               body:  'Stiamo controllando i tuoi dati. Ti contattiamo entro 48 ore lavorative.' },
  rejected:  { bg: '#FEE2E2', border: '#FCA5A5', fg: '#991B1B', icon: 'bell',  cta: 'Correggi e reinvia',
               title: 'Verifica da correggere',
               body:  'Controlla i campi indicati come errati e reinvia.' },
};

export function HostKYCBanner({ T, host }) {
  if (!host) return null;
  const status = host.kyc_status || 'pending';
  if (status === 'approved') return null;

  const c = PALETTE[status] || PALETTE.pending;

  return (
    <Link
      to="/noleggia/verifica"
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
          {c.title}
        </Txt>
        <Txt T={T} size={12} color={c.fg} style={{ display: 'block', opacity: 0.85, marginTop: 2, lineHeight: 1.35 }}>
          {c.body}
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
        {c.cta}
      </span>
    </Link>
  );
}
