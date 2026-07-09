import { supabase, hasSupabase } from '../lib/supabase.js';
import { CARS as STATIC_CARS, HOSTS as STATIC_HOSTS } from '../data/proto-data.js';

function rowToCar(row) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    name: row.name,
    category: row.category,
    fuel: row.fuel,
    transmission: row.transmission,
    seats: row.seats,
    doors: row.doors,
    engine: row.engine,
    km: row.km,
    range: row.range_km,
    pricePerDay: row.price_per_day,
    pricePerWeek: row.price_per_week ?? null,
    pricePerMonth: row.price_per_month,
    deposit: row.deposit ?? 200,
    host: row.host_id,
    city: row.city,
    distance: row.distance,
    coords: row.coords,
    hot: row.hot,
    variant: row.variant,
    tone: row.tone,
    accentTone: row.accent_tone,
    accessories: row.accessories || [],
    description: row.description,
    status: row.status ?? 'active',
    licensePlate: row.license_plate ?? null,
    powerHp: row.power_hp ?? null,
    drivetrain: row.drivetrain ?? null,
    photos: row.photos ?? [],
    images: Array.isArray(row.images) ? row.images : [],
    pickupLocation: row.pickup_location ?? null,
    internalNotes: row.internal_notes ?? null,
    brandId: row.brand_id ?? null,
    modelId: row.model_id ?? null,
  };
}

function carToRow(car, hostId) {
  const row = {};
  if (car.brand !== undefined) row.brand = car.brand;
  if (car.model !== undefined) row.model = car.model;
  if (car.year !== undefined) row.year = car.year ? Number(car.year) : null;
  if (car.name !== undefined) row.name = car.name;
  if (car.category !== undefined) row.category = car.category;
  if (car.fuel !== undefined) row.fuel = car.fuel;
  if (car.transmission !== undefined) row.transmission = car.transmission;
  if (car.seats !== undefined) row.seats = car.seats ? Number(car.seats) : null;
  if (car.doors !== undefined) row.doors = car.doors ? Number(car.doors) : null;
  if (car.engine !== undefined) row.engine = car.engine;
  if (car.km !== undefined) row.km = car.km;
  if (car.range !== undefined) row.range_km = car.range;
  if (car.pricePerDay !== undefined) row.price_per_day = car.pricePerDay ? Number(car.pricePerDay) : null;
  if (car.pricePerWeek !== undefined) row.price_per_week = car.pricePerWeek ? Number(car.pricePerWeek) : null;
  if (car.pricePerMonth !== undefined) row.price_per_month = car.pricePerMonth ? Number(car.pricePerMonth) : null;
  // Cauzione: 0 è un valore valido ("nessuna cauzione"). Campo vuoto/non valido → 0.
  if (car.deposit !== undefined) {
    const d = Number(car.deposit);
    row.deposit = Number.isFinite(d) && d >= 0 ? Math.round(d) : 0;
  }
  if (car.city !== undefined) row.city = car.city;
  if (car.coords !== undefined) row.coords = car.coords;
  if (car.distance !== undefined) row.distance = car.distance;
  if (car.variant !== undefined) row.variant = car.variant;
  if (car.tone !== undefined) row.tone = car.tone;
  if (car.accentTone !== undefined) row.accent_tone = car.accentTone;
  if (car.accessories !== undefined) row.accessories = car.accessories;
  if (car.description !== undefined) row.description = car.description;
  if (car.status !== undefined) row.status = car.status;
  if (car.licensePlate !== undefined) row.license_plate = car.licensePlate;
  if (car.powerHp !== undefined) row.power_hp = car.powerHp ? Number(car.powerHp) : null;
  if (car.drivetrain !== undefined) row.drivetrain = car.drivetrain;
  if (car.photos !== undefined) row.photos = car.photos;
  if (car.images !== undefined) row.images = car.images;
  if (car.pickupLocation !== undefined) row.pickup_location = car.pickupLocation;
  if (car.internalNotes !== undefined) row.internal_notes = car.internalNotes;
  if (car.brandId !== undefined) row.brand_id = car.brandId;
  if (car.modelId !== undefined) row.model_id = car.modelId;
  if (hostId) row.host_id = hostId;
  row.updated_at = new Date().toISOString();
  return row;
}

// Marketplace pubblico: legge dalla view cars_public che esclude
// internal_notes/license_plate/moderation_notes ed è già filtrata su status=active.
export async function listCars() {
  if (!hasSupabase) return STATIC_CARS;
  const { data, error } = await supabase.from('cars_public').select('*').order('id');
  if (error) throw error;
  return data.map(rowToCar);
}

export async function getCar(id) {
  if (!hasSupabase) return STATIC_CARS.find(c => c.id === id) || null;
  const { data, error } = await supabase.from('cars_public').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToCar(data) : null;
}

// Host backoffice: legge la tabella `cars` diretta (RLS owner-only) per accedere
// a license_plate/internal_notes/moderation_notes. Usato da HostVehicleForm in edit.
export async function getCarOwner(id) {
  if (!hasSupabase) return STATIC_CARS.find(c => c.id === id) || null;
  const { data, error } = await supabase.from('cars').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToCar(data) : null;
}

export async function getHostsByIds(ids) {
  if (!ids.length) return {};
  if (!hasSupabase) {
    const out = {};
    ids.forEach(id => { if (STATIC_HOSTS[id]) out[id] = STATIC_HOSTS[id]; });
    return out;
  }
  // hosts_public esclude bank_iban/bank_bic/bank_holder/moderation_notes
  const { data, error } = await supabase.from('hosts_public').select('*').in('id', ids);
  if (error) throw error;
  const out = {};
  data.forEach(h => { out[h.id] = mapHost(h); });
  return out;
}

export function mapHost(h) {
  return {
    id: h.id, n: h.name, city: h.city, rating: h.rating,
    reviews: h.reviews_count, since: h.since, responseTime: h.response_time,
    verified: h.verified || h.status === 'verified',
    status: h.status ?? (h.verified ? 'verified' : 'pending'),
    featured: !!h.featured,
    moderationNotes: h.moderation_notes ?? null,
    ownerUserId: h.owner_user_id ?? null,
    terms: h.terms ?? null,
    paymentCards: h.payment_cards ?? [],
    paymentDebit: !!h.payment_debit,
    paymentCash: !!h.payment_cash,
    paymentCashLimitEur: h.payment_cash_limit_eur ?? 5000,
    paymentBankTransfer: !!h.payment_bank_transfer,
    bankIban: h.bank_iban ?? null,
    bankBic: h.bank_bic ?? null,
    bankHolder: h.bank_holder ?? null,
    logoUrl: h.logo_url ?? null,
    description: h.description ?? null,
    businessEmail: h.business_email ?? null,
    businessPhone: h.business_phone ?? null,
    vatNumber: h.vat_number ?? null,
    // KYC / dati legali — HostKYC li legge in snake_case. Su hosts_public queste
    // colonne non esistono (→ null): nessun leak, solo passthrough per il backoffice.
    kyc_status: h.kyc_status ?? null,
    kyc_submitted_at: h.kyc_submitted_at ?? null,
    kyc_reviewed_at: h.kyc_reviewed_at ?? null,
    kyc_rejection_reason: h.kyc_rejection_reason ?? null,
    legal_name: h.legal_name ?? null,
    vat_number: h.vat_number ?? null,
    ateco_code: h.ateco_code ?? null,
    fiscal_code: h.fiscal_code ?? null,
    rea_number: h.rea_number ?? null,
    legal_country: h.legal_country ?? null,
    legal_address: h.legal_address ?? null,
    legal_city: h.legal_city ?? null,
    legal_zip: h.legal_zip ?? null,
    legal_province: h.legal_province ?? null,
    representative_name: h.representative_name ?? null,
    id_document_type: h.id_document_type ?? null,
    id_document_number: h.id_document_number ?? null,
    id_document_expires: h.id_document_expires ?? null,
    id_document_path: h.id_document_path ?? null,
    insurance_declared: !!h.insurance_declared,
    insurance_company: h.insurance_company ?? null,
    insurance_policy_number: h.insurance_policy_number ?? null,
    insurance_expires_at: h.insurance_expires_at ?? null,
  };
}

// Pubblico: dettaglio host visto dal cliente. Niente IBAN.
export async function getHost(id) {
  if (!hasSupabase) return STATIC_HOSTS[id] || null;
  const { data, error } = await supabase.from('hosts_public').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapHost(data);
}

// Owner: il proprio profilo host (RLS owner-only sulla tabella base) → include IBAN.
export async function getMyHost(userId) {
  if (!hasSupabase || !userId) return null;
  const { data, error } = await supabase.from('hosts').select('*').eq('owner_user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? mapHost(data) : null;
}

export async function updateHost(hostId, patch) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const dbPatch = {};
  if ('name' in patch) dbPatch.name = patch.name;
  if ('city' in patch) dbPatch.city = patch.city;
  if ('description' in patch) dbPatch.description = patch.description;
  if ('businessEmail' in patch) dbPatch.business_email = patch.businessEmail;
  if ('businessPhone' in patch) dbPatch.business_phone = patch.businessPhone;
  if ('vatNumber' in patch) dbPatch.vat_number = patch.vatNumber;
  if ('terms' in patch) dbPatch.terms = patch.terms;
  if ('paymentCards' in patch) dbPatch.payment_cards = patch.paymentCards;
  if ('paymentDebit' in patch) dbPatch.payment_debit = patch.paymentDebit;
  if ('paymentCash' in patch) dbPatch.payment_cash = patch.paymentCash;
  if ('paymentBankTransfer' in patch) dbPatch.payment_bank_transfer = patch.paymentBankTransfer;
  if ('bankIban' in patch) dbPatch.bank_iban = patch.bankIban;
  if ('bankBic' in patch) dbPatch.bank_bic = patch.bankBic;
  if ('bankHolder' in patch) dbPatch.bank_holder = patch.bankHolder;
  dbPatch.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('hosts').update(dbPatch).eq('id', hostId).select().maybeSingle();
  if (error) throw error;
  return data ? mapHost(data) : null;
}

export async function claimHost(hostId) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('claim_host', { p_host_id: hostId });
  if (error) throw error;
  return data ? mapHost(Array.isArray(data) ? data[0] : data) : null;
}

export async function listCarsByHost(hostId) {
  if (!hasSupabase) return STATIC_CARS.filter(c => c.host === hostId);
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('host_id', hostId)
    .order('updated_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data.map(rowToCar);
}

export async function createCar(hostId, car) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  // Genera ID via RPC
  const { data: idData, error: idErr } = await supabase.rpc('generate_car_id', {
    p_host_id: hostId, p_brand: car.brand || 'car', p_model: car.model || ''
  });
  if (idErr) throw idErr;
  const row = { id: idData, ...carToRow(car, hostId), created_at: new Date().toISOString() };
  if (!row.status) row.status = 'draft';
  if (!row.name && row.brand && row.model) row.name = `${row.brand} ${row.model}${row.year ? ' · ' + row.year : ''}`;
  const { data, error } = await supabase.from('cars').insert(row).select().maybeSingle();
  if (error) throw error;
  return data ? rowToCar(data) : null;
}

export async function updateCar(carId, patch) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const row = carToRow(patch);
  const { data, error } = await supabase.from('cars').update(row).eq('id', carId).select().maybeSingle();
  if (error) throw error;
  return data ? rowToCar(data) : null;
}

export async function deleteCar(carId) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { error } = await supabase.from('cars').delete().eq('id', carId);
  if (error) throw error;
}

export async function createHostForUser(userId, opts = {}) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const slug = (opts.name || 'host').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) + '-' + userId.slice(0, 8);
  const { data, error } = await supabase.from('hosts').insert({
    id: slug,
    name: opts.name || 'Nuovo noleggiatore',
    city: opts.city || 'Milano',
    rating: 0,
    reviews_count: 0,
    since: new Date().toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
    response_time: '~24h',
    verified: false,
    owner_user_id: userId,
  }).select().maybeSingle();
  if (error) throw error;
  return data ? mapHost(data) : null;
}
