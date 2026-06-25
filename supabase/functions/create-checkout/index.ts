// POST /functions/v1/create-checkout
// Body: { host_id: string }
// Headers: Authorization: Bearer <user_jwt>
//
// 1. Verifica che l'utente loggato sia owner dell'host_id passato.
// 2. Recupera (o crea) il Customer Stripe per quell'host.
// 3. Crea una Checkout Session in modalità 'subscription' con trial 30 giorni.
// 4. Ritorna l'URL → il frontend redirige l'utente a Stripe.

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import {
  getStripe,
  getServiceClient,
  getUserClient,
  STRIPE_PRICE_ID,
  APP_URL,
  TRIAL_DAYS,
} from '../_shared/stripe.ts';

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

    const priceId = STRIPE_PRICE_ID();
    if (!priceId) return jsonResponse({ error: 'STRIPE_PRICE_ID non configurato' }, 500);

    const admin = getServiceClient();

    // 1. Verifica ownership
    const { data: host, error: hostErr } = await admin
      .from('hosts')
      .select('id, owner_user_id, business_email, vat_number, name')
      .eq('id', hostId)
      .maybeSingle();
    if (hostErr || !host) return jsonResponse({ error: 'host non trovato' }, 404);
    if (host.owner_user_id !== user.id) return jsonResponse({ error: 'forbidden' }, 403);

    // 2. Recupera o crea Stripe Customer
    const { data: existing } = await admin
      .from('host_subscriptions')
      .select('stripe_customer_id, status')
      .eq('host_id', hostId)
      .maybeSingle();

    // Blocco: se ha già una subscription attiva, niente checkout.
    if (existing && ['trialing','active','past_due'].includes(existing.status)) {
      return jsonResponse({ error: 'abbonamento già attivo', status: existing.status }, 409);
    }

    const stripe = getStripe();
    let customerId = existing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: host.business_email ?? user.email ?? undefined,
        name: host.name ?? undefined,
        metadata: { host_id: hostId, supabase_user_id: user.id },
        // P.IVA italiana se presente — Stripe gestisce reverse-charge UE.
        tax_id_data: host.vat_number
          ? [{ type: 'eu_vat', value: host.vat_number.startsWith('IT') ? host.vat_number : `IT${host.vat_number}` }]
          : undefined,
      });
      customerId = customer.id;

      // Upsert riga subscription preliminare in stato 'none'
      await admin.from('host_subscriptions').upsert({
        host_id: hostId,
        stripe_customer_id: customerId,
        status: 'none',
      }, { onConflict: 'host_id' });
    }

    // 3. Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { host_id: hostId, supabase_user_id: user.id },
        // Cosa fare al termine del trial se la carta non è valida
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
      },
      payment_method_collection: 'always', // chiede carta anche durante il trial
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      customer_update: { name: 'auto', address: 'auto' },
      tax_id_collection: { enabled: true },
      success_url: `${APP_URL()}/noleggia/abbonamento?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL()}/noleggia/abbonamento?checkout=cancel`,
      locale: 'it',
    });

    return jsonResponse({ url: session.url });
  } catch (err) {
    return internalError('create-checkout', err);
  }
});
