// POST /functions/v1/billing-portal
// Body: { host_id: string }
// Crea una sessione del Stripe Customer Portal per consentire all'host
// di gestire metodo di pagamento, scaricare fatture e disattivare l'abbonamento.

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import { getStripe, getServiceClient, getUserClient, APP_URL } from '../_shared/stripe.ts';

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

    const body = await req.json().catch(() => ({}));
    const hostId = body.host_id as string | undefined;
    if (!hostId) return jsonResponse({ error: 'host_id richiesto' }, 400);

    const admin = getServiceClient();
    const { data: host } = await admin
      .from('hosts').select('owner_user_id').eq('id', hostId).maybeSingle();
    if (!host || host.owner_user_id !== user.id) {
      return jsonResponse({ error: 'forbidden' }, 403);
    }

    const { data: sub } = await admin
      .from('host_subscriptions')
      .select('stripe_customer_id')
      .eq('host_id', hostId)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return jsonResponse({ error: 'nessun customer Stripe per questo host' }, 404);
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${APP_URL()}/noleggia/abbonamento`,
      locale: 'it',
    });

    return jsonResponse({ url: portal.url });
  } catch (err) {
    return internalError('billing-portal', err);
  }
});
