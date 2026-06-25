-- MoviQ: completa una prenotazione confermata (ritiro/riconsegna effettuati).
-- Esegui DOPO host-bookings-schema.sql.

alter table bookings add column if not exists completed_at timestamptz;
alter table bookings add column if not exists host_notes   text;

create index if not exists bookings_status_date_idx on bookings(status, date_from);

create or replace function complete_booking(p_booking_id uuid, p_notes text default null)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare b bookings;
begin
  update bookings
     set status = 'completed',
         host_notes = coalesce(p_notes, host_notes),
         completed_at = now()
   where id = p_booking_id
     and status = 'confirmed'
     and exists (
       select 1 from cars c
         join hosts h on h.id = c.host_id
        where c.id = bookings.car_id
          and h.owner_user_id = auth.uid()
     )
  returning * into b;
  if b.id is null then raise exception 'booking non completabile (non confermata o non autorizzato)'; end if;
  return b;
end;
$$;

-- Read pubblico ridotto del profile per mostrare nome cliente all'host della booking.
-- Senza questa policy l'host non vedrebbe full_name del cliente (RLS profiles è owner-only).
drop policy if exists "profiles host read" on profiles;
create policy "profiles host read"
  on profiles for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from bookings b
        join cars c on c.id = b.car_id
        join hosts h on h.id = c.host_id
       where b.user_id = profiles.id
         and h.owner_user_id = auth.uid()
    )
  );
