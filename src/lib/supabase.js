import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && key);

export const supabase = hasSupabase
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (typeof window !== 'undefined' && !hasSupabase) {
  // eslint-disable-next-line no-console
  console.info('[MoviQ] Supabase non configurato — uso dati statici. Copia .env.example in .env e incolla le credenziali.');
}
