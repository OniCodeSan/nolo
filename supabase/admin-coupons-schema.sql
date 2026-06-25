-- MoviQ — Coupon admin per gli abbonamenti noleggiatore
-- Tabella locale che riflette i Coupon/PromotionCode creati su Stripe via Edge Function.
-- Stripe resta la fonte autoritativa per le redemption; noi teniamo lo stato per la UI admin.

create table if not exists admin_coupons (
  id uuid primary key default gen_random_uuid(),

  -- Codice umano (es. 'WELCOME50'). Univoco, case-insensitive.
  code text unique not null,

  -- ID Stripe gemelli
  stripe_coupon_id          text unique,
  stripe_promotion_code_id  text unique,

  -- Descrizione interna (solo admin, non esposta al cliente)
  name text,

  -- Sconto: o percentuale o importo fisso, mai entrambi
  percent_off       int check (percent_off is null or (percent_off > 0 and percent_off <= 100)),
  amount_off_cents  int check (amount_off_cents is null or amount_off_cents > 0),
  currency          text default 'eur',

  -- Durata: 'once' (solo prima fattura), 'repeating' N mesi, 'forever'
  duration              text not null default 'once' check (duration in ('once','repeating','forever')),
  duration_in_months    int check (duration_in_months is null or duration_in_months > 0),

  -- Vincoli di utilizzo
  max_redemptions       int check (max_redemptions is null or max_redemptions > 0),
  times_redeemed        int not null default 0,
  expires_at            timestamptz,

  -- Stato
  active                boolean not null default true,

  -- Audit
  created_by_user_id    uuid references auth.users(id) on delete set null,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  -- Vincolo: o percent o amount, non entrambi né nessuno
  check (
    (percent_off is not null and amount_off_cents is null) or
    (percent_off is null     and amount_off_cents is not null)
  ),
  -- Se duration=repeating servono i mesi
  check (duration <> 'repeating' or duration_in_months is not null)
);

create index if not exists admin_coupons_active_idx   on admin_coupons(active) where active;
create index if not exists admin_coupons_code_idx     on admin_coupons(lower(code));

-- Trigger updated_at
create or replace function set_admin_coupons_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_admin_coupons_updated on admin_coupons;
create trigger trg_admin_coupons_updated
  before update on admin_coupons
  for each row execute function set_admin_coupons_updated_at();

-- ============================================================
-- RLS: solo admin (claim 'role' = 'admin' o tabella admin_users)
-- legge/scrive. Le scritture reali avvengono via Edge Function con service_role.
-- ============================================================
alter table admin_coupons enable row level security;

-- Riusiamo la funzione di check admin se esiste (security-pii-isolation.sql),
-- altrimenti fallback su email allowlist nel claim.
drop policy if exists "admin_coupons admin read"   on admin_coupons;
drop policy if exists "admin_coupons admin write"  on admin_coupons;

create policy "admin_coupons admin read"
  on admin_coupons for select
  using (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or exists (select 1 from pg_class where relname='admin_users')
  );

-- Le scritture le fa la Edge Function con service_role (bypassa RLS), non da SQL diretto.
-- Lasciamo nessuna policy INSERT/UPDATE/DELETE → blocca da client autenticati.

grant select on admin_coupons to authenticated;
