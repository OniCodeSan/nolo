// Helper Stripe + Supabase service-role client condiviso fra le edge functions.

import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export function getStripe(): Stripe {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('STRIPE_SECRET_KEY non configurata');
  return new Stripe(key, {
    apiVersion: '2024-12-18.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

// Client Supabase con service_role: BYPASSA le RLS. Usalo SOLO dentro
// le edge functions, MAI esporne la chiave al frontend.
export function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Variabili SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY mancanti');
  return createClient(url, key, { auth: { persistSession: false } });
}

// Client Supabase legato alla sessione utente — per verificare auth lato server.
export function getUserClient(authHeader: string | null) {
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) throw new Error('Variabili SUPABASE_URL / SUPABASE_ANON_KEY mancanti');
  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
}

export const STRIPE_PRICE_ID = () =>
  Deno.env.get('STRIPE_PRICE_ID') ?? '';

export const APP_URL = () =>
  Deno.env.get('APP_URL') ?? 'https://moviq.it';

export const TRIAL_DAYS = 30;
