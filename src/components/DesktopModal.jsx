import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from './icons.jsx';

export function DesktopModal({ T, children, ariaLabel, width = 560, height = 'auto' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const close = () => navigate(-1);

  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'rgba(20,15,5,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width, maxWidth: 'calc(100vw - 48px)',
          height, maxHeight: 'calc(100vh - 48px)',
          background: T.bg, borderRadius: T.r.lg,
          boxShadow: T.sh.deep,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={close}
          aria-label={t('common.close')}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 5,
            width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: T.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: T.sh.soft,
          }}
        >
          <Icon name="x" size={16} color={T.ink1} T={T} />
        </button>
        {children}
      </div>
    </div>
  );
}
