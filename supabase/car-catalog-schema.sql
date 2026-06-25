-- MoviQ catalog brands/models
-- Tabelle di riferimento (lettura pubblica, scrittura solo via service role).
-- Esegui DOPO host-vehicles-schema.sql.

create table if not exists car_brands (
  id    text primary key,                 -- slug es. 'volkswagen', 'alfa-romeo'
  name  text not null,                    -- 'Volkswagen', 'Alfa Romeo'
  popular boolean default false,          -- evidenziato nei dropdown
  country text                            -- nazione di origine (opzionale)
);

create table if not exists car_models (
  id        text primary key,             -- slug brand-model es. 'volkswagen-polo'
  brand_id  text not null references car_brands(id) on delete cascade,
  name      text not null,
  popular   boolean default false
);

create index if not exists car_models_brand_idx on car_models(brand_id);
create index if not exists car_models_name_idx  on car_models(lower(name));
create index if not exists car_brands_name_idx  on car_brands(lower(name));

-- Estendi cars con riferimenti brand/model (oltre ai text già esistenti che restano per back-compat)
alter table cars add column if not exists brand_id text references car_brands(id);
alter table cars add column if not exists model_id text references car_models(id);
create index if not exists cars_brand_id_idx on cars(brand_id);

-- RLS lettura pubblica
alter table car_brands enable row level security;
alter table car_models enable row level security;

drop policy if exists "public read car_brands" on car_brands;
drop policy if exists "public read car_models" on car_models;

create policy "public read car_brands" on car_brands for select using (true);
create policy "public read car_models" on car_models for select using (true);

-- Helper per autocomplete server-side (fast ILIKE su lower)
create or replace function search_brands(q text, lim int default 20)
returns setof car_brands
language sql stable
as $$
  select * from car_brands
  where coalesce(q, '') = '' or lower(name) like lower(q || '%') or lower(name) like '%' || lower(q) || '%'
  order by popular desc, name
  limit lim;
$$;

create or replace function search_models(p_brand_id text, q text, lim int default 30)
returns setof car_models
language sql stable
as $$
  select * from car_models
  where brand_id = p_brand_id
    and (coalesce(q, '') = '' or lower(name) like '%' || lower(q) || '%')
  order by popular desc, name
  limit lim;
$$;
