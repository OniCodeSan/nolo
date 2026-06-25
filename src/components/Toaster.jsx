import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';
import { useToast } from '../state/ToastContext.jsx';

const TONE_STYLE = (T) => ({
  info:    { bg: T.surface,    icon: 'bell',  iconColor: T.ink1,  border: T.line },
  success: { bg: T.greenSoft,  icon: 'check', iconColor: T.ok,    border: 'transparent' },
  error:   { bg: T.coralSoft,  icon: 'x',     iconColor: T.alert, border: 'transparent' },
});

export function Toaster({ T }) {
  const { t } = useTranslation();
  const { toasts, dismiss } = useToast();
  const styles = TONE_STYLE(T);
  if (!toasts.length) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 500,
        display: 'flex', flexDirection: 'column', gap: 8,
        width: 'calc(100vw - 32px)', maxWidth: 420,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(n => {
        const s = styles[n.tone] || styles.info;
        return (
          <div
            key={n.id}
            style={{
              pointerEvents: 'auto',
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: T.r.md,
              boxShadow: T.sh.deep,
              padding: '12px 14px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              animation: 'moviq-toast-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <span style={{
              flex: 'none', width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: s.iconColor,
            }}>
              <Icon name={s.icon} size={13} color="currentColor" T={T} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {n.title && <Txt T={T} size={13} weight={600} style={{ display: 'block', marginBottom: 2 }}>{n.title}</Txt>}
              <Txt T={T} size={13} color={T.ink1} style={{ lineHeight: 1.45 }}>{n.message}</Txt>
            </div>
            {n.action && (
              <button
                onClick={() => { n.action.onClick(); dismiss(n.id); }}
                style={{
                  flex: 'none', border: 'none', background: 'transparent',
                  cursor: 'pointer', padding: '2px 4px',
                  fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
                  color: T.ink1, textDecoration: 'underline',
                }}
              >
                {n.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(n.id)}
              aria-label={t('common.close_notification')}
              style={{
                flex: 'none', border: 'none', background: 'transparent',
                cursor: 'pointer', padding: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.ink2,
              }}
            >
              <Icon name="x" size={14} color="currentColor" T={T} />
            </button>
          </div>
        );
      })}
      <style>{`@keyframes moviq-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
