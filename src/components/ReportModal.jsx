import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Button, H, Txt } from './ui.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useToast } from '../state/ToastContext.jsx';
import { submitReport, REPORT_REASONS } from '../services/moderation.js';

// ReportModal — bottom-sheet su mobile, modal centrato su desktop.
// `targetType`: 'host' | 'car' | 'user' | 'review'
// `targetId`: id stringa del bersaglio
export function ReportModal({ T, open, onClose, targetType, targetId, targetLabel, isDesktop }) {
  const { t } = useTranslation();
  const { isAuthed, openAuthModal } = useAuth();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const onSubmit = async () => {
    if (!isAuthed) { openAuthModal(); return; }
    if (!reason) { toast.error(t('report.select_reason')); return; }
    setSubmitting(true);
    try {
      await submitReport({ targetType, targetId, reason, details });
      toast.success(t('report.sent'));
      setReason(''); setDetails('');
      onClose();
    } catch (e) {
      toast.error(e.message || t('report.error_send'));
    } finally {
      setSubmitting(false);
    }
  };

  const panelStyle = isDesktop
    ? { width: 480, maxWidth: 'calc(100vw - 40px)', background: T.bg, borderRadius: T.r.lg, boxShadow: T.sh.deep, overflow: 'hidden' }
    : { width: '100%', maxHeight: '90vh', background: T.bg, borderTopLeftRadius: T.r.lg, borderTopRightRadius: T.r.lg, boxShadow: T.sh.deep, overflow: 'hidden' };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.45)',
      zIndex: 220, display: 'flex',
      alignItems: isDesktop ? 'center' : 'flex-end',
      justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${T.line}` }}>
          <H T={T} size="h4">{t('report.title')}</H>
          <button onClick={onClose} aria-label={t('common.close')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="x" size={20} color={T.ink1} T={T} />
          </button>
        </div>

        <div style={{ padding: '18px 18px 20px', maxHeight: '70vh', overflow: 'auto' }}>
          {targetLabel && (
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginBottom: 14 }}>
              {t('report.reporting')} <strong style={{ color: T.ink1 }}>{targetLabel}</strong>
            </Txt>
          )}

          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
            {t('report.reason')}
          </Txt>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REPORT_REASONS.map(r => (
              <label key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: reason === r.id ? T.accent : T.surface,
                border: `1px solid ${reason === r.id ? T.ink1 : T.line}`,
                borderRadius: 10, cursor: 'pointer',
              }}>
                <input
                  type="radio" name="reason" value={r.id}
                  checked={reason === r.id} onChange={() => setReason(r.id)}
                  style={{ accentColor: T.ink1 }}
                />
                <Txt T={T} size={13} weight={reason === r.id ? 600 : 400}>{t(`report.reason_${r.id}`, r.l)}</Txt>
              </label>
            ))}
          </div>

          <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginTop: 18, marginBottom: 6 }}>
            {t('report.details')}
          </Txt>
          <textarea
            value={details} onChange={(e) => setDetails(e.target.value)}
            placeholder={t('report.details_ph')}
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', padding: 10,
              background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8,
              fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none',
              resize: 'vertical',
            }}
          />

          <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 12, lineHeight: 1.5 }}>
            {t('report.confidential')}
          </Txt>

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <Button T={T} variant="outline" size="md" onClick={onClose}>{t('common.cancel')}</Button>
            <Button T={T} variant="accent" size="md" full disabled={submitting || !reason} onClick={onSubmit}>
              {submitting ? t('report.sending') : t('report.submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
