-- MoviQ — Subscription dei noleggiatori (Stripe Billing)
-- Esegui DOPO host-backoffice-schema.sql.
-- Documenta lo stato di abbonamento di ogni host: trial 30gg → renewal mensile automatico → cancel-anytime.

create table if not exists host_subscriptions (
  id uuid primary key default gen_random_uuid(),
  host_id text references hosts(id) on delete cascade not null,

  -- Riferimenti Stripe
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  stripe_price_id        text,

  -- Stato (allineato a Stripe Subscription.status)
  -- none → mai creata
  -- trialing → primi 30 giorni gratuiti, addebito non ancora effettuato
  -- active → in regola, fatturato e pagato
  -- past_due → addebito fallito, grace period attivo
  -- unpaid → grace period scaduto, accesso sospeso
  -- canceled → disattivato (resta attivo fino a current_period_end)
  -- incomplete / incomplete_expired → SCA non completato al checkout iniziale
  status text not null default 'none'
    check (status in ('none','trialing','active','past_due','unpaid','canceled','incomplete','incomplete_expired','paused')),

  -- Fasi temporali (UTC, sincronizzate dai webhook Stripe)
  trial_start          timestamptz,
  trial_end            timestamptz,
  current_period_start timestamptz,
  current_period_end   timestamptz,

  -- Cancellazione
  cancel_at_period_end boolean default false,
  canceled_at          timestamptz,

  -- Ultima fattura nota (utile per debug e UI)
  last_invoice_id      text,
  last_invoice_paid_at timestamptz,
  last_payment_error   text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(host_id)
);

create index if not exists host_subs_host_idx        on host_subscriptions(host_id);
create index if not exists host_subs_customer_idx    on host_subscriptions(stripe_customer_id);
create index if not exists host_subs_subscription_idx on host_subscriptions(stripe_subscription_id);
create index if not exists host_subs_status_idx      on host_subscriptions(status);

-- Trigger updated_at
create or replace function set_host_subscriptions_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_host_subs_updated on host_subscriptions;
create trigger trg_host_subs_updated
  before update on host_subscriptions
  for each row execute function set_host_subscriptions_updated_at();

-- ============================================================
-- RLS: host può leggere SOLO il proprio record. Scrivono solo le
-- Edge Functions tramite service_role (i webhook Stripe).
-- ============================================================
alter table host_subscriptions enable row level security;

drop policy if exists "host_subs owner read" on host_subscriptions;
create policy "host_subs owner read"
  on host_subscriptions for select
  using (
    exists (
      select 1 from hosts h
      where h.id = host_subscriptions.host_id
        and h.owner_user_id = auth.uid()
    )
  );

-- ============================================================
-- Helper: abbonamento attivo (incluso trial e grace period past_due).
-- Usato dalle RLS di cars per gating della pubblicazione.
-- ============================================================
create or replace function host_subscription_active(p_host_id text)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from host_subscriptions
    where host_id = p_host_id
      and status in ('trialing','active','past_due')
      and (current_period_end is null or current_period_end > now())
  );
$$;

-- ============================================================
-- View comoda per il frontend: stato corrente + giorni residui trial.
-- ============================================================
create or replace view host_subscription_status as
select
  hs.host_id,
  hs.status,
  hs.trial_start,
  hs.trial_end,
  hs.current_period_start,
  hs.current_period_end,
  hs.cancel_at_period_end,
  hs.canceled_at,
  hs.last_invoice_paid_at,
  hs.last_payment_error,
  case
    when hs.status = 'trialing' and hs.trial_end is not null
      then greatest(0, extract(day from (hs.trial_end - now()))::int)
    else null
  end as trial_days_remaining,
  case
    when hs.status in ('trialing','active','past_due')
         and (hs.current_period_end is null or hs.current_period_end > now())
      then true
    else false
  end as is_active
from host_subscriptions hs;

grant select on host_subscription_status to authenticated, anon;

-- ============================================================
-- Gating: un host senza subscription attiva NON può pubblicare veicoli.
-- Modifichiamo le RLS esistenti di cars (insert/update).
-- Lasciamo invariata la lettura pubblica.
-- ============================================================
-- NB: l'admin (service_role) bypassa sempre le RLS.
do $$
begin
  if exists (select 1 from pg_policies where tablename = 'cars' and policyname = 'cars host insert') then
    execute 'drop policy "cars host insert" on cars';
  end if;
  if exists (select 1 from pg_policies where tablename = 'cars' and policyname = 'cars host update') then
    execute 'drop policy "cars host update" on cars';
  end if;
end $$;

-- Le seguenti policy presumono che cars.host_id sia il riferimento al noleggiatore.
-- Se la tabella veicoli si chiama diversamente, adattare i nomi.
create policy "cars host insert"
  on cars for insert
  with check (
    exists (
      select 1 from hosts h
      where h.id = cars.host_id
        and h.owner_user_id = auth.uid()
        and host_subscription_active(h.id)
    )
  );

create policy "cars host update"
  on cars for update
  using (
    exists (
      select 1 from hosts h
      where h.id = cars.host_id
        and h.owner_user_id = auth.uid()
        and host_subscription_active(h.id)
    )
  );
