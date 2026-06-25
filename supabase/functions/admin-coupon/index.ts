// POST /functions/v1/admin-coupon
// Body: { action: 'create' | 'deactivate' | 'list' | 'sync', ...payload }
//
// Crea/disattiva coupon Stripe e li sincronizza con admin_coupons.
// Solo admin: verifica claim app_metadata.role === 'admin'.

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import { getStripe, getServiceClient, getUserClient } from '../_shared/stripe.ts';
import type Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('unauthorized');
  const client = getUserClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('unauthorized');
  // M9: fonte unica di verità per l'admin = profiles.is_admin (resa non
  // scrivibile dal client dal trigger della migration). Niente più claim JWT
  // app_metadata.role='admin' (che nessun flusso impostava).
  const admin = getServiceClient();
  const { data: prof } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!prof?.is_admin) throw new Error('forbidden');
  return user;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const stripe = getStripe();
    const admin  = getServiceClient();

    // ─── LIST ──────────────────────────────────────────────────────────────
    if (action === 'list') {
      const { data, error } = await admin
        .from('admin_coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse({ coupons: data });
    }

    // ─── CREATE ────────────────────────────────────────────────────────────
    if (action === 'create') {
      const {
        code,                  // 'WELCOME50' — case-insensitive, alfanumerico
        name,                  // descrizione interna
        percent_off,           // 1-100, oppure
        amount_off_cents,      // > 0
        duration,              // 'once' | 'repeating' | 'forever'
        duration_in_months,    // se 'repeating'
        max_redemptions,       // null = unlimited
        expires_at_iso,        // null = no scadenza
      } = body;

      if (!code || !/^[A-Z0-9_-]{3,32}$/i.test(code)) {
        return jsonResponse({ error: 'Codice non valido (3-32 caratteri alfanumerici)' }, 400);
      }
      if ((percent_off == null) === (amount_off_cents == null)) {
        return jsonResponse({ error: 'Specifica percent_off OPPURE amount_off_cents' }, 400);
      }
      if (!['once','repeating','forever'].includes(duration)) {
        return jsonResponse({ error: 'Durata non valida' }, 400);
      }
      if (duration === 'repeating' && !duration_in_months) {
        return jsonResponse({ error: 'duration_in_months richiesto per repeating' }, 400);
      }

      // 1. Crea Coupon su Stripe (regola dello sconto)
      const couponParams: Stripe.CouponCreateParams = {
        name: name || code,
        duration,
        metadata: { created_by_user_id: user.id, source: 'moviq-admin' },
      };
      if (percent_off != null)      couponParams.percent_off       = percent_off;
      if (amount_off_cents != null) {
        couponParams.amount_off = amount_off_cents;
        couponParams.currency   = 'eur';
      }
      if (duration === 'repeating') couponParams.duration_in_months = duration_in_months;
      if (max_redemptions != null)  couponParams.max_redemptions    = max_redemptions;

      const coupon = await stripe.coupons.create(couponParams);

      // 2. Crea Promotion Code (il codice umano che l'utente digita al checkout)
      const promoParams: Stripe.PromotionCodeCreateParams = {
        coupon: coupon.id,
        code: code.toUpperCase(),
        max_redemptions: max_redemptions ?? undefined,
        expires_at: expires_at_iso ? Math.floor(new Date(expires_at_iso).getTime() / 1000) : undefined,
      };
      const promo = await stripe.promotionCodes.create(promoParams);

      // 3. Persisti su DB locale
      const { data: row, error } = await admin
        .from('admin_coupons')
        .insert({
          code: code.toUpperCase(),
          stripe_coupon_id: coupon.id,
          stripe_promotion_code_id: promo.id,
          name: name || null,
          percent_off: percent_off ?? null,
          amount_off_cents: amount_off_cents ?? null,
          duration,
          duration_in_months: duration_in_months ?? null,
          max_redemptions: max_redemptions ?? null,
          expires_at: expires_at_iso ?? null,
          active: true,
          created_by_user_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      return jsonResponse({ coupon: row });
    }

    // ─── DEACTIVATE ────────────────────────────────────────────────────────
    if (action === 'deactivate') {
      const id = body.id as string;
      if (!id) return jsonResponse({ error: 'id richiesto' }, 400);

      const { data: existing } = await admin
        .from('admin_coupons').select('*').eq('id', id).maybeSingle();
      if (!existing) return jsonResponse({ error: 'coupon non trovato' }, 404);

      // Disattiva il promotion code su Stripe (Stripe non permette delete su coupon usati)
      if (existing.stripe_promotion_code_id) {
        await stripe.promotionCodes.update(existing.stripe_promotion_code_id, { active: false });
      }

      const { data, error } = await admin
        .from('admin_coupons')
        .update({ active: false })
        .eq('id', id).select().single();
      if (error) throw error;

      return jsonResponse({ coupon: data });
    }

    // ─── SYNC (legge times_redeemed da Stripe per i coupon attivi) ─────────
    if (action === 'sync') {
      const { data: rows } = await admin
        .from('admin_coupons').select('id, stripe_promotion_code_id').eq('active', true);
      if (!rows) return jsonResponse({ updated: 0 });
      let updated = 0;
      for (const r of rows) {
        if (!r.stripe_promotion_code_id) continue;
        const pc = await stripe.promotionCodes.retrieve(r.stripe_promotion_code_id);
        await admin.from('admin_coupons')
          .update({ times_redeemed: pc.times_redeemed ?? 0 })
          .eq('id', r.id);
        updated++;
      }
      return jsonResponse({ updated });
    }

    return jsonResponse({ error: 'action sconosciuta' }, 400);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'unauthorized') return jsonResponse({ error: msg }, 401);
    if (msg === 'forbidden')    return jsonResponse({ error: msg }, 403);
    return internalError('admin-coupon', err);
  }
});
