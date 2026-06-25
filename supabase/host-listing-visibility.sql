-- MoviQ — Visibilità inserzioni in funzione di subscription + KYC
-- Quando un host:
--   • finisce il trial senza pagamento valido (Stripe cancella la sub) → status = canceled
--   • subisce `past_due` per troppo tempo → status = unpaid
--   • disattiva manualmente → status = canceled
-- Allora le sue auto vengono OSCURATE dalle SELECT pubbliche (anon/utenti non-owner).
-- L'owner vede sempre le proprie (per poter riattivare e gestire); l'admin vede tutto.
--
-- Idempotente: si può rieseguire.

drop policy if exists "public read cars"          on cars;
drop policy if exists "public read cars active"   on cars;

-- ── Pubblico (anon + authenticated non-owner) ───────────────────────────────
-- Vede SOLO veicoli:
--   • con status applicativo = 'active' (l'host li ha messi online)
--   • il cui host ha subscription attiva (trialing | active | past_due)
--   • il cui host ha KYC approvato
create policy "public read cars active"
  on cars for select
  using (
    status = 'active'
    and host_subscription_active(host_id)
    and host_kyc_approved(host_id)
  );

-- Owner vede SEMPRE le proprie (anche se sub scaduta o KYC pending — serve per riattivare)
-- La policy "cars owner read" esiste già da host-vehicles-schema.sql. La rifacciamo idempotente.
drop policy if exists "cars owner read" on cars;
create policy "cars owner read"
  on cars for select
  using (
    auth.uid() is not null and exists (
      select 1 from hosts where hosts.id = cars.host_id and hosts.owner_user_id = auth.uid()
    )
  );

-- Admin vede tutto (idempotente)
drop policy if exists "cars admin read" on cars;
create policy "cars admin read"
  on cars for select
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

-- ============================================================
-- View comoda per il backoffice: stato visibilità di ogni veicolo dell'host.
-- Risponde alla domanda "perché il mio veicolo è oscurato?"
-- ============================================================
create or replace view host_cars_visibility as
select
  c.id            as car_id,
  c.host_id,
  c.status        as car_status,
  hsa.is_active   as subscription_active,
  hk.kyc_status,
  case
    when c.status <> 'active' then 'bozza'
    when not coalesce(hsa.is_active, false) then 'oscurato_abbonamento'
    when coalesce(hk.kyc_status, 'pending') <> 'approved' then 'oscurato_kyc'
    else 'pubblicato'
  end as visibility_state
from cars c
left join host_subscription_status hsa on hsa.host_id = c.host_id
left join hosts hk on hk.id = c.host_id;

grant select on host_cars_visibility to authenticated;

-- ============================================================
-- Cron pre-fine-trial: reminder a 7gg e 1gg (Stripe manda nativamente solo 3gg via trial_will_end).
-- Idempotente: skip se email già mandata per quel booking/host.
-- ============================================================
create or replace function cron_send_trial_reminders()
returns void language plpgsql security definer set search_path = public as $$
declare
  r record;
  url     text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/send-email';
  api_key text := get_service_role_key();
begin
  if url is null or api_key is null then return; end if;

  -- 7 giorni prima del fine trial
  for r in
    select hs.host_id, hs.trial_end, h.name, h.business_email, h.owner_user_id, u.email as user_email
    from host_subscriptions hs
    join hosts h on h.id = hs.host_id
    left join auth.users u on u.id = h.owner_user_id
    where hs.status = 'trialing'
      and hs.trial_end between (now() + interval '6 days 12 hours') and (now() + interval '7 days 12 hours')
      and not exists (
        select 1 from email_log el
        where el.template = 'host_subscription_trial_ending'
          and el.to_user_id = h.owner_user_id
          and el.created_at > (hs.trial_end - interval '8 days')
      )
  loop
    perform net.http_post(
      url    := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body   := jsonb_build_object(
        'to', coalesce(r.business_email, r.user_email),
        'to_user_id', r.owner_user_id,
        'template', 'host_subscription_trial_ending',
        'vars', jsonb_build_object(
          'host_name', coalesce(r.name, 'noleggiatore'),
          'trial_end_date', to_char(r.trial_end, 'DD Month YYYY'),
          'price_eur', '49',
          'billing_url', 'https://moviq.it/noleggia/abbonamento'
        )
      )
    );
  end loop;

  -- 1 giorno prima del fine trial (anti-spam: solo se l'ultimo invio è stato >18h fa)
  for r in
    select hs.host_id, hs.trial_end, h.name, h.business_email, h.owner_user_id, u.email as user_email
    from host_subscriptions hs
    join hosts h on h.id = hs.host_id
    left join auth.users u on u.id = h.owner_user_id
    where hs.status = 'trialing'
      and hs.trial_end between (now() + interval '12 hours') and (now() + interval '36 hours')
      and not exists (
        select 1 from email_log el
        where el.template = 'host_subscription_trial_ending'
          and el.to_user_id = h.owner_user_id
          and el.created_at > now() - interval '18 hours'
      )
  loop
    perform net.http_post(
      url    := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body   := jsonb_build_object(
        'to', coalesce(r.business_email, r.user_email),
        'to_user_id', r.owner_user_id,
        'template', 'host_subscription_trial_ending',
        'vars', jsonb_build_object(
          'host_name', coalesce(r.name, 'noleggiatore'),
          'trial_end_date', to_char(r.trial_end, 'DD Month YYYY'),
          'price_eur', '49',
          'billing_url', 'https://moviq.it/noleggia/abbonamento'
        )
      )
    );
  end loop;
end $$;

select cron.unschedule('moviq-trial-reminders') where exists (select 1 from cron.job where jobname = 'moviq-trial-reminders');
select cron.schedule('moviq-trial-reminders', '0 9 * * *', $$select cron_send_trial_reminders();$$);

-- ============================================================
-- Trigger DB: KYC approvato/rifiutato → invia email all'host
-- ============================================================
create or replace function notify_kyc_decision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  url     text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/send-email';
  api_key text := get_service_role_key();
  host_email text;
begin
  if url is null or api_key is null then return new; end if;
  if new.kyc_status not in ('approved','rejected') then return new; end if;
  if old.kyc_status = new.kyc_status then return new; end if;

  -- Recupera email host: business_email se valorizzata, altrimenti email dell'owner
  host_email := new.business_email;
  if host_email is null and new.owner_user_id is not null then
    select email into host_email from auth.users where id = new.owner_user_id;
  end if;
  if host_email is null then return new; end if;

  if new.kyc_status = 'approved' then
    perform net.http_post(
      url    := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body   := jsonb_build_object(
        'to', host_email,
        'to_user_id', new.owner_user_id,
        'template', 'host_kyc_approved',
        'vars', jsonb_build_object(
          'host_name', coalesce(new.legal_name, new.name, 'noleggiatore'),
          'backoffice_url', 'https://moviq.it/noleggia'
        )
      )
    );
  else
    perform net.http_post(
      url    := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body   := jsonb_build_object(
        'to', host_email,
        'to_user_id', new.owner_user_id,
        'template', 'host_kyc_rejected',
        'vars', jsonb_build_object(
          'reason', coalesce(new.kyc_rejection_reason, 'Dati incompleti'),
          'verify_url', 'https://moviq.it/noleggia/verifica'
        )
      )
    );
  end if;
  return new;
end $$;

drop trigger if exists trg_hosts_kyc_email on hosts;
create trigger trg_hosts_kyc_email
  after update of kyc_status on hosts
  for each row execute function notify_kyc_decision();
