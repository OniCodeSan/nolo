-- Moderation & Trust layer.
-- Esegui DOPO host-backoffice-schema.sql.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Admin role su profiles
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Solo amministratori di piattaforma. Cambio via SQL diretto (non esposto in UI).';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Host status (moderation lifecycle)
--    pending  → appena registrato, non visibile sul marketplace
--    verified → controllato manualmente, visibile, badge verde
--    suspended → temporaneamente nascosto (es. troppe lamentele)
--    rejected → host rifiutato (es. documenti falsi)
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_type where typname = 'host_status') then
    create type host_status as enum ('pending', 'verified', 'suspended', 'rejected');
  end if;
end $$;

alter table public.hosts
  add column if not exists status host_status not null default 'pending',
  add column if not exists moderation_notes text,
  add column if not exists featured boolean not null default false,
  add column if not exists verified_at timestamptz,
  add column if not exists suspended_at timestamptz;

-- Migra `verified` legacy → `status='verified'`
update public.hosts set status = 'verified', verified_at = coalesce(verified_at, now())
where verified = true and status = 'pending';

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Cars status: aggiungiamo 'rejected'
--    (draft/active esistono già da host-vehicles-schema.sql)
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  if exists (select 1 from pg_type where typname = 'car_status') then
    -- Add 'rejected' if not present
    if not exists (
      select 1 from pg_enum where enumtypid = 'car_status'::regtype and enumlabel = 'rejected'
    ) then
      alter type car_status add value if not exists 'rejected';
    end if;
  end if;
end $$;

alter table public.cars
  add column if not exists moderation_notes text;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Reports table
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('host', 'car', 'user', 'review')),
  target_id   text not null,
  reason      text not null check (reason in (
    'fake_listing', 'misleading_info', 'no_show', 'damaged_vehicle',
    'rude_behavior', 'scam', 'inappropriate_content', 'other'
  )),
  details     text,
  status      text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  notes       text, -- note interne admin
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_reports_target on public.reports(target_type, target_id);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_reporter on public.reports(reporter_id);

alter table public.reports enable row level security;

-- Policy: ogni utente autenticato può inserire un report.
drop policy if exists "reports insert authed" on public.reports;
create policy "reports insert authed" on public.reports
  for insert to authenticated
  with check (auth.uid() = reporter_id);

-- Policy: l'utente può vedere solo i propri report.
drop policy if exists "reports read own" on public.reports;
create policy "reports read own" on public.reports
  for select to authenticated
  using (auth.uid() = reporter_id);

-- Policy: admin può fare tutto.
drop policy if exists "reports admin all" on public.reports;
create policy "reports admin all" on public.reports
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Filtri marketplace: nascondi host non verificati / sospesi
--    (RPC che il listing già usa, aggiungere where status='verified')
-- ─────────────────────────────────────────────────────────────────────────
-- Nota: aggiornare le query del frontend (services/cars.js) per filtrare
-- solo cars di host verificati e cars con status='active'.
-- (Il filtro lato app è già nella query; questo SQL aggiunge solo la colonna.)

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Admin actions (RPC con security definer)
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.admin_set_host_status(
  p_host_id text, p_status host_status, p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can change host status';
  end if;
  update hosts
  set status = p_status,
      moderation_notes = coalesce(p_notes, moderation_notes),
      verified_at = case when p_status = 'verified' then now() else verified_at end,
      suspended_at = case when p_status = 'suspended' then now() else suspended_at end,
      updated_at = now()
  where id = p_host_id;
end;
$$;

create or replace function public.admin_set_host_featured(
  p_host_id text, p_featured boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can feature hosts';
  end if;
  update hosts set featured = p_featured, updated_at = now() where id = p_host_id;
end;
$$;

create or replace function public.admin_reject_car(
  p_car_id text, p_notes text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can reject cars';
  end if;
  update cars
  set status = 'rejected',
      moderation_notes = p_notes,
      updated_at = now()
  where id = p_car_id;
end;
$$;

create or replace function public.admin_set_report_status(
  p_report_id uuid, p_status text, p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can change report status';
  end if;
  if p_status not in ('reviewed', 'dismissed', 'actioned') then
    raise exception 'Invalid status: %', p_status;
  end if;
  update reports
  set status = p_status,
      notes = coalesce(p_notes, notes),
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where id = p_report_id;
end;
$$;

-- Dashboard KPI admin (count rapidi)
create or replace function public.admin_kpi()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Admin only';
  end if;
  select jsonb_build_object(
    'hosts_total', (select count(*) from hosts),
    'hosts_pending', (select count(*) from hosts where status = 'pending'),
    'hosts_verified', (select count(*) from hosts where status = 'verified'),
    'hosts_suspended', (select count(*) from hosts where status = 'suspended'),
    'cars_total', (select count(*) from cars),
    'cars_active', (select count(*) from cars where status = 'active'),
    'cars_draft', (select count(*) from cars where status = 'draft'),
    'cars_rejected', (select count(*) from cars where status = 'rejected'),
    'bookings_total', (select count(*) from bookings),
    'reports_pending', (select count(*) from reports where status = 'pending'),
    'users_total', (select count(*) from profiles)
  ) into result;
  return result;
end;
$$;

grant execute on function public.admin_set_host_status to authenticated;
grant execute on function public.admin_set_host_featured to authenticated;
grant execute on function public.admin_reject_car to authenticated;
grant execute on function public.admin_set_report_status to authenticated;
grant execute on function public.admin_kpi to authenticated;
