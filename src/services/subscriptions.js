// Client-side helpers per la gestione subscription dei noleggiatori.
// Chiama le Edge Functions Supabase (create-checkout, billing-portal) e
// legge da host_subscription_status (view RLS-gated).

import { supabase, hasSupabase } from '../lib/supabase.js';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

async function callFunction(name, payload) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Devi accedere');

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Errore ${res.status}`);
  return data;
}

export async function getSubscriptionStatus(hostId) {
  if (!hasSupabase || !hostId) return null;
  const { data, error } = await supabase
    .from('host_subscription_status')
    .select('*')
    .eq('host_id', hostId)
    .maybeSingle();
  if (error) {
    console.warn('[subscriptions]', error.message);
    return null;
  }
  return data;
}

export async function startCheckout(hostId) {
  const { url } = await callFunction('create-checkout', { host_id: hostId });
  if (!url) throw new Error('URL checkout non disponibile');
  window.location.href = url;
}

export async function openBillingPortal(hostId) {
  const { url } = await callFunction('billing-portal', { host_id: hostId });
  if (!url) throw new Error('URL portale non disponibile');
  window.location.href = url;
}

export function statusLabel(status) {
  switch (status) {
    case 'trialing':            return { label: 'Periodo di prova', tone: 'info' };
    case 'active':              return { label: 'Attivo',           tone: 'ok' };
    case 'past_due':            return { label: 'Pagamento fallito',tone: 'warn' };
    case 'unpaid':              return { label: 'Sospeso',          tone: 'err' };
    case 'canceled':            return { label: 'Disattivato',      tone: 'muted' };
    case 'incomplete':          return { label: 'Da completare',    tone: 'warn' };
    case 'incomplete_expired':  return { label: 'Scaduto',          tone: 'muted' };
    case 'paused':              return { label: 'In pausa',         tone: 'muted' };
    default:                    return { label: 'Non attivo',       tone: 'muted' };
  }
}
