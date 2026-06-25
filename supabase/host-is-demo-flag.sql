-- MoviQ — Flag is_demo per esentare gli host di vetrina dal gating
-- Gli host con is_demo=true bypassano il check subscription+KYC nella RLS pubblica di cars.
-- Quando arrivano i primi noleggiatori reali, si toglie la flag agli host che non servono più
-- (oppure si cancellano i seed). I noleggiatori reali entrano con is_demo=false (default).
--
-- Idempotente.

alter table hosts add column if not exists is_demo boolean default false;

-- Backfill: tutti gli host senza owner_user_id (= seed iniziali) vengono trattati come demo
update hosts set is_demo = true where owner_user_id is null and (is_demo is null or is_demo = false);

create index if not exists hosts_is_demo_idx on hosts(is_demo) where is_demo;

-- ── Update RLS public read cars: bypass se host.is_demo ─────────────────────
drop policy if exists "public read cars active" on cars;
create policy "public read cars active"
  on cars for select
  using (
    status = 'active'
    and exists (
      select 1 from hosts h
      where h.id = cars.host_id
        and (
          h.is_demo
          or (host_subscription_active(h.id) and host_kyc_approved(h.id))
        )
    )
  );
