-- MoviQ host backoffice schema
-- Estende hosts con: owner_user_id, terms, pagamenti accettati, dati bancari.
-- Esegui DOPO auth-schema.sql.

alter table hosts add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table hosts add column if not exists terms text;
alter table hosts add column if not exists payment_cards text[] default array[]::text[];   -- es. ['visa','mastercard','amex']
alter table hosts add column if not exists payment_debit boolean default false;
alter table hosts add column if not exists payment_cash boolean default false;
alter table hosts add column if not exists payment_cash_limit_eur int default 5000;        -- limite di legge
alter table hosts add column if not exists payment_bank_transfer boolean default false;
alter table hosts add column if not exists bank_iban text;
alter table hosts add column if not exists bank_bic text;
alter table hosts add column if not exists bank_holder text;
alter table hosts add column if not exists logo_url text;
alter table hosts add column if not exists description text;
alter table hosts add column if not exists business_email text;
alter table hosts add column if not exists business_phone text;
alter table hosts add column if not exists vat_number text;
alter table hosts add column if not exists updated_at timestamptz default now();

create index if not exists hosts_owner_idx on hosts(owner_user_id);

-- Read pubblico delle hosts gi`a esistente. Aggiungiamo: owner pu`o aggiornare il proprio record.

drop policy if exists "hosts owner update"   on hosts;
drop policy if exists "hosts owner insert"   on hosts;

create policy "hosts owner update"
  on hosts for update using (auth.uid() is not null and auth.uid() = owner_user_id);

-- Gli utenti possono creare un host record collegato a se stessi (onboarding noleggiatore).
create policy "hosts owner insert"
  on hosts for insert with check (auth.uid() is not null and auth.uid() = owner_user_id);

-- Helper RPC: claim an existing host (legacy/seed) linking it to current user.
-- Pu`o essere usata da admin via service_role, qui restituiamo errore se gi`a posseduto.
create or replace function claim_host(p_host_id text)
returns hosts
language plpgsql
security definer
set search_path = public
as $$
declare
  h hosts;
begin
  select * into h from hosts where id = p_host_id;
  if not found then raise exception 'host not found'; end if;
  if h.owner_user_id is not null and h.owner_user_id <> auth.uid() then
    raise exception 'host already claimed';
  end if;
  update hosts set owner_user_id = auth.uid(), updated_at = now() where id = p_host_id returning * into h;
  return h;
end;
$$;

-- RLS extra: i veicoli del proprio host sono modificabili dall'owner
drop policy if exists "cars owner write" on cars;
create policy "cars owner write"
  on cars for all using (
    auth.uid() is not null
    and exists (select 1 from hosts where hosts.id = cars.host_id and hosts.owner_user_id = auth.uid())
  ) with check (
    auth.uid() is not null
    and exists (select 1 from hosts where hosts.id = cars.host_id and hosts.owner_user_id = auth.uid())
  );

-- Estendiamo bookings con time_from/time_to (orari ritiro/riconsegna)
alter table bookings add column if not exists time_from text default '10:00';
alter table bookings add column if not exists time_to   text default '18:00';
