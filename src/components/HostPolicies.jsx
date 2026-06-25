import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Badge, H, Txt } from './ui.jsx';

const CARD_LABEL = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express',
  maestro: 'Maestro', jcb: 'JCB', diners: 'Diners',
};

function PaymentChip({ T, label, sub }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', background: T.surfaceAlt, border: `1px solid ${T.line}`,
      borderRadius: 999, fontFamily: T.fontBody, fontSize: 12,
    }}>
      <Icon name="check" size={11} color={T.ok} T={T} />
      <span style={{ fontWeight: 600, color: T.ink1 }}>{label}</span>
      {sub && <span style={{ color: T.ink2 }}>{sub}</span>}
    </span>
  );
}

export function PaymentMethods({ T, host, compact }) {
  const { t } = useTranslation();
  if (!host) return null;
  const items = [];
  if (host.paymentCards?.length) {
    const labels = host.paymentCards.map(c => CARD_LABEL[c] || c).join(', ');
    items.push({ key: 'cards', label: t('policies.cards'), sub: labels });
  }
  if (host.paymentDebit) items.push({ key: 'debit', label: t('policies.debit') });
  if (host.paymentCash) items.push({ key: 'cash', label: t('policies.cash'), sub: t('policies.cash_limit', { amount: host.paymentCashLimitEur || 5000 }) });
  if (host.paymentBankTransfer) items.push({ key: 'bank', label: t('policies.bank') });

  if (!items.length) {
    return (
      <Txt T={T} size={12} color={T.ink3}>{t('policies.no_payments')}</Txt>
    );
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map(it => <PaymentChip key={it.key} T={T} label={it.label} sub={it.sub} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(it => (
        <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="check" size={14} color={T.ok} T={T} />
          <Txt T={T} size={13} weight={500}>{it.label}</Txt>
          {it.sub && <Txt T={T} size={12} color={T.ink2}>· {it.sub}</Txt>}
        </div>
      ))}
    </div>
  );
}

export function HostTerms({ T, host, expandable = true, defaultOpen = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  if (!host?.terms) {
    return (
      <Txt T={T} size={12} color={T.ink3}>{t('policies.no_terms')}</Txt>
    );
  }
  const preview = host.terms.slice(0, 140);
  const hasMore = host.terms.length > 140;

  if (!expandable) {
    return <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{host.terms}</Txt>;
  }

  return (
    <div>
      <Txt T={T} size={13} color={T.ink1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {open ? host.terms : preview + (hasMore ? '…' : '')}
      </Txt>
      {hasMore && (
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            marginTop: 6, border: 'none', background: 'transparent', cursor: 'pointer',
            padding: 0, color: T.ink1, textDecoration: 'underline',
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
          }}
        >
          {open ? t('policies.show_less') : t('policies.read_all')}
        </button>
      )}
    </div>
  );
}

export function HostPoliciesBlock({ T, host, title, collapseTerms = true }) {
  const { t } = useTranslation();
  if (!host) return null;
  const blockTitle = title || t('policies.default_title');
  const hasPayments = host.paymentCards?.length || host.paymentDebit || host.paymentCash || host.paymentBankTransfer;
  const hasTerms = !!host.terms;
  if (!hasPayments && !hasTerms) return null;

  return (
    <div style={{ marginTop: 20, padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <H T={T} size="h5">{blockTitle}</H>
        {host.verified && <Badge T={T} tone="success" icon="check">{t('policies.verified_host')}</Badge>}
      </div>

      {hasPayments && (
        <div style={{ marginTop: 12 }}>
          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>{t('policies.payments_accepted')}</Txt>
          <PaymentMethods T={T} host={host} compact />
        </div>
      )}

      {hasTerms && (
        <div style={{ marginTop: 14 }}>
          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>{t('policies.host_terms')}</Txt>
          <HostTerms T={T} host={host} expandable={collapseTerms} defaultOpen={!collapseTerms} />
        </div>
      )}
    </div>
  );
}
