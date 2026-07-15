-- ═══════════════════════════════════════════════════════════════════════
-- Comunicazioni admin agli host + countdown cancellazione 60 giorni
-- Eseguire nel SQL Editor. Richiede: pg_net (già usato dai trigger email),
-- get_service_role_key() (già presente), public.is_admin().
-- ═══════════════════════════════════════════════════════════════════════
begin;

-- Countdown cancellazione (valorizzato quando parte la comunicazione "60 giorni")
alter table public.hosts
  add column if not exists deletion_deadline timestamptz;
comment on column public.hosts.deletion_deadline is
  'Scadenza oltre la quale l''account host viene cancellato (impostata dall''email host_no_subscription_suspended). NULL = nessun countdown.';

-- ───────────────────────────────────────────────────────────────────────
-- RPC: invio comunicazione admin → host. Applica anche l'effetto collegato
-- (sospensione / riattivazione / countdown) e manda l'email via send-email.
-- ───────────────────────────────────────────────────────────────────────
create or replace function public.admin_send_host_email(
  p_host_id  text,
  p_template text,
  p_reason   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  h          public.hosts;
  url        text := 'https://togcwgymwrnhiihduapb.supabase.co/functions/v1/send-email';
  api_key    text := get_service_role_key();
  host_email text;
  v_vars     jsonb;
  v_deadline timestamptz;
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only';
  end if;
  if p_template not in ('host_suspended','host_reactivated','host_no_subscription_suspended') then
    raise exception 'template non ammesso: %', p_template;
  end if;

  select * into h from public.hosts where id = p_host_id;
  if not found then raise exception 'host non trovato'; end if;

  host_email := coalesce(h.business_email,
                         (select email from auth.users where id = h.owner_user_id));
  if host_email is null then raise exception 'email host non disponibile'; end if;

  -- Effetti + variabili per template
  if p_template = 'host_suspended' then
    update public.hosts
       set status = 'suspended', suspended_at = now(),
           moderation_notes = coalesce(p_reason, moderation_notes), updated_at = now()
     where id = p_host_id;
    v_vars := jsonb_build_object(
      'host_name', coalesce(h.legal_name, h.name, 'noleggiatore'),
      'reason', coalesce(p_reason, 'Violazione delle condizioni di servizio.'));

  elsif p_template = 'host_no_subscription_suspended' then
    v_deadline := now() + interval '60 days';
    update public.hosts
       set status = 'suspended', suspended_at = now(),
           deletion_deadline = v_deadline,
           moderation_notes = coalesce(p_reason, moderation_notes), updated_at = now()
     where id = p_host_id;
    v_vars := jsonb_build_object(
      'host_name', coalesce(h.legal_name, h.name, 'noleggiatore'),
      'delete_date', to_char(v_deadline at time zone 'Europe/Rome', 'DD/MM/YYYY'),
      'billing_url', 'https://moviq.it/noleggia/abbonamento');

  else -- host_reactivated
    update public.hosts
       set status = 'verified', deletion_deadline = null, updated_at = now()
     where id = p_host_id;
    v_vars := jsonb_build_object(
      'host_name', coalesce(h.legal_name, h.name, 'noleggiatore'));
  end if;

  -- Invio email (best-effort: se pg_net/chiave mancano, l'effetto sopra resta)
  if url is not null and api_key is not null then
    perform net.http_post(
      url     := url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || api_key),
      body    := jsonb_build_object('to', host_email, 'to_user_id', h.owner_user_id,
                                    'template', p_template, 'vars', v_vars)
    );
  end if;

  return jsonb_build_object('ok', true, 'sent_to', host_email, 'template', p_template,
                           'deletion_deadline', v_deadline);
end $$;

revoke all on function public.admin_send_host_email(text,text,text) from public, anon;
grant execute on function public.admin_send_host_email(text,text,text) to authenticated;

commit;

-- ═══════════════════════════════════════════════════════════════════════
-- AUTOMAZIONE CANCELLAZIONE (opt-in) — ⚠️ DISTRUTTIVA
-- Cancella gli host il cui countdown è scaduto e che NON hanno attivato
-- l'abbonamento. Richiede l'estensione pg_cron abilitata.
-- Verifica le cascade prima di attivarla in produzione.
-- ═══════════════════════════════════════════════════════════════════════
create or replace function public.purge_expired_hosts()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  n int := 0;
begin
  for r in
    select h.id, h.owner_user_id
      from public.hosts h
     where h.deletion_deadline is not null
       and h.deletion_deadline < now()
       and h.status = 'suspended'
       and not host_subscription_active(h.id)   -- salva chi ha attivato nel frattempo
  loop
    -- Cancella i dati collegati poi l'utente auth (cascade dove configurato).
    delete from public.cars where host_id = r.id;
    delete from public.hosts where id = r.id;
    if r.owner_user_id is not null then
      delete from auth.users where id = r.owner_user_id;
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Per ATTIVARE la cancellazione automatica giornaliera (dopo aver abilitato
-- pg_cron da Dashboard → Database → Extensions), togli il commento:
--
--   create extension if not exists pg_cron;
--   select cron.schedule('purge-expired-hosts', '0 3 * * *',
--     $cron$ select public.purge_expired_hosts() $cron$);
--
-- Finché non lo attivi, il countdown è solo informativo (visibile in /admin).
