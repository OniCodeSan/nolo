-- MoviQ — Trigger DB → Edge Function booking-emails
-- Quando una booking cambia stato, postiamo l'evento alla Edge Function
-- che spedisce l'email transazionale appropriata.
--
-- DIPENDENZE: serve l'estensione pg_net (Supabase la installa di default).
-- Esegui DOPO email-log-schema.sql e dopo aver deployato `booking-emails`.

create extension if not exists pg_net;

-- ============================================================
-- Settings da inserire UNA TANTUM nelle GUC del progetto Supabase:
--   Dashboard → Project Settings → Database → Custom Postgres Config:
--     app.supabase_url = https://<REF>.supabase.co
--     app.service_role_key = <SUPABASE_SERVICE_ROLE_KEY>
-- ============================================================

create or replace function notify_booking_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_name text;
  payload    jsonb;
  url        text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/booking-emails';
  api_key    text := get_service_role_key();
begin
  -- Determina quale evento
  if TG_OP = 'INSERT' and new.status = 'requested' then
    event_name := 'created';
  elsif TG_OP = 'UPDATE' and new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    event_name := 'confirmed';
  elsif TG_OP = 'UPDATE' and new.status = 'declined' and old.status is distinct from 'declined' then
    event_name := 'rejected';
  else
    return new;
  end if;

  if url is null or api_key is null then
    raise warning '[booking-email] app.supabase_url o app.service_role_key non configurati nelle GUC';
    return new;
  end if;

  payload := jsonb_build_object('event', event_name, 'booking_id', new.id);

  -- pg_net.http_post è async — non blocca la transazione di booking
  perform net.http_post(
    url    := url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key
    ),
    body   := payload
  );

  return new;
end;
$$;

drop trigger if exists trg_bookings_email_insert on bookings;
create trigger trg_bookings_email_insert
  after insert on bookings
  for each row execute function notify_booking_email();

drop trigger if exists trg_bookings_email_update on bookings;
create trigger trg_bookings_email_update
  after update of status on bookings
  for each row execute function notify_booking_email();

-- ============================================================
-- Cron jobs: reminder 24h prima del ritiro + review request 24h dopo riconsegna
-- Richiede pg_cron (preinstallato su Supabase).
-- ============================================================
create extension if not exists pg_cron;

-- Cron 1: ogni ora controlla booking che ritirano nelle prossime 23-25 ore
create or replace function cron_send_pickup_reminders()
returns void language plpgsql security definer set search_path = public as $$
declare
  r record;
  url     text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/booking-emails';
  api_key text := get_service_role_key();
begin
  if url is null or api_key is null then return; end if;

  for r in
    select id from bookings
    where status = 'confirmed'
      and date_from between (current_date + interval '23 hours')::date and (current_date + interval '25 hours')::date
      -- Evita doppi invii (controllo nel log)
      and not exists (
        select 1 from email_log el
        where el.template = 'booking_reminder_24h'
          and el.payload->>'booking_id' = bookings.id::text
      )
  loop
    perform net.http_post(
      url    := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body   := jsonb_build_object('event','reminder24h','booking_id', r.id)
    );
  end loop;
end $$;

-- Cron 2: ogni 6 ore, manda review request a chi ha terminato il noleggio ieri
create or replace function cron_send_review_requests()
returns void language plpgsql security definer set search_path = public as $$
declare
  r record;
  url     text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/booking-emails';
  api_key text := get_service_role_key();
begin
  if url is null or api_key is null then return; end if;

  for r in
    select id from bookings
    where status in ('confirmed','completed')
      and date_to = (current_date - interval '1 day')::date
      and not exists (
        select 1 from email_log el
        where el.template = 'review_request'
          and el.payload->>'booking_id' = bookings.id::text
      )
  loop
    perform net.http_post(
      url    := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body   := jsonb_build_object('event','review_request','booking_id', r.id)
    );
  end loop;
end $$;

-- Schedula i cron job (rimuovi se già esistenti per re-deploy idempotente)
select cron.unschedule('moviq-booking-reminder')  where exists (select 1 from cron.job where jobname = 'moviq-booking-reminder');
select cron.unschedule('moviq-review-request')    where exists (select 1 from cron.job where jobname = 'moviq-review-request');

select cron.schedule('moviq-booking-reminder', '0 * * * *',     $$select cron_send_pickup_reminders();$$);
select cron.schedule('moviq-review-request',   '0 */6 * * *',   $$select cron_send_review_requests();$$);
