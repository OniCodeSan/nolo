// Client-side service per la pagina /admin/coupon.
// Chiama l'Edge Function admin-coupon (verifica lato server che l'utente sia admin).

import { supabase, hasSupabase } from '../lib/supabase.js';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

async function call(action, payload = {}) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Devi accedere');

  const res = await fetch(`${FUNCTIONS_URL}/admin-coupon`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Errore ${res.status}`);
  return data;
}

export const listCoupons       = ()       => call('list').then(d => d.coupons || []);
export const createCoupon      = (body)   => call('create', body).then(d => d.coupon);
export const deactivateCoupon  = (id)     => call('deactivate', { id }).then(d => d.coupon);
export const syncCoupons       = ()       => call('sync').then(d => d.updated);
