import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Avatar, H, Rating, Txt } from './ui.jsx';

export function ReviewsSheet({ T, open, onClose, isDesktop, reviews, host }) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) return;
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);

  if (!open) return null;

  const panelStyle = isDesktop
    ? { width: 560, maxWidth: 'calc(100vw - 40px)', maxHeight: '85vh', background: T.bg, borderRadius: T.r.lg, boxShadow: T.sh.deep, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
    : { width: '100%', maxHeight: '90vh', background: T.bg, borderTopLeftRadius: T.r.lg, borderTopRightRadius: T.r.lg, boxShadow: T.sh.deep, display: 'flex', flexDirection: 'column', overflow: 'hidden' };

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.45)', zIndex: 200,
        display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center',
      }}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${T.line}` }}>
          <div>
            <H T={T} size="h4">{t('vehicle.reviews')}</H>
            {host && <Rating T={T} value={host.rating} count={host.reviews} size={12} />}
          </div>
          <button onClick={onClose} aria-label={t('common.close')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="x" size={20} color={T.ink1} T={T} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '18px' }}>
          {reviews.length === 0 ? (
            <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 24 }}>{t('gallery.no_reviews')}</Txt>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar T={T} name={r.avatar || r.n} size={36} />
                    <div style={{ flex: 1 }}>
                      <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{r.n}</Txt>
                      <Txt T={T} size={11} color={T.ink2}>{r.date}</Txt>
                    </div>
                    <Rating T={T} value={r.stars} size={12} />
                  </div>
                  <Txt T={T} size={13} color={T.ink1} style={{ display: 'block', marginTop: 10, lineHeight: 1.55 }}>{r.text}</Txt>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
