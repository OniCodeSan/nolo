// Cleanup script: drena image_cleanup_queue cancellando i public_id da Cloudinary
// via Admin API. Eseguito periodicamente (GitHub Actions cron hourly).
//
// Env richiesti:
//   SUPABASE_URL                  — URL del progetto Supabase
//   SUPABASE_SERVICE_ROLE_KEY     — service role JWT (mai client-side!)
//   CLOUDINARY_CLOUD_NAME         — es. "moviq"
//   CLOUDINARY_API_KEY            — Admin API key (Settings → Security)
//   CLOUDINARY_API_SECRET         — Admin API secret
//
// Strategia:
//   - Legge batch di 100 righe pending non in errore
//   - Cloudinary Admin API DELETE accetta fino a 100 public_ids per chiamata
//   - Marca processed=true al successo, incrementa attempts + last_error al fallimento
//   - Dopo 3 attempts una riga finisce in "errors" e va ispezionata manualmente
//
// Idempotenza: cancellare lo stesso public_id 2 volte ritorna { result: 'not_found' }
//              e lo trattiamo come successo (la risorsa già non c'è più).

import { createClient } from '@supabase/supabase-js';

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 3;

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[cleanup] missing env ${k}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const basic = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64');

async function fetchPending() {
  const { data, error } = await supabase
    .from('image_cleanup_queue')
    .select('id, public_id, attempts')
    .eq('processed', false)
    .lt('attempts', MAX_ATTEMPTS)
    .order('enqueued_at', { ascending: true })
    .limit(BATCH_SIZE);
  if (error) throw error;
  return data || [];
}

async function deleteFromCloudinary(publicIds) {
  // Cloudinary Admin API: DELETE /resources/image/upload?public_ids[]=...
  // ritorna { deleted: { id1: 'deleted'|'not_found', ... }, partial: bool }
  const params = new URLSearchParams();
  publicIds.forEach(pid => params.append('public_ids[]', pid));
  const url = `https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload?${params}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Cloudinary ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

async function markProcessed(ids) {
  const { error } = await supabase
    .from('image_cleanup_queue')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw error;
}

async function markFailed(rows, message) {
  for (const row of rows) {
    await supabase
      .from('image_cleanup_queue')
      .update({
        attempts: (row.attempts || 0) + 1,
        last_error: message.slice(0, 500),
      })
      .eq('id', row.id);
  }
}

async function main() {
  const startedAt = Date.now();
  const pending = await fetchPending();
  if (pending.length === 0) {
    console.log('[cleanup] queue vuota, nothing to do');
    return;
  }

  console.log(`[cleanup] processing ${pending.length} pending images`);
  const publicIds = pending.map(r => r.public_id);

  let result;
  try {
    result = await deleteFromCloudinary(publicIds);
  } catch (e) {
    console.error('[cleanup] Cloudinary call failed:', e.message);
    await markFailed(pending, e.message);
    process.exit(1);
  }

  const deletedMap = result.deleted || {};
  const succeededIds = [];
  const failedRows = [];

  for (const row of pending) {
    const status = deletedMap[row.public_id];
    // 'deleted' = ok / 'not_found' = già cancellato (ok) / null = partial fail
    if (status === 'deleted' || status === 'not_found') {
      succeededIds.push(row.id);
    } else {
      failedRows.push(row);
    }
  }

  if (succeededIds.length > 0) {
    await markProcessed(succeededIds);
  }
  if (failedRows.length > 0) {
    await markFailed(failedRows, 'cloudinary partial fail');
  }

  const elapsed = Date.now() - startedAt;
  console.log(`[cleanup] done in ${elapsed}ms — processed: ${succeededIds.length}, failed: ${failedRows.length}`);
}

main().catch(e => {
  console.error('[cleanup] fatal:', e);
  process.exit(1);
});
