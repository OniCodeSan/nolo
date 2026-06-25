import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Button, H, Txt } from './ui.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { hasSupabase } from '../lib/supabase.js';

export function AuthModal({ T, isDesktop }) {
  const { t } = useTranslation();
  const {
    authModalOpen, authModalRole, closeAuthModal,
    signUp, signInWithPassword, requestPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  if (!authModalOpen) return null;

  const isHost = authModalRole === 'host';
  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';

  const title = isHost
    ? (isSignup ? t('auth.title_host_signup') : t('auth.title_host_signin'))
    : (isSignup ? t('auth.title_signup') : t('auth.title_signin'));

  const reset = () => {
    setEmail(''); setPassword(''); setStatus('idle'); setError(null); setMode('signin');
  };

  const close = () => { reset(); closeAuthModal(); };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError(t('auth.invalid_email', 'Inserisci un indirizzo email valido.'));
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      if (isReset) {
        await requestPasswordReset(email.trim());
        setStatus('sent');
      } else if (isSignup) {
        if (password.length < 8) throw new Error(t('auth.password_too_short'));
        await signUp(email.trim(), password, authModalRole);
        // Auto-login fatto da signUp; chiudi modal.
        close();
      } else {
        await signInWithPassword(email.trim(), password, authModalRole);
        close();
      }
    } catch (err) {
      setError(err.message || t('auth.error_generic'));
      setStatus('error');
    }
  };

  const panelStyle = isDesktop
    ? {
        width: 440, maxWidth: 'calc(100vw - 40px)',
        background: T.bg, borderRadius: T.r.lg, boxShadow: T.sh.deep,
        overflow: 'hidden',
      }
    : {
        width: '100%', maxHeight: '90vh',
        background: T.bg,
        borderTopLeftRadius: T.r.lg, borderTopRightRadius: T.r.lg,
        boxShadow: T.sh.deep, overflow: 'hidden',
      };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px',
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md,
    fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink2,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  const linkBtnStyle = {
    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
    color: T.ink2, fontFamily: T.fontBody, fontSize: 12,
    textDecoration: 'underline', textUnderlineOffset: 3,
  };

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.45)',
        zIndex: 10000, display: 'flex',
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: `1px solid ${T.line}`,
        }}>
          <H T={T} size="h4">{title}</H>
          <button onClick={close} aria-label={t('common.close')} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={20} color={T.ink1} T={T} />
          </button>
        </div>

        <div style={{ padding: '20px 18px 18px' }}>
          {!hasSupabase && (
            <div style={{ padding: 12, background: T.surfaceAlt, borderRadius: T.r.md, marginBottom: 14 }}>
              <Txt T={T} size={12} color={T.ink2}>
                Supabase non configurato. Imposta <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.
              </Txt>
            </div>
          )}

          {isHost && (
            <div style={{
              padding: '8px 12px', marginBottom: 12, borderRadius: T.r.sm,
              background: T.accent, color: T.ink1,
              fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'inline-block',
            }}>
              {t('auth.host_area')}
            </div>
          )}

          {status === 'sent' && isReset ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: T.accent,
                margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={28} color={T.ink1} T={T} />
              </div>
              <H T={T} size="h5">{t('auth.check_mail')}</H>
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8, lineHeight: 1.55 }}>
                {t('auth.reset_sent_pre')} <strong>{email}</strong>.
              </Txt>
              <Button T={T} variant="outline" size="md" full style={{ marginTop: 18 }} onClick={close}>{t('auth.got_it')}</Button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 16, lineHeight: 1.55 }}>
                {isReset
                  ? t('auth.desc_reset')
                  : isSignup
                  ? (isHost ? t('auth.desc_signup_host') : t('auth.desc_signup_user'))
                  : (isHost ? t('auth.desc_signin_host') : t('auth.desc_signin_user'))}
              </Txt>

              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={labelStyle}>{t('auth.email_label')}</span>
                <input
                  type="email" required autoFocus
                  disabled={!hasSupabase || status === 'sending'}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@example.com"
                  style={inputStyle}
                />
              </label>

              {!isReset && (
                <label style={{ display: 'block', marginBottom: 6 }}>
                  <span style={labelStyle}>{t('auth.password_label')}{isSignup ? t('auth.password_min') : ''}</span>
                  <input
                    type="password" required
                    minLength={isSignup ? 8 : undefined}
                    disabled={!hasSupabase || status === 'sending'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    style={inputStyle}
                  />
                </label>
              )}

              {!isSignup && !isReset && (
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <button type="button" style={linkBtnStyle} onClick={() => { setMode('reset'); setError(null); }}>
                    {t('auth.forgot')}
                  </button>
                </div>
              )}

              {error && (
                <Txt T={T} size={12} color={T.coral} style={{ display: 'block', marginTop: 10 }}>{error}</Txt>
              )}

              <Button T={T} variant="accent" size="lg" full iconRight="arrowRight" type="submit"
                disabled={!hasSupabase || status === 'sending'}
                style={{ marginTop: 14 }}
              >
                {status === 'sending'
                  ? t('auth.sending')
                  : isReset
                  ? t('auth.send_reset')
                  : isSignup
                  ? (isHost ? t('auth.create_host') : t('auth.create_account'))
                  : (isHost ? t('auth.signin_backoffice') : t('auth.sign_in'))}
              </Button>

              <div style={{ marginTop: 14, textAlign: 'center' }}>
                {isReset ? (
                  <button type="button" style={linkBtnStyle} onClick={() => { setMode('signin'); setError(null); }}>
                    {t('auth.back_to_login')}
                  </button>
                ) : isSignup ? (
                  <Txt T={T} size={12} color={T.ink3}>
                    {t('auth.have_account')}{' '}
                    <button type="button" style={linkBtnStyle} onClick={() => { setMode('signin'); setError(null); }}>
                      {t('auth.sign_in')}
                    </button>
                  </Txt>
                ) : (
                  <Txt T={T} size={12} color={T.ink3}>
                    {t('auth.no_account')}{' '}
                    <button type="button" style={linkBtnStyle} onClick={() => { setMode('signup'); setError(null); }}>
                      {isHost ? t('auth.signup_host') : t('auth.sign_up')}
                    </button>
                  </Txt>
                )}
              </div>

              <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
                {t('auth.terms_notice')}
              </Txt>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
