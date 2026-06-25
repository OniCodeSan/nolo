import { supabase, hasSupabase } from '../lib/supabase.js';

// ─── Block A: lista completa utenti ────────────────────────────
export async function listAllUsers() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.rpc('admin_list_users');
  if (error) throw error;
  return data || [];
}

// ─── Block B: presence + sessioni ──────────────────────────────
export async function pingSession({
  sessionId, anonId, country, region, city, ip,
  utmSource, utmMedium, utmCampaign, utmTerm, utmContent, landingPath,
}) {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('ping_session', {
    p_session_id: sessionId,
    p_anon_id: anonId,
    p_ip: ip,
    p_country: country,
    p_region: region,
    p_city: city,
    p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 240) : null,
    p_referrer: typeof document !== 'undefined' ? document.referrer?.slice(0, 240) || null : null,
    p_utm_source:   utmSource   || null,
    p_utm_medium:   utmMedium   || null,
    p_utm_campaign: utmCampaign || null,
    p_utm_term:     utmTerm     || null,
    p_utm_content:  utmContent  || null,
    p_landing_path: landingPath || null,
  });
  if (error) {
    if (import.meta.env.DEV) console.warn('[pingSession]', error.message);
    return null;
  }
  return data;
}

export async function presenceLive() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('admin_presence_live');
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function sessionsOverview() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('admin_sessions_overview');
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// ─── Block C: search events ───────────────────────────────────
export async function trackEvent(kind, payload = {}) {
  if (!hasSupabase) return;
  const { error } = await supabase.rpc('track_event', {
    p_kind: kind,
    p_session_id: payload.sessionId || null,
    p_anon_id: payload.anonId || null,
    p_car_id: payload.carId || null,
    p_category: payload.category || null,
    p_location_q: payload.location || null,
    p_filter_brand: payload.brandId || null,
    p_filter_fuels: payload.fuels || null,
    p_filter_price_max: payload.priceMax ?? null,
  });
  if (error && import.meta.env.DEV) console.warn('[trackEvent]', error.message);
}

export async function searchOverview() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('admin_search_overview');
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function utmOverview() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('admin_utm_overview');
  if (error) throw error;
  return data || null;
}

// ─── Riassegnazione host/auto ─────────────────────────────────
export async function assignHostOwner(hostId, userEmail) {
  if (!hasSupabase) throw new Error('Supabase non configurato.');
  const { data, error } = await supabase.rpc('admin_assign_host_owner', {
    p_host_id: hostId, p_user_email: userEmail.trim().toLowerCase(),
  });
  if (error) throw error;
  return data;
}

export async function reassignCar(carId, newHostId) {
  if (!hasSupabase) throw new Error('Supabase non configurato.');
  const { data, error } = await supabase.rpc('admin_reassign_car', {
    p_car_id: carId, p_new_host_id: newHostId,
  });
  if (error) throw error;
  return data;
}

export async function listHostsBrief() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.rpc('admin_list_hosts_brief');
  if (error) throw error;
  return data || [];
}
