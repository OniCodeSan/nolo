import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, H, Txt } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { useAuth } from '../../state/AuthContext.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { useConsent } from '../../state/ConsentContext.jsx';
import { LANGS } from '../../i18n/langs.js';

function Toggle({ T, checked, onChange, label, hint, disabled }) {
  return (
    <label style={{
      display: 'flex', gap: 12, padding: '14px 16px',
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
    }}>
      <div style={{ flex: 1 }}>
        <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{label}</Txt>
        {hint && <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>{hint}</Txt>}
      </div>
      <span style={{
        width: 44, height: 24, borderRadius: 999, background: checked ? T.accent : T.line,
        position: 'relative', transition: 'background 200ms', flex: 'none', marginTop: 2,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 200ms',
        }} />
      </span>
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        disabled={disabled} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
    </label>
  );
}

function PrivacyConsentRow({ T }) {
  const { t } = useTranslation();
  const { consent, accept, reset } = useConsent();
  const set = (key, value) => accept({ ...consent, [key]: value });
  return (
    <div style={{
      padding: 14, background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: 12, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <Icon name="bell" size={18} color={T.ink2} T={T} />
        <div style={{ flex: 1 }}>
          <Txt T={T} size={14} weight={600}>{t('settings.cookie_title')}</Txt>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
            {t('settings.cookie_body')}
          </Txt>
        </div>
        <Button T={T} variant="ghost" size="sm" onClick={reset}>{t('settings.reopen_banner')}</Button>
      </div>
      <Toggle T={T} checked={!!consent.errors} onChange={(v) => set('errors', v)}
        label={t('settings.consent_errors')} hint={t('settings.consent_errors_hint')} />
      <Toggle T={T} checked={!!consent.analytics} onChange={(v) => set('analytics', v)}
        label={t('settings.consent_analytics')} hint={t('settings.consent_analytics_hint')} />
      <Toggle T={T} checked={!!consent.sessionRecording} onChange={(v) => set('sessionRecording', v)}
        label={t('settings.consent_replay')} hint={t('settings.consent_replay_hint')} />
    </div>
  );
}

function Section({ T, title, hint, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>{title}</Txt>
      {hint && <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', marginBottom: 10, lineHeight: 1.5 }}>{hint}</Txt>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </section>
  );
}

const LANGUAGES = LANGS.map(l => ({ id: l.code, l: l.label }));

export function SettingsSection({ T, isDesktop }) {
  const { t } = useTranslation();
  const { user, profile, updateProfile, signOut, deleteAccount } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({
    notif_email_bookings: true,
    notif_email_messages: true,
    notif_push_enabled: false,
    marketing_opt_in: false,
    language: 'it',
  });
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setState({
      notif_email_bookings: profile.notif_email_bookings ?? true,
      notif_email_messages: profile.notif_email_messages ?? true,
      notif_push_enabled:   profile.notif_push_enabled   ?? false,
      marketing_opt_in:     profile.marketing_opt_in     ?? false,
      language:             profile.language             ?? 'it',
    });
  }, [profile]);

  const setField = async (key, value) => {
    setState(s => ({ ...s, [key]: value }));
    setSaving(true);
    try {
      await updateProfile({ [key]: value });
    } catch (err) {
      toast.error(err.message || t('settings.error_save'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm(t('settings.delete_confirm'))) return;
    setConfirmingDelete(true);
    try {
      await deleteAccount();
      toast.info(t('settings.deleted_toast'));
      // Hard reload qui è intenzionale: cancellando l'account vogliamo
      // garantire che TUTTO lo state in-memory (caches, contexts) sia azzerato.
      window.location.assign('/');
    } catch (err) {
      toast.error(err.message || t('settings.error_delete'));
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '18px 18px 32px', maxWidth: 720 }}>
      <H T={T} size="h2">{t('settings.title')}</H>
      <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, marginBottom: 24 }}>
        {t('settings.subtitle')}
      </Txt>

      <Section T={T} title={t('settings.email_section')} hint={t('settings.email_hint')}>
        <Toggle T={T} checked={state.notif_email_bookings} onChange={(v) => setField('notif_email_bookings', v)}
          label={t('settings.toggle_bookings')} hint={t('settings.toggle_bookings_hint')} disabled={saving} />
        <Toggle T={T} checked={state.notif_email_messages} onChange={(v) => setField('notif_email_messages', v)}
          label={t('settings.toggle_messages')} hint={t('settings.toggle_messages_hint')} disabled={saving} />
        <Toggle T={T} checked={state.marketing_opt_in} onChange={(v) => setField('marketing_opt_in', v)}
          label={t('settings.toggle_marketing')} hint={t('settings.toggle_marketing_hint')} disabled={saving} />
      </Section>

      <Section T={T} title={t('settings.push_section')} hint={t('settings.push_hint')}>
        <Toggle T={T} checked={state.notif_push_enabled} onChange={(v) => setField('notif_push_enabled', v)}
          label={t('settings.toggle_push')} hint={t('settings.toggle_push_hint')} disabled />
      </Section>

      <Section T={T} title={t('settings.lang_section')}>
        <div style={{ padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
          <select value={state.language} onChange={(e) => setField('language', e.target.value)} disabled={saving}
            style={{
              width: '100%', padding: 10, background: T.surface, border: 'none', outline: 'none',
              fontFamily: T.fontBody, fontSize: 14, color: T.ink1,
            }}>
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.l}</option>)}
          </select>
        </div>
      </Section>

      <Section T={T} title={t('settings.privacy_section')} hint={t('settings.privacy_hint')}>
        <PrivacyConsentRow T={T} />
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="share" size={18} color={T.ink2} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={14} weight={600}>{t('settings.download_title')}</Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{t('settings.download_body')}</Txt>
          </div>
          <a href="mailto:hello@moviq.it?subject=Richiesta export dati GDPR" style={{ textDecoration: 'none' }}>
            <Button T={T} variant="outline" size="sm">{t('settings.request')}</Button>
          </a>
        </div>
      </Section>

      <Section T={T} title={t('settings.account_section')}>
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="user" size={18} color={T.ink2} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={14} weight={600}>{t('settings.signout_title')}</Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{t('settings.signout_body')}</Txt>
          </div>
          <Button T={T} variant="ghost" size="sm" onClick={signOut}>{t('auth.sign_out')}</Button>
        </div>

        <div style={{ padding: 14, background: T.coralSoft, border: `1px solid ${T.coral}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="x" size={18} color={T.coral} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={14} weight={600} color={T.alert}>{t('settings.delete_title')}</Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{t('settings.delete_body')}</Txt>
          </div>
          <Button T={T} variant="ghost" size="sm" onClick={onDelete} disabled={confirmingDelete} style={{ color: T.coral }}>
            {confirmingDelete ? t('settings.deleting') : t('settings.delete_btn')}
          </Button>
        </div>
      </Section>

      <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', textAlign: 'center', marginTop: 24 }}>
        {t('settings.email_label', { email: user.email })}
      </Txt>
    </div>
  );
}
