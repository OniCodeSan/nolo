-- ═════════════════════════════════════════════════════════════════════════
-- IMAGE LIFECYCLE — cleanup queue + upload log + per-host quota
-- ═════════════════════════════════════════════════════════════════════════
-- Esegui DOPO host-vehicles-images.sql.
-- Risolve 3 problemi a scala migliaia di immagini:
--   1. Orphan images su Cloudinary quando car viene cancellata/modificata
--   2. Nessun limite globale per host (rischio abuso storage)
--   3. Nessuna telemetria upload visibile in /admin

-- ─────────────────────────────────────────────────────────────────────────
-- 1. CODA DI CLEANUP
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.image_cleanup_queue (
  id            uuid primary key default gen_random_uuid(),
  public_id     text not null,
  reason        text not null check (reason in ('car_deleted','images_updated','admin_purge','host_deleted')),
  source_table  text,
  source_id     text,
  enqueued_at   timestamptz not null default now(),
  processed_at  timestamptz,
  processed     boolean not null default false,
  attempts      int not null default 0,
  last_error    text
);

create index if not exists idx_cleanup_pending
  on public.image_cleanup_queue (enqueued_at)
  where processed = false;

alter table public.image_cleanup_queue enable row level security;

-- Solo admin legge la coda. Insert avviene SOLO via trigger SECURITY DEFINER.
drop policy if exists "cleanup admin read" on public.image_cleanup_queue;
create policy "cleanup admin read" on public.image_cleanup_queue
  for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Update solo via service_role (worker script). Niente policy authenticated update.

-- ─────────────────────────────────────────────────────────────────────────
-- 2. LOG DEGLI UPLOAD (telemetria + metriche admin)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.image_upload_log (
  id           uuid primary key default gen_random_uuid(),
  car_id       text references public.cars(id) on delete set null,
  host_id      text,
  public_id    text not null,
  bytes        int,
  format       text,
  width        int,
  height       int,
  created_at   timestamptz not null default now()
);

create index if not exists idx_upload_log_host_date
  on public.image_upload_log (host_id, created_at desc);

alter table public.image_upload_log enable row level security;

drop policy if exists "upload_log admin read" on public.image_upload_log;
create policy "upload_log admin read" on public.image_upload_log
  for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ─────────────────────────────────────────────────────────────────────────
-- 3. TRIGGER: cars DELETE → enqueue tutte le immagini per cancellazione
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.enqueue_images_on_car_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if jsonb_typeof(old.images) = 'array' and jsonb_array_length(old.images) > 0 then
    insert into image_cleanup_queue (public_id, reason, source_table, source_id)
    select img->>'public_id', 'car_deleted', 'cars', old.id
    from jsonb_array_elements(old.images) img
    where img->>'public_id' is not null;
  end if;
  return old;
end;
$$;

drop trigger if exists cars_images_cleanup_on_delete on public.cars;
create trigger cars_images_cleanup_on_delete
  before delete on public.cars
  for each row execute function public.enqueue_images_on_car_delete();

-- ─────────────────────────────────────────────────────────────────────────
-- 4. TRIGGER: cars UPDATE images → enqueue le immagini RIMOSSE + log NUOVE
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.diff_images_on_car_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_ids text[];
  new_ids text[];
  removed text[];
  added jsonb;
begin
  -- Se images non è cambiata → skip
  if old.images is not distinct from new.images then
    return new;
  end if;

  -- Estrai public_id arrays
  select coalesce(array_agg(img->>'public_id'), array[]::text[]) into old_ids
    from jsonb_array_elements(coalesce(old.images, '[]'::jsonb)) img
    where img->>'public_id' is not null;
  select coalesce(array_agg(img->>'public_id'), array[]::text[]) into new_ids
    from jsonb_array_elements(coalesce(new.images, '[]'::jsonb)) img
    where img->>'public_id' is not null;

  -- Enqueue le immagini RIMOSSE (in old ma non in new)
  removed := array(select unnest(old_ids) except select unnest(new_ids));
  if array_length(removed, 1) > 0 then
    insert into image_cleanup_queue (public_id, reason, source_table, source_id)
    select pid, 'images_updated', 'cars', new.id
    from unnest(removed) pid;
  end if;

  -- Logga le immagini AGGIUNTE (in new ma non in old)
  for added in
    select img from jsonb_array_elements(coalesce(new.images, '[]'::jsonb)) img
    where img->>'public_id' is not null
      and img->>'public_id' <> all(old_ids)
  loop
    insert into image_upload_log (
      car_id, host_id, public_id, bytes, format, width, height
    ) values (
      new.id, new.host_id,
      added->>'public_id',
      (added->>'bytes')::int,
      added->>'format',
      (added->>'width')::int,
      (added->>'height')::int
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists cars_images_diff_on_update on public.cars;
create trigger cars_images_diff_on_update
  before update of images on public.cars
  for each row execute function public.diff_images_on_car_update();

-- Trigger anche su INSERT per loggare immagini caricate alla prima save
create or replace function public.log_images_on_car_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare added jsonb;
begin
  if jsonb_typeof(new.images) = 'array' and jsonb_array_length(new.images) > 0 then
    for added in select img from jsonb_array_elements(new.images) img
    loop
      if added->>'public_id' is not null then
        insert into image_upload_log (
          car_id, host_id, public_id, bytes, format, width, height
        ) values (
          new.id, new.host_id,
          added->>'public_id',
          (added->>'bytes')::int,
          added->>'format',
          (added->>'width')::int,
          (added->>'height')::int
        );
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists cars_images_log_on_insert on public.cars;
create trigger cars_images_log_on_insert
  after insert on public.cars
  for each row execute function public.log_images_on_car_insert();

-- ─────────────────────────────────────────────────────────────────────────
-- 5. PER-HOST IMAGE QUOTA
-- ─────────────────────────────────────────────────────────────────────────
alter table public.hosts
  add column if not exists max_images int not null default 100;

comment on column public.hosts.max_images is
  'Massimo numero totale di immagini cumulative attraverso TUTTI i veicoli dell''host. Admin può alzarlo per host VIP.';

create or replace function public.check_host_image_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total_imgs int;
  limit_imgs int;
begin
  if jsonb_typeof(new.images) <> 'array' then
    return new;
  end if;

  select max_images into limit_imgs from hosts where id = new.host_id;
  if limit_imgs is null then limit_imgs := 100; end if;

  -- Calcola immagini totali host (esclude la riga corrente per essere consistenti su UPDATE)
  select coalesce(sum(jsonb_array_length(images)), 0) into total_imgs
    from cars
    where host_id = new.host_id
      and id <> coalesce(new.id, '___nope___');

  total_imgs := total_imgs + jsonb_array_length(new.images);

  if total_imgs > limit_imgs then
    raise exception 'Quota immagini superata: % > % per host %', total_imgs, limit_imgs, new.host_id
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists cars_image_quota_check on public.cars;
create trigger cars_image_quota_check
  before insert or update of images on public.cars
  for each row execute function public.check_host_image_quota();

-- ─────────────────────────────────────────────────────────────────────────
-- 6. RPC ADMIN per dashboard immagini
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.admin_images_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare result jsonb;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Admin only';
  end if;
  select jsonb_build_object(
    'queue_pending', (select count(*) from image_cleanup_queue where processed = false),
    'queue_processed_24h', (select count(*) from image_cleanup_queue where processed = true and processed_at > now() - interval '24 hours'),
    'queue_errors', (select count(*) from image_cleanup_queue where attempts >= 3 and processed = false),
    'images_total', (select coalesce(sum(jsonb_array_length(images)), 0) from cars),
    'uploads_24h', (select count(*) from image_upload_log where created_at > now() - interval '24 hours'),
    'uploads_30d', (select count(*) from image_upload_log where created_at > now() - interval '30 days'),
    'bytes_uploaded_30d', (select coalesce(sum(bytes), 0) from image_upload_log where created_at > now() - interval '30 days'),
    'top_hosts_by_images', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      from (
        select c.host_id, h.name, sum(jsonb_array_length(c.images)) as image_count, h.max_images as quota
        from cars c
        join hosts h on h.id = c.host_id
        where jsonb_array_length(c.images) > 0
        group by c.host_id, h.name, h.max_images
        order by sum(jsonb_array_length(c.images)) desc
        limit 10
      ) t
    )
  ) into result;
  return result;
end;
$$;

grant execute on function public.admin_images_stats to authenticated;

-- RPC admin: lista coda con filtri
create or replace function public.admin_cleanup_queue(p_filter text default 'pending', p_limit int default 100)
returns setof image_cleanup_queue
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
    select * from image_cleanup_queue
    where case
      when p_filter = 'pending' then processed = false and attempts < 3
      when p_filter = 'errors' then attempts >= 3 and processed = false
      when p_filter = 'processed' then processed = true
      else true
    end
    order by enqueued_at desc
    limit p_limit;
end;
$$;
grant execute on function public.admin_cleanup_queue to authenticated;

-- RPC admin: forza purge manuale di un host (es. account cancellato)
create or replace function public.admin_purge_host_images(p_host_id text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare added_count int;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Admin only';
  end if;
  with all_imgs as (
    select img->>'public_id' as pid
    from cars c, jsonb_array_elements(c.images) img
    where c.host_id = p_host_id and img->>'public_id' is not null
  ),
  inserted as (
    insert into image_cleanup_queue (public_id, reason, source_table, source_id)
    select pid, 'admin_purge', 'hosts', p_host_id
    from all_imgs
    returning 1
  )
  select count(*)::int into added_count from inserted;
  perform _write_audit_log(
    'images.purge_host', 'host', p_host_id,
    jsonb_build_object('count', added_count)
  );
  return added_count;
end;
$$;
grant execute on function public.admin_purge_host_images to authenticated;

comment on table public.image_cleanup_queue is
  'Coda di public_id Cloudinary da cancellare. Riempita da trigger su cars. Drenata da scripts/cleanup-cloudinary.js (cron hourly).';
comment on table public.image_upload_log is
  'Log append-only di ogni upload riuscito. Usato per metriche admin e detection abuso.';
