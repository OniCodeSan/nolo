-- ============================================================
-- UTM tracking on user_sessions + admin overview
-- ============================================================

-- 1) colonne UTM (idempotente)
alter table public.user_sessions
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term     text,
  add column if not exists utm_content  text,
  add column if not exists landing_path text;

create index if not exists user_sessions_utm_source_idx   on public.user_sessions (utm_source)   where utm_source is not null;
create index if not exists user_sessions_utm_campaign_idx on public.user_sessions (utm_campaign) where utm_campaign is not null;
create index if not exists user_sessions_started_at_idx   on public.user_sessions (started_at);

-- 2) ping_session aggiornata: accetta UTM (first-touch, non sovrascrive)
create or replace function public.ping_session(
  p_session_id   uuid     default null,
  p_anon_id      text     default null,
  p_ip           text     default null,
  p_country      text     default null,
  p_region       text     default null,
  p_city         text     default null,
  p_user_agent   text     default null,
  p_referrer     text     default null,
  p_utm_source   text     default null,
  p_utm_medium   text     default null,
  p_utm_campaign text     default null,
  p_utm_term     text     default null,
  p_utm_content  text     default null,
  p_landing_path text     default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_id uuid := p_session_id;
begin
  if v_id is null then
    insert into user_sessions (
      user_id, anon_id, ip, country, region, city, user_agent, referrer,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_path
    ) values (
      auth.uid(), p_anon_id, p_ip, p_country, p_region, p_city, p_user_agent, p_referrer,
      nullif(trim(p_utm_source), ''),
      nullif(trim(p_utm_medium), ''),
      nullif(trim(p_utm_campaign), ''),
      nullif(trim(p_utm_term), ''),
      nullif(trim(p_utm_content), ''),
      nullif(trim(p_landing_path), '')
    )
    returning id into v_id;
  else
    update user_sessions
       set last_ping_at = now(),
           pages_viewed = pages_viewed + 1,
           user_id      = coalesce(user_id, auth.uid()),
           -- first-touch attribution: non sovrascriviamo se già impostato
           utm_source   = coalesce(utm_source,   nullif(trim(p_utm_source),   '')),
           utm_medium   = coalesce(utm_medium,   nullif(trim(p_utm_medium),   '')),
           utm_campaign = coalesce(utm_campaign, nullif(trim(p_utm_campaign), '')),
           utm_term     = coalesce(utm_term,     nullif(trim(p_utm_term),     '')),
           utm_content  = coalesce(utm_content,  nullif(trim(p_utm_content),  '')),
           landing_path = coalesce(landing_path, nullif(trim(p_landing_path), '')),
           referrer     = coalesce(referrer,     p_referrer),
           country      = coalesce(country,      p_country),
           region       = coalesce(region,       p_region),
           city         = coalesce(city,         p_city),
           ip           = coalesce(ip,           p_ip)
     where id = v_id;
    if not found then
      insert into user_sessions (
        user_id, anon_id, ip, country, region, city, user_agent, referrer,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_path
      ) values (
        auth.uid(), p_anon_id, p_ip, p_country, p_region, p_city, p_user_agent, p_referrer,
        nullif(trim(p_utm_source), ''),
        nullif(trim(p_utm_medium), ''),
        nullif(trim(p_utm_campaign), ''),
        nullif(trim(p_utm_term), ''),
        nullif(trim(p_utm_content), ''),
        nullif(trim(p_landing_path), '')
      )
      returning id into v_id;
    end if;
  end if;
  return v_id;
end;
$$;

grant execute on function public.ping_session(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;

-- 3) RPC admin: overview UTM ultimi 30gg
create or replace function public.admin_utm_overview()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_is_admin boolean;
  v_result jsonb;
begin
  select is_admin into v_is_admin from public.profiles where user_id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'admin only';
  end if;

  with recent as (
    select * from public.user_sessions
     where started_at >= now() - interval '30 days'
  ),
  by_src as (
    select coalesce(utm_source, '(direct)') as k, count(*)::int as v
    from recent group by 1 order by 2 desc limit 12
  ),
  by_med as (
    select coalesce(utm_medium, '(none)') as k, count(*)::int as v
    from recent where utm_source is not null group by 1 order by 2 desc limit 12
  ),
  by_camp as (
    select utm_campaign as k, count(*)::int as v,
           count(distinct anon_id)::int as visitors
    from recent where utm_campaign is not null
    group by 1 order by 2 desc limit 20
  ),
  by_landing as (
    select coalesce(landing_path, '/') as k, count(*)::int as v
    from recent where utm_source is not null
    group by 1 order by 2 desc limit 10
  ),
  totals as (
    select
      count(*) filter (where utm_source is not null)::int as utm_sessions,
      count(*)::int as total_sessions,
      count(distinct anon_id) filter (where utm_source is not null)::int as utm_visitors
    from recent
  )
  select jsonb_build_object(
    'utm_sessions',  (select utm_sessions  from totals),
    'utm_visitors',  (select utm_visitors  from totals),
    'total_sessions',(select total_sessions from totals),
    'by_source',     coalesce((select jsonb_object_agg(k, v) from by_src),     '{}'::jsonb),
    'by_medium',     coalesce((select jsonb_object_agg(k, v) from by_med),     '{}'::jsonb),
    'by_landing',    coalesce((select jsonb_object_agg(k, v) from by_landing), '{}'::jsonb),
    'campaigns',     coalesce((
        select jsonb_agg(jsonb_build_object('campaign', k, 'sessions', v, 'visitors', visitors))
        from by_camp
      ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end $$;

revoke execute on function public.admin_utm_overview() from public, anon;
grant  execute on function public.admin_utm_overview() to authenticated;
