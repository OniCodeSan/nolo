// POST /functions/v1/stripe-webhook
// Endpoint chiamato da Stripe per notificare cambi di stato delle subscription.
// Stripe firma la richiesta con HMAC (header Stripe-Signature): verifichiamo
// la firma e poi aggiorniamo host_subscriptions di conseguenza.
//
// IMPORTANTE: configura questa Edge Function su Supabase con `--no-verify-jwt`
// perché Stripe non manda un Bearer token, ma firma il body con il webhook secret.

import { jsonResponse, internalError } from '../_shared/cors.ts';
import { getStripe, getServiceClient, APP_URL } from '../_shared/stripe.ts';
import { sendMail } from '../_shared/email.ts';
import type Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';

// Recupera email + nome host noleggiatore dato stripe_customer_id.
async function lookupHostContact(admin: ReturnType<typeof getServiceClient>, stripeCustomerId: string) {
  const { data: sub } = await admin
    .from('host_subscriptions')
    .select('host_id, hosts:hosts(name, business_email, owner_user_id)')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();
  if (!sub) return null;
  const host = (sub as { hosts: { name?: string; business_email?: string; owner_user_id?: string } | null }).hosts;
  if (!host) return null;
  let email = host.business_email;
  if (!email && host.owner_user_id) {
    const { data: u } = await admin.auth.admin.getUserById(host.owner_user_id);
    email = u?.user?.email;
  }
  return { host_id: sub.host_id, name: host.name, email, user_id: host.owner_user_id };
}

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  if (!WEBHOOK_SECRET) return jsonResponse({ error: 'STRIPE_WEBHOOK_SECRET non configurato' }, 500);

  const sig = req.headers.get('Stripe-Signature');
  if (!sig) return jsonResponse({ error: 'missing signature' }, 400);

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] firma non valida:', (err as Error).message);
    return jsonResponse({ error: 'invalid signature' }, 400);
  }

  const admin = getServiceClient();

  // L5: deduplica eventi (Stripe fa retry; un payload firmato può essere
  // ripetuto). Se l'event.id è già registrato, non rielaborare — evita email
  // transazionali duplicate. Richiede la tabella stripe_webhook_events
  // (creata nella migration di hardening).
  const { error: dupErr } = await admin
    .from('stripe_webhook_events')
    .insert({ event_id: event.id, type: event.type });
  if (dupErr) {
    if ((dupErr as { code?: string }).code === '23505') {
      return jsonResponse({ received: true, duplicate: true });
    }
    console.error('[stripe-webhook] dedup insert error:', dupErr);
    // errori non-PK non bloccano l'elaborazione
  }

  try {
    switch (event.type) {
      // ─── Subscription lifecycle ────────────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription;
        const prev = (event.data as { previous_attributes?: Partial<Stripe.Subscription> }).previous_attributes;
        const hostId = sub.metadata?.host_id;
        if (!hostId) {
          console.warn('[stripe-webhook] subscription senza host_id', sub.id);
          break;
        }

        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        await admin.from('host_subscriptions').upsert({
          host_id: hostId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price.id,
          status,
          trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
          trial_end:   sub.trial_end   ? new Date(sub.trial_end   * 1000).toISOString() : null,
          current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end:   sub.current_period_end   ? new Date(sub.current_period_end   * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        }, { onConflict: 'host_id' });

        // ─── Notifiche email transazionali ───
        const contact = await lookupHostContact(admin, customerId);
        if (contact?.email) {
          if (event.type === 'customer.subscription.created' && sub.status === 'trialing') {
            await sendMail({
              to: contact.email, to_user_id: contact.user_id,
              template: 'host_welcome',
              vars: { host_name: contact.name ?? 'noleggiatore', backoffice_url: `${APP_URL()}/noleggia` },
            });
          }
          if (event.type === 'customer.subscription.trial_will_end') {
            await sendMail({
              to: contact.email, to_user_id: contact.user_id,
              template: 'host_subscription_trial_ending',
              vars: {
                host_name: contact.name ?? 'noleggiatore',
                trial_end_date: sub.trial_end ? new Date(sub.trial_end * 1000).toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' }) : '',
                price_eur: '49',
                billing_url: `${APP_URL()}/noleggia/abbonamento`,
              },
            });
          }
          if (event.type === 'customer.subscription.deleted') {
            await sendMail({
              to: contact.email, to_user_id: contact.user_id,
              template: 'host_subscription_canceled',
              vars: { billing_url: `${APP_URL()}/noleggia/abbonamento` },
            });
          }
          // Trial finito con successo: passaggio trialing → active
          if (event.type === 'customer.subscription.updated'
              && prev?.status === 'trialing' && sub.status === 'active') {
            const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : null;
            const periodEnd   = sub.current_period_end   ? new Date(sub.current_period_end   * 1000) : null;
            const fmt = (d: Date | null) => d ? d.toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' }) : '—';
            await sendMail({
              to: contact.email, to_user_id: contact.user_id,
              template: 'host_trial_ended_success',
              vars: {
                host_name: contact.name ?? 'noleggiatore',
                amount_eur: ((sub.items.data[0]?.price.unit_amount ?? 4900) / 100).toFixed(2),
                period_start: fmt(periodStart),
                period_end:   fmt(periodEnd),
                billing_url:  `${APP_URL()}/noleggia/abbonamento`,
              },
            });
          }
          // Sospensione: past_due → unpaid (inserzioni oscurate)
          if (event.type === 'customer.subscription.updated'
              && sub.status === 'unpaid' && prev?.status !== 'unpaid') {
            await sendMail({
              to: contact.email, to_user_id: contact.user_id,
              template: 'host_subscription_suspended',
              vars: { billing_url: `${APP_URL()}/noleggia/abbonamento` },
            });
          }
        }
        break;
      }

      // ─── Fatturazione ───────────────────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
        if (!subId) break;

        await admin.from('host_subscriptions')
          .update({
            last_invoice_id: inv.id,
            last_invoice_paid_at: new Date((inv.status_transitions?.paid_at ?? Math.floor(Date.now()/1000)) * 1000).toISOString(),
            last_payment_error: null,
          })
          .eq('stripe_subscription_id', subId);
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
        if (!subId) break;

        const errorMsg = inv.last_finalization_error?.message
          ?? 'Addebito non riuscito. Aggiorna il metodo di pagamento dal Portale.';

        await admin.from('host_subscriptions')
          .update({ last_invoice_id: inv.id, last_payment_error: errorMsg })
          .eq('stripe_subscription_id', subId);

        const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
        if (customerId) {
          const contact = await lookupHostContact(admin, customerId);
          if (contact?.email) {
            await sendMail({
              to: contact.email, to_user_id: contact.user_id,
              template: 'host_subscription_payment_failed',
              vars: {
                host_name: contact.name ?? 'noleggiatore',
                price_eur: ((inv.amount_due ?? 4900) / 100).toFixed(2),
                error_reason: errorMsg,
                billing_url: `${APP_URL()}/noleggia/abbonamento`,
              },
            });
          }
        }
        break;
      }

      // ─── Customer dati ──────────────────────────────────────────────────────
      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer;
        await admin.from('host_subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('stripe_customer_id', customer.id);
        break;
      }

      default:
        // Stripe manda tanti tipi di eventi: logghiamo solo quello che non gestiamo.
        // console.log('[stripe-webhook] event ignorato:', event.type);
        break;
    }

    return jsonResponse({ received: true });
  } catch (err) {
    return internalError('stripe-webhook', err);
  }
});
