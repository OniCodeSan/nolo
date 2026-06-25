-- ============================================================
-- HOTFIX 2026-06-20 — geolocalizzazione veicoli + copertina + id auto
-- Eseguire una volta nel SQL Editor di Supabase (progetto nolo).
-- Tutto in una transazione: o passa tutto o niente.
-- ============================================================
begin;

-- 1) coords deve contenere [lat, lng] in GRADI (decimali), non interi.
--    La view cars_public dipende da coords → va eliminata prima dell'ALTER.
drop view if exists public.cars_public cascade;

alter table public.cars
  alter column coords type double precision[]
  using coords::double precision[];

-- 2) Ricrea cars_public ALLINEATA al codice: include images/photos
--    (in prod mancava `images` → la copertina non caricava).
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
    and h.status in ('verified', 'pending');

grant select on public.cars_public to anon, authenticated;
comment on view public.cars_public is
  'View pubblica marketplace: solo cars status=active di host verificati. Esclude license_plate, internal_notes, moderation_notes (PII gestionale dell''host).';

-- 3) generate_car_id: niente più id rotti come "-" quando marca/modello sono vuoti.
create or replace function generate_car_id(p_host_id text, p_brand text, p_model text)
returns text
language plpgsql
as $$
declare
  base text;
  candidate text;
  n int;
begin
  base := lower(regexp_replace(coalesce(p_brand, '') || '-' || coalesce(p_model, ''), '[^a-z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  base := substring(base from 1 for 40);
  if base is null or base = '' then
    base := 'auto-' || substring(replace(coalesce(p_host_id, 'host'), '-', '') from 1 for 8);
  end if;
  candidate := base;
  n := 0;
  while exists (select 1 from cars where id = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

commit;
