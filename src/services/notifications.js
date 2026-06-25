import { supabase, hasSupabase } from '../lib/supabase.js';

export async function listMyNotifications({ limit = 50 } = {}) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function countUnreadNotifications() {
  if (!hasSupabase) return 0;
  const { data, error } = await supabase.rpc('count_unread_notifications');
  if (error) return 0;
  return data || 0;
}

export async function markAllNotificationsRead() {
  if (!hasSupabase) return 0;
  const { data, error } = await supabase.rpc('mark_all_notifications_read');
  if (error) throw error;
  return data || 0;
}

export async function markOneRead(id) {
  if (!hasSupabase) return;
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
}
