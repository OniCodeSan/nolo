-- MoviQ schema — esegui in Supabase SQL editor.
-- Crea tabelle, indici e RLS policies (read pubblico, write bloccato).

create table if not exists hosts (
  id            text primary key,
  name          text not null,
  city          text,
  rating        numeric(2,1),
  reviews_count int,
  since         text,
  response_time text,
  verified      boolean default false
);

create table if not exists categories (
  id         text primary key,
  label      text not null,
  tone       text,
  from_price int
);

create table if not exists cars (
  id              text primary key,
  brand           text,
  model           text,
  year            int,
  name            text,
  category        text references categories(id),
  fuel            text,
  transmission    text,
  seats           int,
  doors           int,
  engine          text,
  km              text,
  range_km        text,
  price_per_day   int,
  price_per_month int,
  host_id         text references hosts(id),
  city            text,
  distance        text,
  coords          int[],
  hot             boolean default false,
  variant         text,
  tone            text,
  accent_tone     text,
  accessories     text[],
  description     text
);
create index if not exists cars_category_idx on cars(category);
create index if not exists cars_host_idx on cars(host_id);

create table if not exists locations (
  id    text primary key,
  label text not null,
  sub   text,
  icon  text
);

create table if not exists nearest_hosts (
  host_id    text primary key references hosts(id),
  distance   text,
  cars_count int
);

create table if not exists reviews (
  id            bigserial primary key,
  reviewer_name text,
  avatar        text,
  date_label    text,
  stars         int,
  body          text
);

-- RLS: tutte le tabelle leggibili pubblicamente con la chiave anon.
-- Nessun INSERT/UPDATE/DELETE da client (serve service_role o nuove policy quando aggiungiamo auth).

alter table hosts         enable row level security;
alter table categories    enable row level security;
alter table cars          enable row level security;
alter table locations     enable row level security;
alter table nearest_hosts enable row level security;
alter table reviews       enable row level security;

drop policy if exists "public read hosts"         on hosts;
drop policy if exists "public read categories"    on categories;
drop policy if exists "public read cars"          on cars;
drop policy if exists "public read locations"     on locations;
drop policy if exists "public read nearest_hosts" on nearest_hosts;
drop policy if exists "public read reviews"       on reviews;

create policy "public read hosts"         on hosts         for select using (true);
create policy "public read categories"    on categories    for select using (true);
create policy "public read cars"          on cars          for select using (true);
create policy "public read locations"     on locations     for select using (true);
create policy "public read nearest_hosts" on nearest_hosts for select using (true);
create policy "public read reviews"       on reviews       for select using (true);
