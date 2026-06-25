import { supabase, hasSupabase } from '../lib/supabase.js';

export async function logCarView(carId, source = 'direct') {
  if (!hasSupabase || !carId) return;
  try {
    await supabase.rpc('log_car_view', { p_car_id: carId, p_source: source });
  } catch {}  // fire and forget
}

export async function getHostStats(hostId) {
  if (!hasSupabase || !hostId) return null;
  const { data, error } = await supabase.rpc('host_stats', { p_host_id: hostId });
  if (error) throw error;
  return data;
}

export async function getMarketStats() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('market_stats');
  if (error) throw error;
  return data;
}
