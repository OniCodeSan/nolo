// Client-side service per il modulo AI admin (/admin/ai).
// Chiama l'Edge Function admin-ai (verifica lato server che l'utente sia admin).
// Le chiavi API NON transitano mai in risposta: restano nel Vault server-side.

import { supabase, hasSupabase } from '../lib/supabase.js';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

async function call(action, payload = {}) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Devi accedere');

  const res = await fetch(`${FUNCTIONS_URL}/admin-ai`, {
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

// { keys: {NAME: bool}, config: {...}, models: [...] }
export const aiStatus      = ()                 => call('status');
export const aiSetKey      = (name, value)      => call('set_key', { name, value });
export const aiDeleteKey   = (name)             => call('delete_key', { name });
export const aiTestKey     = (name)             => call('test_key', { name });
export const aiSetConfig   = (key, value)       => call('set_config', { key, value });
export const aiGenerateArticle = (opts)         => call('generate_article', opts).then(d => d.article);
// Ritorna { b64, model }: immagine PNG base64 da caricare su Cloudinary lato client.
export const aiGenerateImage   = (opts)         => call('generate_image', opts);

export const AI_KEYS = [
  { name: 'ANTHROPIC_API_KEY',     label: 'Anthropic (Claude) — articoli', hint: 'sk-ant-…', testable: true,  required: true },
  { name: 'OPENAI_API_KEY',        label: 'OpenAI — immagini copertina', hint: 'sk-…', testable: true,  required: false },
  { name: 'CAR_IMAGE_API_KEY',     label: 'Immagini auto (Fase 3)', hint: 'chiave provider immagini', testable: false, required: false },
  { name: 'CLOUDINARY_API_KEY',    label: 'Cloudinary API key (Fase 3)', hint: 'numero', testable: false, required: false },
  { name: 'CLOUDINARY_API_SECRET', label: 'Cloudinary API secret (Fase 3)', hint: '••••', testable: false, required: false },
];
