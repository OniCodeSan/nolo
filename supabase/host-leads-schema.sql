-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — HOST LEADS (acquisizione noleggiatori da campagne)
-- ═════════════════════════════════════════════════════════════════════════
--
-- Tabella + RPC per la landing /diventa-noleggiatore. Raccoglie i lead degli
-- autonoleggi interessati a entrare sulla piattaforma, agganciando UTM e
-- sessione per l'attribuzione campagna.
--
-- Sicurezza (allineata a security-hardening.sql):
--   • La scrittura passa SOLO da submit_host_lead() (SECURITY DEFINER):
--     niente INSERT diretto, niente policy permissive.
--   • Lettura/gestione solo admin (public.is_admin()), via RPC o policy admin.
--   • submit_host_lead eseguibile da anon+authenticated (la landing è pre-login).
--
-- Idempotente: rieseguibile senza errori. Richiede public.is_admin()
-- (definita in security-hardening.sql §1).
-- ═════════════════════════════════════════════════════════════════════════

-- ─── Tabella ──────────────────────────────────────────────────────────────
create table if not exists public.host_leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  -- Dati attività
  business_name text not null,
  contact_name  text,
  email         text not null,
  phone         text,
  city          text,
  province      text,
  fleet_size    int,
  vehicle_types text,
  website       text,
  message       text,
  -- Workflow commerciale
  status        text not null default 'new',  -- new|contacted|qualified|converted|rejected
  admin_notes   text,
  contacted_at  timestamptz,
  -- Attribuzione campagna (first-touch, dal client)
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  landing_path  text,
  referrer      text,
  session_id    uuid,
  anon_id       text,
  user_agent    text
);

-- Guard status valido (NOT VALID per non fallire su dati legacy eventuali).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'host_leads_status_chk') then
    alter table public.host_leads
      add constraint host_leads_status_chk
      check (status in ('new','contacted','qualified','converted','rejected')) not valid;
  end if;
end $$;

create index if not exists host_leads_created_at_idx on public.host_leads (created_at desc);
create index if not exists host_leads_status_idx     on public.host_leads (status);
create index if not exists host_leads_campaign_idx   on public.host_leads (utm_campaign) where utm_campaign is not null;
create index if not exists host_leads_email_idx      on public.host_leads (lower(email));

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table public.host_leads enable row level security;

-- Nessuna policy INSERT/UPDATE/DELETE: la scrittura passa solo da RPC
-- SECURITY DEFINER. Solo lettura admin per ispezione diretta (in più delle RPC).
drop policy if exists "host_leads admin read" on public.host_leads;
create policy "host_leads admin read"
  on public.host_leads for select to authenticated
  using (public.is_admin());

do $$
begin
  begin
    revoke insert, update, delete on public.host_leads from anon, authenticated;
  exception when others then
    raise notice 'revoke su host_leads saltato: %', sqlerrm;
  end;
end $$;

-- ─── RPC: submit_host_lead ──────────────────────────────────────────────────
-- Inserisce un lead. Validazione + cap di lunghezza + anti-doppio-invio
-- (stesso indirizzo email negli ultimi 30s → ritorna il lead esistente).
create or replace function public.submit_host_lead(
  p_business_name text,
  p_email         text,
  p_contact_name  text default null,
  p_phone         text default null,
  p_city          text default null,
  p_province      text default null,
  p_fleet_size    int  default null,
  p_vehicle_types text default null,
  p_website       text default null,
  p_message       text default null,
  p_utm_source    text default null,
  p_utm_medium    text default null,
  p_utm_campaign  text default null,
  p_utm_term      text default null,
  p_utm_content   text default null,
  p_landing_path  text default null,
  p_referrer      text default null,
  p_session_id    uuid default null,
  p_anon_id       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(trim(left(coalesce(p_email, ''), 254)));
  v_biz   text := nullif(trim(left(coalesce(p_business_name, ''), 160)), '');
  v_id    uuid;
  v_recent uuid;
begin
  -- Validazione minima
  if v_biz is null then
    raise exception 'Il nome dell''attività è obbligatorio.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Email non valida.';
  end if;

  -- Anti-doppio-invio: stesso email negli ultimi 30s → ritorna l'esistente
  select id into v_recent
    from public.host_leads
   where lower(email) = v_email
     and created_at > now() - interval '30 seconds'
   order by created_at desc
   limit 1;
  if v_recent is not null then
    return v_recent;
  end if;

  insert into public.host_leads (
    business_name, email, contact_name, phone, city, province,
    fleet_size, vehicle_types, website, message,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    landing_path, referrer, session_id, anon_id, user_agent
  ) values (
    v_biz,
    v_email,
    nullif(trim(left(coalesce(p_contact_name, ''), 120)), ''),
    nullif(trim(left(coalesce(p_phone, ''), 40)), ''),
    nullif(trim(left(coalesce(p_city, ''), 120)), ''),
    nullif(trim(left(coalesce(p_province, ''), 4)), ''),
    case when p_fleet_size between 0 and 100000 then p_fleet_size else null end,
    nullif(trim(left(coalesce(p_vehicle_types, ''), 240)), ''),
    nullif(trim(left(coalesce(p_website, ''), 240)), ''),
    nullif(left(coalesce(p_message, ''), 2000), ''),
    nullif(trim(left(coalesce(p_utm_source, ''),   128)), ''),
    nullif(trim(left(coalesce(p_utm_medium, ''),   128)), ''),
    nullif(trim(left(coalesce(p_utm_campaign, ''), 128)), ''),
    nullif(trim(left(coalesce(p_utm_term, ''),     128)), ''),
    nullif(trim(left(coalesce(p_utm_content, ''),  128)), ''),
    nullif(trim(left(coalesce(p_landing_path, ''), 256)), ''),
    nullif(trim(left(coalesce(p_referrer, ''),     256)), ''),
    p_session_id,
    nullif(trim(left(coalesce(p_anon_id, ''), 128)), ''),
    nullif(trim(left(coalesce(current_setting('request.headers', true)::json->>'user-agent', ''), 512)), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.submit_host_lead is
  'Crea un lead noleggiatore dalla landing campagne. SECURITY DEFINER: unico canale di scrittura su host_leads. Eseguibile da anon (pre-login).';

revoke all on function public.submit_host_lead(
  text, text, text, text, text, text, int, text, text, text,
  text, text, text, text, text, text, text, uuid, text
) from public;
grant execute on function public.submit_host_lead(
  text, text, text, text, text, text, int, text, text, text,
  text, text, text, text, text, text, text, uuid, text
) to anon, authenticated;

-- ─── RPC admin: lista lead ──────────────────────────────────────────────────
create or replace function public.admin_list_host_leads(
  p_status text default null,
  p_limit  int  default 200,
  p_offset int  default 0
)
returns setof public.host_leads
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  return query
    select *
      from public.host_leads
     where (p_status is null or status = p_status)
     order by created_at desc
     limit greatest(1, least(coalesce(p_limit, 200), 1000))
    offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_host_leads(text, int, int) from public, anon;
grant execute on function public.admin_list_host_leads(text, int, int) to authenticated;

-- ─── RPC admin: aggiorna stato lead ─────────────────────────────────────────
create or replace function public.admin_set_lead_status(
  p_id     uuid,
  p_status text,
  p_notes  text default null
)
returns public.host_leads
language plpgsql
security definer
set search_path = public
as $$
declare l public.host_leads;
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  if p_status not in ('new','contacted','qualified','converted','rejected') then
    raise exception 'stato non valido';
  end if;

  update public.host_leads
     set status       = p_status,
         admin_notes  = coalesce(nullif(left(p_notes, 2000), ''), admin_notes),
         contacted_at = case
                          when p_status = 'contacted' and contacted_at is null then now()
                          else contacted_at
                        end
   where id = p_id
   returning * into l;
  if not found then raise exception 'lead non trovato'; end if;
  return l;
end;
$$;

revoke all on function public.admin_set_lead_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_lead_status(uuid, text, text) to authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- ✅ VERIFICA (leggono solo)
--   select count(*) from public.host_leads;
--   select relrowsecurity from pg_class where relname='host_leads';   -- true
--   select proname, prosecdef from pg_proc
--    where proname in ('submit_host_lead','admin_list_host_leads','admin_set_lead_status');
-- ═════════════════════════════════════════════════════════════════════════
