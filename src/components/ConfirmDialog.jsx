import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Button, H, Txt } from './ui.jsx';

export function ConfirmDialog({ T, open, title, body, confirmLabel, cancelLabel, tone = 'default', onConfirm, onClose, busy }) {
  const { t } = useTranslation();
  const confirmText = confirmLabel || t('common.confirm');
  const cancelText = cancelLabel || t('common.cancel');
  useEffect(() => {
    if (!open) return;
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);

  if (!open) return null;

  const danger = tone === 'danger';

  return (
    <div role="dialog" aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.5)', zIndex: 250,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.bg, borderRadius: 16, boxShadow: T.sh.deep,
        maxWidth: 420, width: '100%', overflow: 'hidden',
      }}>
        <div style={{ padding: '22px 22px 6px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{
            width: 40, height: 40, borderRadius: '50%',
            background: danger ? T.coralSoft : T.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
          }}>
            <Icon name={danger ? 'x' : 'sparkle'} size={20} color={danger ? T.coral : T.accentDeep} T={T} />
          </span>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <H T={T} size="h4">{title}</H>
            {body && <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8, lineHeight: 1.55 }}>{body}</Txt>}
          </div>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button T={T} variant="ghost" size="md" onClick={onClose} disabled={busy}>{cancelText}</Button>
          <Button T={T} variant={danger ? 'primary' : 'accent'} size="md" onClick={onConfirm} disabled={busy}
            style={danger ? { background: T.coral, color: '#fff', borderColor: T.coral } : {}}>
            {busy ? '…' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
