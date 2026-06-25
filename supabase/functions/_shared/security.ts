// Helper di sicurezza condivisi per le edge functions.

const _enc = new TextEncoder();

// Confronto di stringhe a tempo costante (no timing oracle). Usa HMAC con
// chiave casuale così non si confrontano direttamente i byte e non si rivela
// nemmeno la lunghezza del segreto.
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const [ha, hb] = await Promise.all([
    crypto.subtle.sign('HMAC', k, _enc.encode(a)),
    crypto.subtle.sign('HMAC', k, _enc.encode(b)),
  ]);
  const da = new Uint8Array(ha);
  const db = new Uint8Array(hb);
  let r = 0;
  for (let i = 0; i < da.length; i++) r |= da[i] ^ db[i];
  return r === 0;
}
