import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabase.js';
import { setUser as setSentryUser } from '../lib/sentry.js';
import { identify as analyticsIdentify, events as analyticsEvents } from '../lib/analytics.js';
import { useToast } from './ToastContext.jsx';

const AuthCtx = createContext(null);

// Supabase redirige con un hash tipo:
//   #error=access_denied&error_code=otp_expired&error_description=...
// quando il magic link è scaduto o già usato. Lo intercettiamo a mount,
// mostriamo un toast e ripuliamo l'URL.
function readAuthHashError() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('error')) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('error_code') || params.get('error');
  if (!code) return null;
  return {
    code,
    description: params.get('error_description')?.replace(/\+/g, ' ') || null,
  };
}

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState('customer'); // 'customer' | 'host'
  // Ultimo user id visto da onAuthStateChange (undefined = non ancora inizializzato).
  const prevUserIdRef = useRef(undefined);

  // Magic-link error handler — runs once at mount before Supabase consumes the hash.
  useEffect(() => {
    const err = readAuthHashError();
    if (!err) return;
    const isExpired = err.code === 'otp_expired' || err.description?.includes('expired');
    toast.error(
      isExpired
        ? 'Il link di accesso è scaduto. Richiedine uno nuovo.'
        : 'Accesso non riuscito. Riprova.',
      { duration: 7000 },
    );
    // Pulisci l'hash così non si ripresenta al refresh.
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      const newId = newUser?.id ?? null;
      // `SIGNED_IN` viene emesso anche al ripristino della sessione e al
      // refocus della tab, non solo al login reale: il toast deve comparire
      // solo su una vera transizione logout→login. Il primo evento fa da
      // seed (es. sessione già attiva al reload) e non mostra nulla.
      const prevId = prevUserIdRef.current;
      const firstEvent = prevId === undefined;
      prevUserIdRef.current = newId;
      setUser(newUser);
      if (event === 'SIGNED_IN' && newId && !firstEvent && prevId !== newId) {
        toast.success('Accesso effettuato.');
        analyticsEvents.signIn({ method: 'magic_link' });
      }
      if (event === 'SIGNED_OUT') {
        analyticsEvents.signOut();
      }
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // Sync user identity con Sentry + analytics (no-op se chiavi assenti)
  useEffect(() => {
    const payload = user ? { id: user.id, email: user.email } : null;
    setSentryUser(payload);
    analyticsIdentify(payload);
  }, [user]);

  // Load profile when user changes
  useEffect(() => {
    if (!user || !hasSupabase) { setProfile(null); return; }
    let cancelled = false;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled) setProfile(data || null); });
    return () => { cancelled = true; };
  }, [user]);

  // La lingua è guidata dall'URL (prefisso /en, /es, …), impostata in main.jsx.
  // Non la sovrascriviamo dal profilo per non desincronizzare URL e contenuto.
  // (La preferenza del profilo potrà guidare un redirect al login in futuro.)

  // Helper: estrae il messaggio d'errore strutturato dal body della Edge Function.
  // supabase.functions.invoke setta `error` su qualsiasi status non-2xx; il body
  // dettagliato è in error.context.
  const extractFnError = async (error, data) => {
    let serverMsg = data?.error;
    try {
      const ctx = await error?.context?.json?.();
      if (ctx?.error) serverMsg = ctx.error;
    } catch { /* noop */ }
    return serverMsg || error?.message || 'Errore di rete.';
  };

  // Registrazione: crea utente via Edge Function con role corretto (server-side).
  const signUp = async (email, password, role) => {
    if (!hasSupabase) throw new Error('Supabase non configurato.');
    const r = role === 'host' ? 'host' : 'customer';
    const { data, error } = await supabase.functions.invoke('auth-login', {
      body: { email, password, role: r, mode: 'signup' },
    });
    if (error) throw new Error(await extractFnError(error, data));
    if (data?.error) throw new Error(data.error);
    // Auto-login subito dopo la registrazione.
    const { error: signinErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signinErr) throw signinErr;
  };

  // Login: password normale + verifica ruolo lato client.
  const signInWithPassword = async (email, password, intendedRole) => {
    if (!hasSupabase) throw new Error('Supabase non configurato.');
    const r = intendedRole === 'host' ? 'host' : 'customer';
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const u = data.user;
    const actualRole = u?.app_metadata?.role === 'host' ? 'host' : 'customer';
    if (actualRole !== r) {
      // Login ha avuto successo ma il ruolo non combacia → signOut e errore.
      await supabase.auth.signOut();
      const otherLabel = actualRole === 'host' ? 'noleggiatore' : 'cliente';
      const intendedLabel = r === 'host' ? 'noleggiatore' : 'cliente';
      throw new Error(`Questa email è registrata come ${otherLabel}, non come ${intendedLabel}.`);
    }
  };

  // Reset password: invia email con link a /reset-password.
  const requestPasswordReset = async (email) => {
    if (!hasSupabase) throw new Error('Supabase non configurato.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
  };

  // Update password (usato nella pagina /reset-password dopo PASSWORD_RECOVERY event).
  const updatePassword = async (newPassword) => {
    if (!hasSupabase) throw new Error('Supabase non configurato.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!hasSupabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (patch) => {
    if (!hasSupabase || !user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    setProfile(data);
  };

  const deleteAccount = async () => {
    if (!hasSupabase || !user) return;
    // H8/GDPR: cancellazione REALE via edge function service_role, che rimuove
    // i dati da tutte le tabelle correlate e l'utente auth (no più soft-delete
    // del solo profilo, che lasciava PII orfana).
    const { data, error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) throw new Error(await extractFnError(error, data));
    if (data?.error) throw new Error(data.message || data.error);
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
  };

  // Ruolo letto dal JWT (app_metadata.role). Default 'customer' per utenti pre-migrazione.
  const role = user?.app_metadata?.role === 'host' ? 'host' : 'customer';

  const value = {
    user, profile, loading, role,
    isAuthed: Boolean(user),
    isHost: Boolean(user) && role === 'host',
    isCustomer: Boolean(user) && role === 'customer',
    authModalOpen, authModalRole,
    openAuthModal: (r = 'customer') => { setAuthModalRole(r === 'host' ? 'host' : 'customer'); setAuthModalOpen(true); },
    closeAuthModal: () => setAuthModalOpen(false),
    signUp, signInWithPassword, requestPasswordReset, updatePassword,
    signOut, updateProfile, deleteAccount,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
