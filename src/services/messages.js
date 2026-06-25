import { supabase, hasSupabase } from '../lib/supabase.js';

// Tutte le mie conversazioni: prendo i miei messaggi raggruppati per booking_id,
// con last message + count unread.
export async function listMyConversations() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('id, booking_id, sender_id, recipient_id, body, read_at, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const byBooking = new Map();
  for (const m of data || []) {
    if (!byBooking.has(m.booking_id)) {
      byBooking.set(m.booking_id, { booking_id: m.booking_id, last: m, unread: 0, messages_count: 0 });
    }
    const c = byBooking.get(m.booking_id);
    c.messages_count++;
    if (m.recipient_id && !m.read_at) c.unread++;
  }
  return [...byBooking.values()];
}

export async function listThreadMessages(bookingId) {
  if (!hasSupabase || !bookingId) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(bookingId, recipientId, body) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase
    .from('messages')
    .insert({
      booking_id: bookingId,
      sender_id: (await supabase.auth.getUser()).data.user.id,
      recipient_id: recipientId,
      body,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markThreadRead(bookingId) {
  if (!hasSupabase || !bookingId) return 0;
  const { data } = await supabase.rpc('mark_thread_read', { p_booking_id: bookingId });
  return data || 0;
}

export async function countUnreadMessages() {
  if (!hasSupabase) return 0;
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return 0;
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .is('read_at', null);
  return count || 0;
}
