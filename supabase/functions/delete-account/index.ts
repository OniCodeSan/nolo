// POST /functions/v1/delete-account
// H8 (GDPR art.17): cancellazione REALE dell'account e dei dati personali.
// Il vecchio flusso client cancellava solo `profiles`, lasciando auth.users,
// bookings, messaggi, sessioni (IP/geo), notifiche, ecc. → violazione GDPR.
//
// Qui, con service_role, si rimuovono i dati dell'utente da tutte le tabelle
// correlate e poi si cancella l'utente auth. Richiede un JWT utente valido
// (verify_jwt=true nel config.toml): l'utente può cancellare solo se stesso.
//
// Gli account NOLEGGIATORE sono esclusi: la loro chiusura coinvolge abbonamento
// Stripe e prenotazioni in corso e va gestita dal supporto.

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import { getServiceClient, getUserClient } from '../_shared/stripe.ts';

// (table, colonna che referenzia l'utente). Best-effort: un errore su una
// singola tabella (es. colonna/tabella assente) non blocca la cancellazione.
// Colonne allineate allo schema REALE di produzione.
const DELETIONS: { table: string; column: string }[] = [
  { table: 'saved_cars',    column: 'user_id' },
  { table: 'notifications', column: 'user_id' },
  { table: 'reports',       column: 'reporter_id' },
  { table: 'messages',      column: 'sender_id' },
  { table: 'messages',      column: 'recipient_id' },
  { table: 'bookings',      column: 'user_id' },
  { table: 'user_sessions', column: 'user_id' },
  { table: 'profiles',      column: 'id' },
];

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'unauthorized' }, 401);

    const userClient = getUserClient(authHeader);
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return jsonResponse({ error: 'unauthorized' }, 401);

    const admin = getServiceClient();

    // Account noleggiatore: richiede gestione dedicata (Stripe + prenotazioni).
    const { data: host } = await admin
      .from('hosts').select('id').eq('owner_user_id', user.id).maybeSingle();
    if (host) {
      return jsonResponse({
        error: 'host_requires_support',
        message: 'La cancellazione di un account noleggiatore richiede la chiusura di abbonamento e prenotazioni. Scrivi a support@moviq.it.',
      }, 409);
    }

    const partial: string[] = [];
    for (const d of DELETIONS) {
      const { error: delErr } = await admin.from(d.table).delete().eq(d.column, user.id);
      if (delErr) partial.push(`${d.table}.${d.column}: ${delErr.message}`);
    }
    if (partial.length) console.warn('[delete-account] cancellazioni parziali:', partial);

    // Cancellazione hard dell'utente auth (false = niente soft-delete).
    const { error: authErr } = await admin.auth.admin.deleteUser(user.id, false);
    if (authErr) return internalError('delete-account', authErr);

    return jsonResponse({ ok: true });
  } catch (err) {
    return internalError('delete-account', err);
  }
});
