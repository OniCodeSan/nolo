// Service KYC noleggiatori.
// Upload documento + update campi anagrafici/fiscali + invio per review.

import { supabase, hasSupabase } from '../lib/supabase.js';
import { mapHost } from './cars.js';

const BUCKET = 'host-documents';

export async function uploadIdDocument(hostId, file) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  if (!file) throw new Error('Nessun file selezionato');
  if (file.size > 8 * 1024 * 1024) throw new Error('File troppo grande (max 8 MB)');
  const allowed = ['image/jpeg','image/png','image/heic','image/heif','application/pdf'];
  if (!allowed.includes(file.type)) throw new Error('Formato non supportato (JPG, PNG, HEIC, PDF)');

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${hostId}/id-document-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function updateHostKYC(hostId, fields) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase
    .from('hosts')
    .update(fields)
    .eq('id', hostId)
    .select()
    .single();
  if (error) throw error;
  return mapHost(data);
}

export async function submitKYC(hostId) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('submit_kyc', { p_host_id: hostId });
  if (error) throw error;
  return mapHost(data);
}

export async function adminReviewKYC(hostId, action, reason = null) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('admin_review_kyc', {
    p_host_id: hostId, p_action: action, p_reason: reason,
  });
  if (error) throw error;
  return mapHost(data);
}

export async function getSignedDocumentUrl(path, expiresIn = 300) {
  if (!hasSupabase || !path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) { console.warn('[kyc]', error.message); return null; }
  return data.signedUrl;
}

// ATECO compatibili col noleggio veicoli senza conducente
export const ATECO_OPTIONS = [
  { code: '77.11.00', label: '77.11.00 — Noleggio autovetture e autoveicoli leggeri' },
  { code: '77.12.00', label: '77.12.00 — Noleggio autocarri e veicoli pesanti' },
  { code: '77.39.94', label: '77.39.94 — Noleggio di altri mezzi di trasporto terrestre' },
  { code: '45.11.01', label: '45.11.01 — Commercio autoveicoli (con attività noleggio collegata)' },
];

export const PROVINCE_IT = [
  'AG','AL','AN','AO','AR','AP','AT','AV','BA','BT','BL','BN','BG','BI','BO','BZ','BS','BR','CA','CL','CB','CE','CT','CZ','CH','CO','CS','CR','KR','CN','EN','FM','FE','FI','FG','FC','FR','GE','GO','GR','IM','IS','SP','AQ','LT','LE','LC','LI','LO','LU','MC','MN','MS','MT','VS','ME','MI','MO','MB','NA','NO','NU','OG','OR','PA','PR','PV','PG','PU','PE','PC','PI','PT','PN','PZ','PO','RG','RA','RC','RE','RI','RN','RM','RO','SA','SS','SV','SI','SR','SO','SU','TA','TE','TR','TO','TP','TN','TV','TS','UD','VA','VE','VB','VC','VR','VV','VI','VT'
];
