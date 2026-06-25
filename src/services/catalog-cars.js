import { supabase, hasSupabase } from '../lib/supabase.js';

let brandsCache = null;
let brandsPromise = null;

export async function listBrands() {
  if (!hasSupabase) return [];
  if (brandsCache) return brandsCache;
  if (brandsPromise) return brandsPromise;
  brandsPromise = supabase
    .from('car_brands')
    .select('*')
    .order('popular', { ascending: false })
    .order('name', { ascending: true })
    .then(({ data, error }) => {
      brandsPromise = null;
      if (error) throw error;
      brandsCache = data || [];
      return brandsCache;
    });
  return brandsPromise;
}

export function clearBrandsCache() {
  brandsCache = null;
  brandsPromise = null;
}

const modelsByBrand = new Map();

export async function listModels(brandId) {
  if (!hasSupabase || !brandId) return [];
  if (modelsByBrand.has(brandId)) return modelsByBrand.get(brandId);
  const { data, error } = await supabase
    .from('car_models')
    .select('*')
    .eq('brand_id', brandId)
    .order('popular', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  modelsByBrand.set(brandId, data || []);
  return data || [];
}

export async function getBrand(brandId) {
  if (!hasSupabase || !brandId) return null;
  const all = await listBrands();
  return all.find(b => b.id === brandId) || null;
}

export async function getModel(modelId) {
  if (!hasSupabase || !modelId) return null;
  const { data } = await supabase.from('car_models').select('*').eq('id', modelId).maybeSingle();
  return data || null;
}
