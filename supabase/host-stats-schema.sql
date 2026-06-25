-- MoviQ statistics — tracking views + RPC aggregate per host e mercato.
-- Esegui DOPO host-bookings-complete.sql.

-- ============ TRACKING VIEWS ============
create table if not exists car_views (
  id              bigserial primary key,
  car_id          text not null references cars(id) on delete cascade,
  viewer_user_id  uuid references auth.users(id) on delete set null,
  source          text default 'direct',   -- 'search' / 'category' / 'direct' / 'shared'
  viewed_at       timestamptz not null default now()
);
create index if not exists car_views_car_idx     on car_views(car_id, viewed_at desc);
create index if not exists car_views_date_idx    on car_views(viewed_at desc);

-- RLS: insert pubblico (chiunque può loggare), read solo all'host proprietario
alter table car_views enable row level security;

drop policy if exists "car_views public insert" on car_views;
drop policy if exists "car_views host read"     on car_views;

create policy "car_views public insert"
  on car_views for insert with check (true);

create policy "car_views host read"
  on car_views for select using (
    auth.uid() is not null
    and exists (
      select 1 from cars c
        join hosts h on h.id = c.host_id
       where c.id = car_views.car_id
         and h.owner_user_id = auth.uid()
    )
  );

-- Log idempotente per sessione: la stessa view consecutiva entro 5 min non viene contata 2 volte
create or replace function log_car_view(p_car_id text, p_source text default 'direct')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  recent_exists boolean;
begin
  if uid is null then
    insert into car_views (car_id, source) values (p_car_id, p_source);
    return;
  end if;
  select exists (
    select 1 from car_views
     where car_id = p_car_id
       and viewer_user_id = uid
       and viewed_at > now() - interval '5 minutes'
  ) into recent_exists;
  if not recent_exists then
    insert into car_views (car_id, viewer_user_id, source) values (p_car_id, uid, p_source);
  end if;
end;
$$;

-- ============ HOST STATS ============
create or replace function host_stats(p_host_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  v_owner uuid;
begin
  -- Verifica ownership (anche se la security definer bypassa RLS)
  select owner_user_id into v_owner from hosts where id = p_host_id;
  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'unauthorized';
  end if;

  with my_cars as (
    select id, brand, model, year, category, price_per_day, status, variant, tone
      from cars where host_id = p_host_id
  ),
  base as (
    select
      (select count(*) from my_cars) as cars_count,
      (select count(*) from my_cars where status = 'active') as active_cars,
      (select count(*) from my_cars where status = 'draft') as draft_cars,
      (select count(*) from my_cars where status = 'disabled') as disabled_cars
  ),
  views_agg as (
    select
      (select count(*) from car_views v join my_cars c on c.id = v.car_id) as views_total,
      (select count(*) from car_views v join my_cars c on c.id = v.car_id where v.viewed_at > now() - interval '30 days') as views_30d,
      (select count(*) from car_views v join my_cars c on c.id = v.car_id where v.viewed_at > now() - interval '7 days') as views_7d,
      (select count(*) from car_views v join my_cars c on c.id = v.car_id where v.viewed_at > now() - interval '30 days' - interval '30 days' and v.viewed_at <= now() - interval '30 days') as views_prev_30d
  ),
  saved_agg as (
    select count(*) as saved_total from saved_cars s join my_cars c on c.id = s.car_id
  ),
  bk_my as (
    select b.* from bookings b join my_cars c on c.id = b.car_id
  ),
  bk_counts as (
    select
      (select count(*) from bk_my) as bookings_total,
      (select count(*) from bk_my where status = 'requested') as bookings_pending,
      (select count(*) from bk_my where status = 'confirmed') as bookings_confirmed,
      (select count(*) from bk_my where status = 'declined') as bookings_declined,
      (select count(*) from bk_my where status = 'completed') as bookings_completed,
      (select count(*) from bk_my where status = 'cancelled') as bookings_cancelled
  ),
  revenue_agg as (
    select
      coalesce(sum(total),0) as revenue_total,
      coalesce(sum(total) filter (where created_at > now() - interval '30 days'),0) as revenue_30d,
      coalesce(sum(total) filter (where created_at > now() - interval '7 days'),0) as revenue_7d
    from bk_my where status in ('confirmed','completed')
  ),
  top_views as (
    select jsonb_agg(t order by t.views_30d desc) as data
    from (
      select c.id as car_id,
             concat(c.brand, ' ', c.model) as name,
             c.variant, c.tone,
             count(v.id) as views_30d,
             (select count(*) from saved_cars s where s.car_id = c.id) as saved
        from my_cars c
        left join car_views v
          on v.car_id = c.id and v.viewed_at > now() - interval '30 days'
       group by c.id, c.brand, c.model, c.variant, c.tone
       order by count(v.id) desc
       limit 5
    ) t
  ),
  top_saved as (
    select jsonb_agg(t order by t.saved desc) as data
    from (
      select c.id as car_id,
             concat(c.brand, ' ', c.model) as name,
             c.variant, c.tone,
             count(s.car_id) as saved
        from my_cars c
        left join saved_cars s on s.car_id = c.id
       group by c.id, c.brand, c.model, c.variant, c.tone
       order by count(s.car_id) desc
       limit 5
    ) t
  ),
  top_revenue as (
    select jsonb_agg(t order by t.revenue desc) as data
    from (
      select c.id as car_id,
             concat(c.brand, ' ', c.model) as name,
             c.variant, c.tone,
             coalesce(sum(b.total),0) as revenue,
             count(b.id) as bookings_count
        from my_cars c
        left join bk_my b on b.car_id = c.id and b.status in ('confirmed','completed')
       group by c.id, c.brand, c.model, c.variant, c.tone
       having coalesce(sum(b.total),0) > 0
       order by sum(b.total) desc nulls last
       limit 5
    ) t
  ),
  monthly as (
    select jsonb_agg(t order by t.month) as data
    from (
      select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
             count(*) as count,
             coalesce(sum(total) filter (where status in ('confirmed','completed')),0) as revenue
        from bk_my
       where created_at > now() - interval '12 months'
       group by date_trunc('month', created_at)
    ) t
  ),
  weekday as (
    select jsonb_agg(t order by t.weekday) as data
    from (
      select extract(dow from date_from)::int as weekday,
             count(*) as count
        from bk_my where status in ('confirmed','completed')
       group by extract(dow from date_from)
    ) t
  )
  select jsonb_build_object(
    'cars',           jsonb_build_object('total', b.cars_count, 'active', b.active_cars, 'draft', b.draft_cars, 'disabled', b.disabled_cars),
    'views',          jsonb_build_object('total', va.views_total, 'd30', va.views_30d, 'd7', va.views_7d, 'prev_30d', va.views_prev_30d),
    'saved_total',    s.saved_total,
    'bookings',       jsonb_build_object('total', bc.bookings_total, 'pending', bc.bookings_pending, 'confirmed', bc.bookings_confirmed, 'declined', bc.bookings_declined, 'completed', bc.bookings_completed, 'cancelled', bc.bookings_cancelled),
    'revenue',        jsonb_build_object('total', ra.revenue_total, 'd30', ra.revenue_30d, 'd7', ra.revenue_7d),
    'conversion_rate', case when bc.bookings_total > 0 then round( ((bc.bookings_confirmed + bc.bookings_completed)::numeric / bc.bookings_total) * 100, 1) else 0 end,
    'top_cars_views', coalesce(tv.data, '[]'::jsonb),
    'top_cars_saved', coalesce(ts.data, '[]'::jsonb),
    'top_cars_revenue', coalesce(tr.data, '[]'::jsonb),
    'monthly',        coalesce(m.data, '[]'::jsonb),
    'weekday',        coalesce(w.data, '[]'::jsonb)
  ) into result
  from base b, views_agg va, saved_agg s, bk_counts bc, revenue_agg ra,
       top_views tv, top_saved ts, top_revenue tr, monthly m, weekday w;
  return result;
end;
$$;

-- ============ MARKET STATS (visibili a tutti, benchmark) ============
create or replace function market_stats()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with bk as (
    select b.status, b.created_at, b.date_from,
           c.category, c.price_per_day, c.brand_id, c.model_id, c.brand, c.model
      from bookings b
      join cars c on c.id = b.car_id
     where b.created_at > now() - interval '12 months'
  ),
  top_models as (
    select jsonb_agg(t order by t.bookings desc) as data
    from (
      select coalesce(model_id, lower(brand || '-' || model)) as model_key,
             brand, model,
             count(*) as bookings,
             round(avg(price_per_day))::int as avg_price
        from bk
       where status in ('confirmed','completed')
       group by coalesce(model_id, lower(brand || '-' || model)), brand, model
       order by count(*) desc
       limit 10
    ) t
  ),
  segments as (
    select jsonb_agg(t order by t.bookings desc) as data
    from (
      select category,
             count(*) as bookings,
             round(avg(price_per_day))::int as avg_price,
             min(price_per_day) as min_price,
             max(price_per_day) as max_price
        from bk
       where status in ('confirmed','completed')
         and category is not null
       group by category
    ) t
  ),
  avg_by_segment_all as (
    select jsonb_agg(t order by t.avg_price desc) as data
    from (
      select category,
             round(avg(price_per_day))::int as avg_price,
             min(price_per_day) as min_price,
             max(price_per_day) as max_price,
             count(*) as cars_count
        from cars
       where status = 'active' and category is not null
       group by category
    ) t
  ),
  monthly_demand as (
    select jsonb_agg(t order by t.month) as data
    from (
      select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
             count(*) as count
        from bk
       group by date_trunc('month', created_at)
    ) t
  ),
  weekday_demand as (
    select jsonb_agg(t order by t.weekday) as data
    from (
      select extract(dow from date_from)::int as weekday,
             count(*) as count
        from bk
       where status in ('confirmed','completed')
       group by extract(dow from date_from)
    ) t
  ),
  top_brands as (
    select jsonb_agg(t order by t.bookings desc) as data
    from (
      select brand,
             count(*) as bookings,
             round(avg(price_per_day))::int as avg_price
        from bk
       where status in ('confirmed','completed')
       group by brand
       order by count(*) desc
       limit 10
    ) t
  )
  select jsonb_build_object(
    'top_models',        coalesce((select data from top_models), '[]'::jsonb),
    'top_brands',        coalesce((select data from top_brands), '[]'::jsonb),
    'segments',          coalesce((select data from segments), '[]'::jsonb),
    'avg_price_segment', coalesce((select data from avg_by_segment_all), '[]'::jsonb),
    'monthly_demand',    coalesce((select data from monthly_demand), '[]'::jsonb),
    'weekday_demand',    coalesce((select data from weekday_demand), '[]'::jsonb)
  );
$$;
