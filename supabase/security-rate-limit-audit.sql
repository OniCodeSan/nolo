-- ═════════════════════════════════════════════════════════════════════════
-- SECURITY HARDENING — Rate limit reports + Audit log azioni admin
-- ═════════════════════════════════════════════════════════════════════════
-- Esegui DOPO moderation-schema.sql.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Rate limit sui reports (max 5 report/ora per utente)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.reports_rate_limit_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  duplicate_exists boolean;
begin
  -- Max 5 report/ora per reporter
  select count(*) into recent_count
  from reports
  where reporter_id = new.reporter_id
    and created_at > now() - interval '1 hour';
  if recent_count >= 5 then
    raise exception 'Hai inviato troppe segnalazioni nell''ultima ora. Riprova più tardi.'
      using errcode = 'P0001';
  end if;

  -- Anti-duplicato: stesso reporter sullo stesso target nell'ultimo giorno
  select exists(
    select 1 from reports
    where reporter_id = new.reporter_id
      and target_type = new.target_type
      and target_id = new.target_id
      and created_at > now() - interval '24 hours'
  ) into duplicate_exists;
  if duplicate_exists then
    raise exception 'Hai già segnalato questo elemento di recente.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reports_rate_limit on public.reports;
create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.reports_rate_limit_check();

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Audit log per le azioni admin
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,
  target_type text,
  target_id   text,
  payload     jsonb,
  ip_hash     text, -- opzionale, da popolare se serve (con hashing client-side)
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_actor on public.audit_log(actor_id, created_at desc);
create index if not exists idx_audit_action on public.audit_log(action, created_at desc);
create index if not exists idx_audit_target on public.audit_log(target_type, target_id);

alter table public.audit_log enable row level security;

-- Solo admin leggono. Niente policy insert: si scrive solo via RPC SECURITY DEFINER.
drop policy if exists "audit admin read" on public.audit_log;
create policy "audit admin read" on public.audit_log
  for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Helper interno per scrivere audit log
create or replace function public._write_audit_log(
  p_action text, p_target_type text, p_target_id text, p_payload jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare actor_email_v text;
begin
  select email into actor_email_v from auth.users where id = auth.uid();
  insert into audit_log (actor_id, actor_email, action, target_type, target_id, payload)
  values (auth.uid(), actor_email_v, p_action, p_target_type, p_target_id, p_payload);
end;
$$;

-- Re-wrap delle admin RPC esistenti perché scrivano audit log.
-- Sostituiamo le funzioni del file moderation-schema.sql con versioni audit-aware.

create or replace function public.admin_set_host_status(
  p_host_id text, p_status host_status, p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare old_status host_status;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can change host status';
  end if;
  select status into old_status from hosts where id = p_host_id;
  update hosts
  set status = p_status,
      moderation_notes = coalesce(p_notes, moderation_notes),
      verified_at = case when p_status = 'verified' then now() else verified_at end,
      suspended_at = case when p_status = 'suspended' then now() else suspended_at end,
      updated_at = now()
  where id = p_host_id;
  perform _write_audit_log(
    'host.set_status', 'host', p_host_id,
    jsonb_build_object('from', old_status, 'to', p_status, 'notes', p_notes)
  );
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
  perform _write_audit_log(
    'host.set_featured', 'host', p_host_id,
    jsonb_build_object('featured', p_featured)
  );
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
  perform _write_audit_log(
    'car.reject', 'car', p_car_id,
    jsonb_build_object('notes', p_notes)
  );
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
declare old_status text;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can change report status';
  end if;
  if p_status not in ('reviewed', 'dismissed', 'actioned') then
    raise exception 'Invalid status: %', p_status;
  end if;
  select status into old_status from reports where id = p_report_id;
  update reports
  set status = p_status,
      notes = coalesce(p_notes, notes),
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where id = p_report_id;
  perform _write_audit_log(
    'report.set_status', 'report', p_report_id::text,
    jsonb_build_object('from', old_status, 'to', p_status, 'notes', p_notes)
  );
end;
$$;

-- Funzione admin per leggere l'audit log (lista paginata)
create or replace function public.admin_audit_log(p_limit int default 100, p_offset int default 0)
returns setof audit_log
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Admin only';
  end if;
  return query
    select * from audit_log order by created_at desc limit p_limit offset p_offset;
end;
$$;

grant execute on function public.admin_audit_log to authenticated;

comment on table public.audit_log is
  'Audit trail di tutte le azioni amministrative. Scrittura solo via _write_audit_log() (SECURITY DEFINER). Lettura solo admin.';
