-- MoviQ auth schema — esegui DOPO schema.sql
-- Crea tabelle utente: profiles, bookings, saved_cars con RLS per-utente.

-- 1. Profili utente (1:1 con auth.users, popolati al primo login)
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  city          text,
  avatar_url    text,
  driver_license_verified boolean default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Prenotazioni
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  car_id          text not null references cars(id),
  host_id         text references hosts(id),
  date_from       date not null,
  date_to         date not null,
  days            int not null,
  price_per_day   int not null,
  subtotal        int not null,
  deposit         int not null,
  total           int not null,
  message         text,
  status          text not null default 'requested', -- requested | confirmed | declined | cancelled | completed
  created_at      timestamptz not null default now()
);
create index if not exists bookings_user_idx   on bookings(user_id);
create index if not exists bookings_car_idx    on bookings(car_id);
create index if not exists bookings_status_idx on bookings(status);

-- 3. Auto salvate (wishlist cross-device)
create table if not exists saved_cars (
  user_id    uuid not null references auth.users(id) on delete cascade,
  car_id     text not null references cars(id),
  created_at timestamptz not null default now(),
  primary key (user_id, car_id)
);

-- ============ RLS ============

alter table profiles    enable row level security;
alter table bookings    enable row level security;
alter table saved_cars  enable row level security;

drop policy if exists "profiles owner read"   on profiles;
drop policy if exists "profiles owner write"  on profiles;
drop policy if exists "profiles owner update" on profiles;
drop policy if exists "bookings owner read"   on bookings;
drop policy if exists "bookings owner insert" on bookings;
drop policy if exists "bookings owner update" on bookings;
drop policy if exists "saved owner read"      on saved_cars;
drop policy if exists "saved owner insert"    on saved_cars;
drop policy if exists "saved owner delete"    on saved_cars;

-- profiles: il proprietario legge/scrive solo il proprio record
create policy "profiles owner read"
  on profiles for select using (auth.uid() = id);
create policy "profiles owner write"
  on profiles for insert with check (auth.uid() = id);
create policy "profiles owner update"
  on profiles for update using (auth.uid() = id);

-- bookings: il proprietario legge/inserisce solo i propri
create policy "bookings owner read"
  on bookings for select using (auth.uid() = user_id);
create policy "bookings owner insert"
  on bookings for insert with check (auth.uid() = user_id);
create policy "bookings owner update"
  on bookings for update using (auth.uid() = user_id);

-- saved_cars: il proprietario legge/inserisce/elimina solo i propri
create policy "saved owner read"
  on saved_cars for select using (auth.uid() = user_id);
create policy "saved owner insert"
  on saved_cars for insert with check (auth.uid() = user_id);
create policy "saved owner delete"
  on saved_cars for delete using (auth.uid() = user_id);

-- ============ Trigger: auto-crea profile al signup ============
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
