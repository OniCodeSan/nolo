import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, H, Txt } from './ui.jsx';
import { Icon } from './icons.jsx';
import { useConsent } from '../state/ConsentContext.jsx';

// Cookie / consent banner GDPR-compliant.
// 3 stati:
//   1. nessuna decisione → banner full
//   2. utente ha cliccato "Personalizza" → preferences sheet
//   3. deciso → nascosto (riapribile da /profilo/impostazioni se vuoi esporlo)

function Toggle({ T, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 999, position: 'relative',
        background: checked ? T.ink1 : T.line, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        flex: 'none', transition: 'background 120ms',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 160ms',
      }} />
    </button>
  );
}

function CategoryRow({ T, title, desc, checked, onChange, mandatory }) {
  const { t } = useTranslation();
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0', borderBottom: `1px solid ${T.line}`,
    }}>
      <div style={{ flex: 1 }}>
        <Txt T={T} size={13} weight={600}>{title}</Txt>
        <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>
          {desc}{mandatory && <strong style={{ color: T.ink1 }}>{t('cookie.always_on')}</strong>}
        </Txt>
      </div>
      <Toggle T={T} checked={checked} onChange={onChange} disabled={mandatory} />
    </div>
  );
}

export function CookieBanner({ T, isDesktop }) {
  const { t } = useTranslation();
  const { decided, acceptAll, acceptNecessaryOnly, accept, consent } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [draft, setDraft] = useState(() => ({
    analytics: consent.analytics,
    sessionRecording: consent.sessionRecording,
    errors: consent.errors,
  }));

  if (decided) return null;

  const saveCustom = () => accept(draft);

  if (showDetails) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('cookie.pref_dialog_aria')}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.45)',
          zIndex: 400, display: 'flex',
          alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center',
          padding: isDesktop ? 24 : 0,
        }}
      >
        <div style={{
          width: isDesktop ? 520 : '100%', maxWidth: '100%', maxHeight: '90vh',
          background: T.bg,
          borderRadius: isDesktop ? T.r.lg : `${T.r.lg}px ${T.r.lg}px 0 0`,
          boxShadow: T.sh.deep, padding: 22, overflow: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              width: 36, height: 36, borderRadius: '50%', background: T.accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
            }}>
              <Icon name="sparkle" size={18} color={T.ink1} T={T} />
            </span>
            <H T={T} size="h4">{t('cookie.pref_title')}</H>
          </div>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 4, lineHeight: 1.5 }}>
            {t('cookie.pref_intro')}
          </Txt>

          <div style={{ marginTop: 14 }}>
            <CategoryRow
              T={T} mandatory checked
              title={t('cookie.cat_necessary')}
              desc={t('cookie.cat_necessary_desc')}
            />
            <CategoryRow
              T={T}
              checked={draft.errors}
              onChange={(v) => setDraft(d => ({ ...d, errors: v }))}
              title={t('cookie.cat_errors')}
              desc={t('cookie.cat_errors_desc')}
            />
            <CategoryRow
              T={T}
              checked={draft.analytics}
              onChange={(v) => setDraft(d => ({ ...d, analytics: v }))}
              title={t('cookie.cat_analytics')}
              desc={t('cookie.cat_analytics_desc')}
            />
            <CategoryRow
              T={T}
              checked={draft.sessionRecording}
              onChange={(v) => setDraft(d => ({ ...d, sessionRecording: v }))}
              title={t('cookie.cat_replay')}
              desc={t('cookie.cat_replay_desc')}
            />
          </div>

          <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 14, lineHeight: 1.5 }}>
            {t('cookie.change_mind_pre')}{' '}
            <Link to="/profilo/impostazioni" style={{ color: T.ink1, textDecoration: 'underline' }}>{t('cookie.settings_link')}</Link>.
          </Txt>

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <Button T={T} variant="outline" size="md" onClick={acceptNecessaryOnly}>{t('cookie.only_necessary')}</Button>
            <div style={{ flex: 1 }} />
            <Button T={T} variant="ghost" size="md" onClick={() => setShowDetails(false)}>{t('common.back')}</Button>
            <Button T={T} variant="accent" size="md" onClick={saveCustom}>{t('cookie.save_prefs')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={t('cookie.banner_aria')}
      style={{
        position: 'fixed',
        left: isDesktop ? 20 : 12,
        right: isDesktop ? 'auto' : 12,
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        zIndex: 400,
        maxWidth: isDesktop ? 440 : undefined,
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: T.r.lg,
        boxShadow: T.sh.deep,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <span style={{
          flex: 'none', width: 32, height: 32, borderRadius: '50%', background: T.accent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkle" size={16} color={T.ink1} T={T} />
        </span>
        <div style={{ flex: 1 }}>
          <H T={T} size="h5">{t('cookie.banner_title')}</H>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4, lineHeight: 1.5 }}>
            {t('cookie.banner_body')}{' '}
            <Link to="/aiuto#privacy" style={{ color: T.ink1, textDecoration: 'underline' }}>{t('cookie.privacy_link')}</Link>
            {' · '}
            <Link to="/aiuto#cookie" style={{ color: T.ink1, textDecoration: 'underline' }}>{t('cookie.cookie_link')}</Link>
          </Txt>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button T={T} variant="ghost" size="sm" onClick={acceptNecessaryOnly}>{t('cookie.only_necessary')}</Button>
        <Button T={T} variant="outline" size="sm" onClick={() => setShowDetails(true)}>{t('cookie.customize')}</Button>
        <div style={{ flex: 1 }} />
        <Button T={T} variant="accent" size="sm" onClick={acceptAll}>{t('cookie.accept_all')}</Button>
      </div>
    </div>
  );
}
