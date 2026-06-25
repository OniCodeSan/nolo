import { supabase, hasSupabase } from '../lib/supabase.js';

function dateKey(d) {
  // d: { d, m, y? } → ISO yyyy-mm-dd
  if (!d) return null;
  const year = d.y || new Date().getFullYear();
  const mm = String(d.m + 1).padStart(2, '0');
  const dd = String(d.d).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export async function createBooking(userId, booking) {
  if (!hasSupabase) throw new Error('Supabase non configurato.');
  const { car, from, to, message } = booking;
  // RPC SECURITY DEFINER `create_booking`: ricalcola prezzo/giorni/subtotale/
  // totale SERVER-SIDE dal car_id (anti price-tampering, H5), valida le date e
  // blocca la prenotazione della propria auto (L8). L'INSERT diretto su
  // `bookings` è revocato dalla migration di hardening, quindi importi e stato
  // non sono più falsificabili dal client (H4/H5).
  const { data, error } = await supabase.rpc('create_booking', {
    p_car_id: car.id,
    p_date_from: dateKey(from),
    p_date_to: dateKey(to),
    p_message: message?.trim() || null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function listMyBookings(userId) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBooking(userId, bookingId) {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .eq('id', bookingId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function cancelBooking(userId, bookingId) {
  if (!hasSupabase) return;
  // RPC `cancel_booking`: annulla solo la propria prenotazione in stato
  // annullabile (l'UPDATE diretto su bookings è revocato dalla migration, H4).
  const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId });
  if (error) throw error;
}

// ============ HOST SIDE ============

export async function listHostRequests(hostId, { status } = {}) {
  if (!hasSupabase || !hostId) return [];
  // Tutte le bookings le cui car appartengono al mio host
  let q = supabase
    .from('bookings')
    .select('*, cars!inner(id, brand, model, year, variant, tone, host_id)')
    .eq('cars.host_id', hostId)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function countHostPending(hostId) {
  if (!hasSupabase || !hostId) return 0;
  const { count, error } = await supabase
    .from('bookings')
    .select('id, cars!inner(host_id)', { count: 'exact', head: true })
    .eq('cars.host_id', hostId)
    .eq('status', 'requested');
  if (error) return 0;
  return count || 0;
}

export async function acceptHostBooking(bookingId, message) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('accept_booking', {
    p_booking_id: bookingId,
    p_message: message?.trim() || null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function declineHostBooking(bookingId, reason) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('decline_booking', {
    p_booking_id: bookingId,
    p_reason: reason?.trim() || null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function completeHostBooking(bookingId, notes) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('complete_booking', {
    p_booking_id: bookingId,
    p_notes: notes?.trim() || null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// Lista prenotazioni confermate/completate per host (escludendo requested/declined/cancelled).
export async function listHostBookings(hostId) {
  if (!hasSupabase || !hostId) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars!inner(id, brand, model, year, variant, tone, host_id, pickup_location, city)')
    .eq('cars.host_id', hostId)
    .in('status', ['confirmed', 'completed'])
    .order('date_from', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Profili clienti collegati a una lista di user_id (l'host le legge via RLS profiles).
export async function getProfilesByIds(userIds) {
  if (!hasSupabase || !userIds?.length) return {};
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, city, avatar_url')
    .in('id', userIds);
  if (error) return {};
  const out = {};
  (data || []).forEach(p => { out[p.id] = p; });
  return out;
}
