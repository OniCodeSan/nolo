// POST /functions/v1/send-email
// Funzione generica chiamata da altre Edge Function o da database triggers.
//
// Body: { to: string, to_user_id?: string, template: TemplateKey, vars: object,
//         from?: string, reply_to?: string, subject?: string }
//
// Auth: richiede service_role key (chiamate server-to-server interne)
// NON esporre al frontend — è una primitiva.

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import { sendMail } from '../_shared/email.ts';

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  // Verifica che la chiamata arrivi con un JWT che ha role=service_role.
  // Supabase Edge gateway ha già validato la firma del JWT; qui controlliamo solo il claim.
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    if (payload.role !== 'service_role') {
      return jsonResponse({ error: 'forbidden — service role required' }, 403);
    }
  } catch {
    return jsonResponse({ error: 'invalid token' }, 401);
  }

  try {
    const body = await req.json();
    const { to, template, vars = {}, to_user_id, from, reply_to, subject } = body;
    if (!to || !template) return jsonResponse({ error: 'to e template richiesti' }, 400);

    const result = await sendMail({ to, to_user_id, template, vars, from, reply_to, subject });
    return jsonResponse(result, result.ok ? 200 : 500);
  } catch (err) {
    return internalError('send-email', err);
  }
});
