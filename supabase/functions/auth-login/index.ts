// POST /functions/v1/auth-login
// Body: { email: string, password: string, role: 'customer'|'host', mode: 'signup' | 'check-role'? }
//
// Modi:
//   mode='signup' (default per ora) — registra nuovo utente con email/password e role corretto.
//     1. Lookup utente via service_role.
//     2. Se esiste con qualsiasi ruolo → 409 (l'email è già registrata, deve fare login).
//     3. Se non esiste → admin.createUser(email, password, app_metadata.role=role), email_confirm:true.
//   mode='check-role' — solo verifica che email+role siano coerenti (no DB write). Usato post-login.
//
// Il SIGNIN normale (email+password) lo fa il frontend direttamente con supabase.auth.signInWithPassword.
// Il ruolo viene poi verificato lato client confrontando user.app_metadata.role.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// CORS inline (l'editor web Supabase non vede `_shared/cors.ts`).
// L17: origine ristretta alla produzione (niente wildcard `*`) così un sito
// terzo non può sondare dal browser della vittima l'oracolo di esistenza
// account/ruolo. www.moviq.it fa 301 all'apex → frontend sempre su moviq.it.
const APP_ORIGIN = Deno.env.get('APP_ORIGIN') ?? 'https://moviq.it';
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': APP_ORIGIN,
  'Vary': 'Origin',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type Role = 'customer' | 'host';
const VALID_ROLES: Role[] = ['customer', 'host'];

function isValidEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidPassword(s: unknown): s is string {
  return typeof s === 'string' && s.length >= 8 && s.length <= 200;
}

function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY mancanti');
  return createClient(url, key, { auth: { persistSession: false } });
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').toString().trim().toLowerCase();
    const password = body.password as string | undefined;
    const role = body.role as Role;
    const mode = (body.mode || 'signup') as 'signup' | 'check-role';

    if (!isValidEmail(email)) return jsonResponse({ error: 'Email non valida.' }, 400);
    if (!VALID_ROLES.includes(role)) return jsonResponse({ error: 'Ruolo non valido.' }, 400);

    const admin = getServiceClient();

    // Lookup ruolo esistente per questa email
    const { data: existingRole, error: lookupErr } = await admin.rpc('get_user_role_by_email', { p_email: email });
    if (lookupErr) {
      console.error('[auth-login] lookup error', lookupErr);
      return jsonResponse({ error: 'Errore interno (lookup).' }, 500);
    }
    // existingRole: null = non esiste; '' = esiste senza ruolo (legacy); 'customer'|'host' = esiste con ruolo
    const userExists = existingRole !== null;
    const currentRole = (existingRole || '') as string;

    // === mode = check-role: solo verifica, no scrittura ===
    if (mode === 'check-role') {
      if (!userExists) return jsonResponse({ error: 'Account non trovato.', code: 'no_user' }, 404);
      if (currentRole && currentRole !== role) {
        const otherLabel = currentRole === 'host' ? 'noleggiatore' : 'cliente';
        const intendedLabel = role === 'host' ? 'noleggiatore' : 'cliente';
        return jsonResponse({
          error: `Questa email è registrata come ${otherLabel}, non come ${intendedLabel}.`,
          code: 'role_mismatch',
        }, 409);
      }
      return jsonResponse({ ok: true });
    }

    // === mode = signup ===
    if (!isValidPassword(password)) {
      return jsonResponse({ error: 'La password deve avere almeno 8 caratteri.' }, 400);
    }

    if (userExists) {
      const otherLabel = currentRole === 'host' ? 'noleggiatore' : currentRole === 'customer' ? 'cliente' : null;
      const intendedLabel = role === 'host' ? 'noleggiatore' : 'cliente';
      if (otherLabel && otherLabel !== intendedLabel) {
        return jsonResponse({
          error: `Questa email è già registrata come ${otherLabel}. Per accedere come ${intendedLabel} usa un'email diversa.`,
          code: 'role_mismatch',
        }, 409);
      }
      // Email già registrata con stesso ruolo (o legacy) → invita a fare login
      return jsonResponse({
        error: 'Questa email è già registrata. Fai login con la tua password.',
        code: 'email_taken',
      }, 409);
    }

    // Crea nuovo utente con password e ruolo
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // skip conferma email — non blocchiamo il primo accesso
      app_metadata: { role, provider: 'password' },
    });
    if (createErr) {
      console.error('[auth-login] create error', createErr);
      const msg = createErr.message?.toLowerCase();
      if (msg?.includes('weak') || msg?.includes('password')) {
        return jsonResponse({ error: 'Password troppo debole.' }, 400);
      }
      if (msg?.includes('already') || msg?.includes('registered')) {
        return jsonResponse({ error: 'Questa email è già registrata.', code: 'email_taken' }, 409);
      }
      return jsonResponse({ error: 'Errore creazione utente.' }, 500);
    }

    return jsonResponse({ ok: true, created: true });
  } catch (e) {
    console.error('[auth-login] unhandled', e);
    return jsonResponse({ error: 'Errore interno.' }, 500);
  }
});
