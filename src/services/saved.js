import { supabase, hasSupabase } from '../lib/supabase.js';

export async function listSavedCarIds(userId) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('saved_cars')
    .select('car_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(r => r.car_id);
}

export async function addSavedCar(userId, carId) {
  if (!hasSupabase) return;
  await supabase.from('saved_cars').insert({ user_id: userId, car_id: carId });
}

export async function removeSavedCar(userId, carId) {
  if (!hasSupabase) return;
  await supabase.from('saved_cars').delete().eq('user_id', userId).eq('car_id', carId);
}
