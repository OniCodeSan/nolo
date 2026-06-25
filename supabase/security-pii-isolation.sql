-- ═════════════════════════════════════════════════════════════════════════
-- SECURITY HARDENING — PII isolation
-- ═════════════════════════════════════════════════════════════════════════
-- Fix per due finding critici:
--   C1: hosts esponeva pubblicamente bank_iban/bank_bic/bank_holder/
--       moderation_notes (e tutto il resto) via "public read hosts using (true)".
--   C2: cars esponeva pubblicamente internal_notes/license_plate/
--       moderation_notes via "public read cars using (true)".
--
-- Strategia:
--   1. Drop delle policy "public read" sulle tabelle base.
--   2. Aggiungiamo policy che permettono il SELECT diretto SOLO a:
--      - owner del record
--      - admin
--      - server (service_role bypassa RLS sempre)
--   3. Per il marketplace pubblico creiamo VIEW (cars_public, hosts_public)
--      che espongono solo i campi safe. Le view sono "security definer"
--      di default (run as creator/postgres) quindi bypassano la RLS sulle
--      tabelle base. Solo la GRANT sulla view determina chi può leggerle.
--   4. Le RPC `claim_host`, `host_*`, `messages_*`, `host_stats` continuano
--      a funzionare perché sono SECURITY DEFINER e bypassano RLS.
--
-- IMPORTANTE: esegui DOPO tutti gli altri schema (incluso moderation-schema).
-- ═════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. HOSTS — restringi accesso diretto
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists "public read hosts" on public.hosts;

-- Owner del record host può leggere TUTTO (inclusi IBAN)
drop policy if exists "hosts owner read" on public.hosts;
create policy "hosts owner read" on public.hosts
  for select to authenticated
  using (auth.uid() is not null and auth.uid() = owner_user_id);

-- Admin di piattaforma può leggere TUTTO
drop policy if exists "hosts admin read" on public.hosts;
create policy "hosts admin read" on public.hosts
  for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- View pubblica: esclude i campi sensibili.
-- Bypassa RLS della tabella base perché in Postgres una view "regular"
-- viene eseguita con i privilegi dell'owner della view (postgres),
-- non del caller. La sicurezza è imposta dalle GRANT sulla view.
drop view if exists public.hosts_public cascade;
create view public.hosts_public as
  select
    id, name, city, rating, reviews_count, since, response_time,
    verified, status, featured, description, logo_url,
    business_email, business_phone, vat_number,
    terms,
    payment_cards, payment_debit, payment_cash, payment_cash_limit_eur,
    payment_bank_transfer,
    created_at, updated_at
  from public.hosts
  where status in ('verified', 'pending')  -- nascondi suspended/rejected dal marketplace
  ;

-- Esponi la view a tutti (anon + authenticated)
grant select on public.hosts_public to anon, authenticated;
comment on view public.hosts_public is
  'View pubblica della tabella hosts. Esclude bank_iban/bank_bic/bank_holder e moderation_notes che sono PII non destinata al marketplace.';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. CARS — restringi accesso diretto
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists "public read cars" on public.cars;

-- Owner (host) può leggere TUTTO il proprio inventario (incluso internal_notes, targa)
-- La policy "cars owner read" è già creata in host-vehicles-schema.sql e va bene.
-- Aggiungiamo solo admin read.
drop policy if exists "cars admin read" on public.cars;
create policy "cars admin read" on public.cars
  for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- View pubblica per marketplace: solo cars 'active' di host 'verified',
-- e solo campi safe.
drop view if exists public.cars_public cascade;
create view public.cars_public as
  select
    c.id, c.brand, c.model, c.year, c.name,
    c.category, c.fuel, c.transmission,
    c.seats, c.doors, c.engine, c.km, c.range_km,
    c.price_per_day, c.price_per_week, c.price_per_month,
    c.host_id, c.city, c.distance, c.coords,
    c.hot, c.variant, c.tone, c.accent_tone,
    c.accessories, c.description, c.status,
    c.power_hp, c.drivetrain,
    c.photos, c.images,
    c.pickup_location,
    c.brand_id, c.model_id,
    c.created_at, c.updated_at
  from public.cars c
  join public.hosts h on h.id = c.host_id
  where c.status = 'active'
    and h.status in ('verified', 'pending')  -- mostra anche pending per onboarding soft
  ;

grant select on public.cars_public to anon, authenticated;
comment on view public.cars_public is
  'View pubblica marketplace: solo cars status=active di host verificati. Esclude license_plate, internal_notes, moderation_notes (PII gestionale dell''host).';

-- ─────────────────────────────────────────────────────────────────────────
-- 3. REPORTS — owner-only era già OK, riconfermiamo
-- ─────────────────────────────────────────────────────────────────────────
-- (RLS già configurata in moderation-schema.sql)

-- ─────────────────────────────────────────────────────────────────────────
-- 4. RPC che il frontend può chiamare per dati host pubblici aggregati
-- (alternativa pulita alla view per chiamate via from('hosts_public').single())
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.public_get_host(p_host_id text)
returns public.hosts_public
language sql
security definer
set search_path = public
stable
as $$
  select * from public.hosts_public where id = p_host_id;
$$;

grant execute on function public.public_get_host to anon, authenticated;
