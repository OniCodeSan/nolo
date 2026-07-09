-- ═══════════════════════════════════════════════════════════════════════
-- Cauzione PER VEICOLO (prima era una costante 200€ hardcoded)
-- Eseguire una volta nel SQL Editor. Tutto in transazione.
-- Le auto esistenti prendono default 200 → nessuna rottura.
-- ═══════════════════════════════════════════════════════════════════════
begin;

-- 1) Colonna deposit su cars
alter table public.cars
  add column if not exists deposit int not null default 200;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cars_deposit_range') then
    alter table public.cars
      add constraint cars_deposit_range check (deposit >= 0 and deposit <= 10000);
  end if;
end $$;

comment on column public.cars.deposit is
  'Cauzione in euro richiesta al ritiro, rimborsata alla riconsegna. Impostata dal noleggiatore per veicolo.';

-- 2) cars_public deve esporre deposit (altrimenti il cliente non la vede)
drop view if exists public.cars_public cascade;
create view public.cars_public as
  select
    c.id, c.brand, c.model, c.year, c.name,
    c.category, c.fuel, c.transmission,
    c.seats, c.doors, c.engine, c.km, c.range_km,
    c.price_per_day, c.price_per_week, c.price_per_month,
    c.deposit,
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

-- 3) create_booking: la cauzione ora viene dal veicolo (non più costante).
--    CRITICO: il totale è calcolato server-side, senza questo il cliente
--    pagherebbe sempre 200€ anche se la scheda ne mostra un'altra.
create or replace function public.create_booking(
  p_car_id    text,
  p_date_from date,
  p_date_to   date,
  p_message   text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_car        public.cars;
  v_host_owner uuid;
  v_days       int;
  v_subtotal   int;
  v_deposit    int;   -- cauzione del veicolo (fallback 200)
  v_total      int;
  b            public.bookings;
begin
  if v_uid is null then
    raise exception 'Devi essere autenticato per prenotare.' using errcode = '42501';
  end if;

  -- Validazione date
  if p_date_from is null or p_date_to is null then
    raise exception 'Date mancanti.';
  end if;
  if p_date_to <= p_date_from then
    raise exception 'La data di riconsegna deve essere successiva al ritiro.';
  end if;
  if p_date_from < current_date then
    raise exception 'Non puoi prenotare in una data passata.';
  end if;

  -- Carica l'auto (server-side) e l'owner dell'host
  select * into v_car from public.cars where id = p_car_id;
  if not found then
    raise exception 'Auto non trovata.';
  end if;
  if v_car.status is distinct from 'active' then
    raise exception 'Questa auto non è prenotabile.';
  end if;

  select h.owner_user_id into v_host_owner
    from public.hosts h where h.id = v_car.host_id;

  -- L8: niente prenotazione della propria auto
  if v_host_owner is not null and v_host_owner = v_uid then
    raise exception 'Non puoi prenotare un veicolo di cui sei il noleggiatore.';
  end if;

  -- Ricalcolo importi server-side
  v_deposit  := coalesce(v_car.deposit, 200);
  v_days     := (p_date_to - p_date_from);
  if v_days < 1 then v_days := 1; end if;
  v_subtotal := v_car.price_per_day * v_days;
  v_total    := v_subtotal + v_deposit;

  insert into public.bookings (
    user_id, car_id, host_id, date_from, date_to,
    days, price_per_day, subtotal, deposit, total,
    message, status
  ) values (
    v_uid, v_car.id, v_car.host_id, p_date_from, p_date_to,
    v_days, v_car.price_per_day, v_subtotal, v_deposit, v_total,
    nullif(left(coalesce(p_message, ''), 2000), ''), 'requested'
  )
  returning * into b;

  return b;
end;
$$;

commit;

-- ✅ Verifica:
--   select id, brand, model, deposit from public.cars limit 5;
--   select deposit from public.cars_public limit 1;
