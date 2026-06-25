// CORS condiviso per le edge functions chiamate dal browser.
// L17: niente più wildcard `*` — l'origine è ristretta alla produzione MoviQ
// (così un sito terzo non può leggere le risposte cross-origin dal browser
// della vittima). www.moviq.it fa 301 all'apex, quindi il frontend gira
// sempre su https://moviq.it. Override possibile via env APP_ORIGIN.

const PRIMARY_ORIGIN = Deno.env.get('APP_ORIGIN') ?? 'https://moviq.it';

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': PRIMARY_ORIGIN,
  'Vary': 'Origin',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// L18: risposta d'errore 500 generica. Il dettaglio va SOLO nei log server,
// mai nel body (evita fingerprinting di schema DB / stato Stripe).
export function internalError(scope: string, err: unknown): Response {
  console.error(`[${scope}]`, err);
  return jsonResponse({ error: 'Errore interno. Riprova più tardi.' }, 500);
}
