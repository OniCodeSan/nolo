-- MoviQ: gestione richieste lato host (accept/decline + RLS host)
-- Esegui DOPO host-vehicles-schema.sql.

alter table bookings add column if not exists host_response text;
alter table bookings add column if not exists decided_at timestamptz;
alter table bookings add column if not exists decline_reason text;

create index if not exists bookings_status_created_idx on bookings(status, created_at desc);

-- ============ RLS host ============
-- L'host vede e aggiorna le bookings relative ai propri veicoli.

drop policy if exists "bookings host read"   on bookings;
drop policy if exists "bookings host update" on bookings;

create policy "bookings host read"
  on bookings for select using (
    auth.uid() is not null
    and exists (
      select 1 from cars c
        join hosts h on h.id = c.host_id
       where c.id = bookings.car_id
         and h.owner_user_id = auth.uid()
    )
  );

create policy "bookings host update"
  on bookings for update using (
    auth.uid() is not null
    and exists (
      select 1 from cars c
        join hosts h on h.id = c.host_id
       where c.id = bookings.car_id
         and h.owner_user_id = auth.uid()
    )
  ) with check (
    auth.uid() is not null
    and exists (
      select 1 from cars c
        join hosts h on h.id = c.host_id
       where c.id = bookings.car_id
         and h.owner_user_id = auth.uid()
    )
  );

-- ============ RPC sicure ============

create or replace function accept_booking(p_booking_id uuid, p_message text default null)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare b bookings;
begin
  update bookings
     set status = 'confirmed',
         host_response = p_message,
         decided_at = now()
   where id = p_booking_id
     and status = 'requested'
     and exists (
       select 1 from cars c
         join hosts h on h.id = c.host_id
        where c.id = bookings.car_id
          and h.owner_user_id = auth.uid()
     )
  returning * into b;
  if b.id is null then raise exception 'booking non gestibile (non trovata o non in stato requested o non autorizzato)'; end if;
  return b;
end;
$$;

create or replace function decline_booking(p_booking_id uuid, p_reason text default null)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare b bookings;
begin
  update bookings
     set status = 'declined',
         decline_reason = p_reason,
         decided_at = now()
   where id = p_booking_id
     and status in ('requested', 'confirmed')
     and exists (
       select 1 from cars c
         join hosts h on h.id = c.host_id
        where c.id = bookings.car_id
          and h.owner_user_id = auth.uid()
     )
  returning * into b;
  if b.id is null then raise exception 'booking non gestibile'; end if;
  return b;
end;
$$;
