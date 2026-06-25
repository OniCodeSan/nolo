import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { Button, H, Txt } from '../components/ui.jsx';

// Atterraggio dal link "Hai dimenticato la password?".
// Supabase emette evento PASSWORD_RECOVERY al consumo del token nell'URL;
// la sessione è temporanea finché non chiamiamo updateUser({password}).
export function ResetPassword({ T }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Caso: l'utente arriva su /reset-password con sessione già aperta (raro ma possibile).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => { sub?.subscription?.unsubscribe(); };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError(t('auth.reset_min8')); return; }
    if (password !== confirm) { setError(t('auth.reset_mismatch')); return; }
    setStatus('saving');
    try {
      await updatePassword(password);
      setStatus('done');
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      setError(err.message || t('auth.reset_error'));
      setStatus('error');
    }
  };

  if (!ready) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: T.bg }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <H T={T} size="h3">{t('auth.reset_invalid_title')}</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8, lineHeight: 1.55 }}>
            {t('auth.reset_invalid_body')}
          </Txt>
          <Button T={T} variant="accent" size="md" style={{ marginTop: 18 }} onClick={() => navigate('/')}>{t('auth.back_home')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: T.bg }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420 }}>
        <H T={T} size="h2">{t('auth.reset_set_title')}</H>
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8, marginBottom: 18, lineHeight: 1.55 }}>
          {t('auth.reset_set_sub')}
        </Txt>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ display: 'block', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('auth.new_password')}</span>
          <input
            type="password" required minLength={8} autoFocus
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 6 }}>
          <span style={{ display: 'block', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('auth.confirm_password')}</span>
          <input
            type="password" required minLength={8}
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none' }}
          />
        </label>

        {error && <Txt T={T} size={12} color={T.coral} style={{ display: 'block', marginTop: 8 }}>{error}</Txt>}
        {status === 'done' && <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 8 }}>{t('auth.reset_done')}</Txt>}

        <Button T={T} variant="accent" size="lg" full iconRight="arrowRight" disabled={status === 'saving' || status === 'done'} style={{ marginTop: 18 }}>
          {status === 'saving' ? t('common.saving') : t('auth.reset_save')}
        </Button>
      </form>
    </div>
  );
}
