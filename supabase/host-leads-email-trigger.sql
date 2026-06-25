-- MoviQ — Trigger DB → Edge Function send-email per i lead noleggiatori
-- Quando un lead viene inserito in host_leads (via submit_host_lead), invia
-- una email di conferma all'indirizzo del lead.
--
-- DIPENDENZE:
--   • pg_net (Supabase lo installa di default)
--   • get_service_role_key() + GUC app.service_role_key già configurate
--     (stesse di booking-email-triggers.sql)
--   • Edge Function `send-email` deployata CON il nuovo template
--     'host_lead_received' (redeploy dopo aver modificato _shared/email-templates.ts)
--   • host-leads-schema.sql già applicato
--
-- Esegui DOPO host-leads-schema.sql. Idempotente.

create extension if not exists pg_net;

create or replace function public.notify_host_lead_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  url     text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/send-email';
  api_key text := get_service_role_key();
begin
  if api_key is null then
    raise warning '[host-lead-email] app.service_role_key non configurata nelle GUC';
    return new;
  end if;

  -- pg_net.http_post è async: non blocca l'insert del lead.
  perform net.http_post(
    url    := url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key
    ),
    body   := jsonb_build_object(
      'to',       new.email,
      'template', 'host_lead_received',
      'vars',     jsonb_build_object(
        'greeting_name', coalesce(nullif(new.contact_name, ''), new.business_name),
        'business_name', new.business_name
      )
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_host_leads_email on public.host_leads;
create trigger trg_host_leads_email
  after insert on public.host_leads
  for each row execute function public.notify_host_lead_email();

-- ─── Verifica ───────────────────────────────────────────────────────────────
--   select tgname from pg_trigger where tgname = 'trg_host_leads_email';
--   -- dopo un invio dalla landing: select * from email_log
--   --   where template='host_lead_received' order by created_at desc limit 5;
