// POST /functions/v1/password-reset
// "Password dimenticata": genera il link di recupero con l'API admin di
// Supabase Auth e lo spedisce col nostro canale email (SMTP2GO, template
// password_reset, riga in email_log) invece che con l'SMTP interno di
// Supabase Auth, che rispondeva 500 "Error sending recovery email".
//
// Body: { email: string }
// Il link porta a <origine>/reset-password?token_hash=…&type=recovery, dove la
// pagina chiama verifyOtp. L'origine è quella della richiesta se in ALLOWED
// (prod + stage locale), altrimenti la produzione.
// Risponde sempre 200 a una richiesta ben formata: non rivela se l'email è
// registrata. Massimo MAX_PER_WINDOW invii per email ogni WINDOW_MINUTES.
//
// Deploy: supabase functions deploy password-reset --project-ref togcwgymwrnhiihduapb

import { getServiceClient } from '../_shared/stripe.ts';
import { sendMail } from '../_shared/email.ts';

const PRIMARY_ORIGIN = Deno.env.get('APP_ORIGIN') ?? 'https://moviq.it';
const ALLOWED = [PRIMARY_ORIGIN, 'http://localhost:8083', 'http://localhost:5173'];
const WINDOW_MINUTES = 15;
const MAX_PER_WINDOW = 3;
const LINK_MINUTES = 60;   // scadenza OTP di default di Supabase Auth

function cors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (req) => {
  const reqOrigin = req.headers.get('origin') ?? '';
  const origin = ALLOWED.includes(reqOrigin) ? reqOrigin : PRIMARY_ORIGIN;
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
    status, headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let email = '';
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch { /* gestito sotto */ }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: 'Email non valida.' }, 400);
  }

  try {
    const admin = getServiceClient();

    const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await admin.from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('template', 'password_reset').eq('to_email', email).gte('created_at', since);
    if ((count ?? 0) >= MAX_PER_WINDOW) return json({ ok: true });

    // Email non registrata → errore qui: rispondiamo ok lo stesso.
    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email });
    if (error || !data?.properties?.hashed_token) return json({ ok: true });

    const link = `${origin}/reset-password?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`;
    const sent = await sendMail({
      to: email,
      to_user_id: data.user?.id ?? null,
      template: 'password_reset',
      vars: { reset_link: link, expires_in_minutes: LINK_MINUTES },
    });
    if (!sent.ok) {
      console.error('[password-reset] invio fallito', sent.error);
      return json({ error: 'Invio email non riuscito. Riprova tra qualche minuto.' }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error('[password-reset]', err);
    return json({ error: 'Errore interno. Riprova più tardi.' }, 500);
  }
});
