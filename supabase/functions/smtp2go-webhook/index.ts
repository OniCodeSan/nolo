// POST /functions/v1/smtp2go-webhook
// Riceve eventi da SMTP2GO (delivered, bounced, complained, opened) e aggiorna email_log.
//
// Deploy:  supabase functions deploy smtp2go-webhook --no-verify-jwt
// URL:     https://<REF>.supabase.co/functions/v1/smtp2go-webhook
//
// SMTP2GO chiede di proteggere l'endpoint con un secret token nell'URL o con HMAC.
// Qui usiamo: ?secret=<SMTP2GO_WEBHOOK_SECRET>

import { jsonResponse } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/stripe.ts';
import { safeEqual } from '../_shared/security.ts';

const WEBHOOK_SECRET = Deno.env.get('SMTP2GO_WEBHOOK_SECRET') ?? '';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  // M4: secret preferibilmente nell'header X-Webhook-Secret (non finisce nei
  // log di accesso/proxy come il querystring); querystring ?secret= mantenuto
  // solo per retrocompatibilità finché SMTP2GO non è riconfigurato sull'header.
  // Confronto a tempo costante per eliminare il timing oracle.
  const url = new URL(req.url);
  const provided = req.headers.get('x-webhook-secret') ?? url.searchParams.get('secret') ?? '';
  if (!WEBHOOK_SECRET || !(await safeEqual(provided, WEBHOOK_SECRET))) {
    return jsonResponse({ error: 'forbidden' }, 403);
  }

  let payload: Record<string, unknown>;
  try { payload = await req.json(); }
  catch { return jsonResponse({ error: 'invalid json' }, 400); }

  // SMTP2GO può mandare un singolo evento o un array di eventi
  const events = Array.isArray(payload) ? payload : [payload];
  const admin = getServiceClient();

  let updated = 0;
  for (const ev of events as Record<string, unknown>[]) {
    const eventType = String(ev.event ?? '').toLowerCase();
    const emailId   = String(ev.email_id ?? ev.id ?? '');
    if (!emailId) continue;

    const update: Record<string, unknown> = { provider_response: ev };
    switch (eventType) {
      case 'delivered':
        update.status = 'delivered';
        update.delivered_at = new Date().toISOString();
        break;
      case 'opened':
        update.status = 'opened';
        update.opened_at = new Date().toISOString();
        break;
      case 'bounce':
      case 'bounced':
      case 'hard_bounce':
        update.status = 'bounced';
        update.bounced_at = new Date().toISOString();
        update.error = String(ev.reason ?? 'bounce');
        break;
      case 'spam':
      case 'complaint':
      case 'complained':
        update.status = 'complained';
        update.complained_at = new Date().toISOString();
        update.error = 'marcata come spam dal destinatario';
        break;
      case 'rejected':
        update.status = 'rejected';
        update.error = String(ev.reason ?? 'rejected');
        break;
      default:
        // ignora altri eventi (es. unsubscribe non gestito qui)
        continue;
    }

    const { error } = await admin
      .from('email_log').update(update)
      .eq('provider_message_id', emailId);
    if (!error) updated++;
  }

  return jsonResponse({ ok: true, updated });
});
