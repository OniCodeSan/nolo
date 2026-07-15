import { supabase, hasSupabase } from '../lib/supabase.js';

export const REPORT_REASONS = [
  { id: 'fake_listing',         l: 'Annuncio falso / inesistente' },
  { id: 'misleading_info',      l: 'Informazioni fuorvianti' },
  { id: 'no_show',              l: 'Mancata consegna del veicolo' },
  { id: 'damaged_vehicle',      l: 'Veicolo danneggiato / non sicuro' },
  { id: 'rude_behavior',        l: 'Comportamento scorretto' },
  { id: 'scam',                 l: 'Tentativo di truffa' },
  { id: 'inappropriate_content', l: 'Contenuto inappropriato' },
  { id: 'other',                l: 'Altro' },
];

export async function submitReport({ targetType, targetId, reason, details }) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Devi accedere per segnalare');
  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: String(targetId),
    reason,
    details: details?.trim() || null,
  });
  if (error) throw error;
}

export async function listMyReports() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('reports').select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── Admin ───────────────────────────────────────────────────────────────

export async function isAdmin(userId) {
  if (!hasSupabase || !userId) return false;
  const { data, error } = await supabase
    .from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  if (error) return false;
  return !!data?.is_admin;
}

export async function adminKpi() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('admin_kpi');
  if (error) throw error;
  return data;
}

export async function adminKpiExtended() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('admin_kpi_extended');
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function adminListReports({ status } = {}) {
  if (!hasSupabase) return [];
  let q = supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function adminSetReportStatus(id, status, notes) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { error } = await supabase.rpc('admin_set_report_status', {
    p_report_id: id, p_status: status, p_notes: notes ?? null,
  });
  if (error) throw error;
}

export async function adminSetHostStatus(hostId, status, notes) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { error } = await supabase.rpc('admin_set_host_status', {
    p_host_id: hostId, p_status: status, p_notes: notes ?? null,
  });
  if (error) throw error;
}

// Invia una comunicazione email all'host (sospensione / riattivazione / 60gg).
// Applica anche l'effetto collegato (status, countdown) lato server.
export async function adminSendHostEmail(hostId, template, reason = null) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('admin_send_host_email', {
    p_host_id: hostId, p_template: template, p_reason: reason ?? null,
  });
  if (error) throw error;
  return data;
}

export async function adminSetHostFeatured(hostId, featured) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { error } = await supabase.rpc('admin_set_host_featured', {
    p_host_id: hostId, p_featured: featured,
  });
  if (error) throw error;
}

export async function adminRejectCar(carId, notes) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { error } = await supabase.rpc('admin_reject_car', {
    p_car_id: carId, p_notes: notes,
  });
  if (error) throw error;
}

export async function adminListHosts({ status } = {}) {
  if (!hasSupabase) return [];
  let q = supabase.from('hosts').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function adminListCars({ status } = {}) {
  if (!hasSupabase) return [];
  let q = supabase.from('cars').select('*, hosts!inner(id, name, status)').order('updated_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}
