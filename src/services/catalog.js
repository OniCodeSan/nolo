import { supabase, hasSupabase } from '../lib/supabase.js';
import {
  CATEGORIES as STATIC_CATEGORIES,
  LOCATIONS as STATIC_LOCATIONS,
  RECENT_LOCATIONS as STATIC_RECENT,
  NEAREST_HOSTS as STATIC_NEAREST,
  REVIEWS as STATIC_REVIEWS,
} from '../data/proto-data.js';

export async function listCategories() {
  if (!hasSupabase) return STATIC_CATEGORIES;
  const { data, error } = await supabase.from('categories').select('*').order('id');
  if (error) throw error;
  return data.map(c => ({ id: c.id, l: c.label, tone: c.tone, fromPrice: c.from_price }));
}

export async function listLocations() {
  if (!hasSupabase) return STATIC_LOCATIONS;
  const { data, error } = await supabase.from('locations').select('*');
  if (error) throw error;
  return data.map(l => ({ id: l.id, l: l.label, sub: l.sub, icon: l.icon }));
}

export async function listRecentLocations() {
  // intentionally static — sarà personalizzato per utente quando avremo auth
  return STATIC_RECENT;
}

export async function listNearestHosts() {
  if (!hasSupabase) return STATIC_NEAREST;
  const { data, error } = await supabase.from('nearest_hosts').select('*');
  if (error) throw error;
  return data.map(n => ({ host: n.host_id, distance: n.distance, cars: n.cars_count }));
}

export async function listReviews(limit = 10) {
  if (!hasSupabase) return STATIC_REVIEWS;
  const { data, error } = await supabase.from('reviews').select('*').limit(limit);
  if (error) throw error;
  return data.map(r => ({
    n: r.reviewer_name, avatar: r.avatar, date: r.date_label, stars: r.stars, text: r.body,
  }));
}
