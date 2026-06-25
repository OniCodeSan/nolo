-- MoviQ host vehicles schema
-- Estende cars con stato pubblicazione, targa privata, doc/foto, price_per_week.
-- Esegui DOPO host-backoffice-schema.sql.

alter table cars add column if not exists status text not null default 'active'
  check (status in ('active', 'draft', 'disabled'));
alter table cars add column if not exists license_plate text;            -- visibile solo all'owner via RLS
alter table cars add column if not exists power_hp int;                  -- cavalli
alter table cars add column if not exists drivetrain text;               -- FWD / RWD / AWD
alter table cars add column if not exists price_per_week int;
alter table cars add column if not exists photos text[] default array[]::text[]; -- urls
alter table cars add column if not exists pickup_location text;
alter table cars add column if not exists created_at timestamptz default now();
alter table cars add column if not exists updated_at timestamptz default now();

create index if not exists cars_status_idx on cars(status);

-- Aggiorna la policy di lettura: pubblica solo per status='active'.
-- Owner vede tutte le proprie (incluse bozze).
drop policy if exists "public read cars" on cars;
create policy "public read cars active"
  on cars for select
  using (status = 'active');

create policy "cars owner read"
  on cars for select
  using (
    auth.uid() is not null and exists (
      select 1 from hosts where hosts.id = cars.host_id and hosts.owner_user_id = auth.uid()
    )
  );

-- La policy cars owner write (creata da host-backoffice-schema.sql) gi`a copre insert/update/delete.

-- Sequenza per generare id univoci se l'owner non lo fornisce
create sequence if not exists car_seq;

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
  base := substring(base from 1 for 40);
  candidate := base;
  n := 0;
  while exists (select 1 from cars where id = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;
