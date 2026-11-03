-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — LOG consultabili dall'admin (/admin/log)
-- ═════════════════════════════════════════════════════════════════════════
--
-- 1. magazine_webhook_log: una riga per ogni POST di R-Pie al webhook del
--    magazine (evento, consegna, esito, errori). La scrive l'edge function
--    magazine-webhook con service_role; il testo degli articoli NON viene
--    salvato. Pulizia automatica dopo 180 giorni.
-- 2. admin_magazine_webhook_log / admin_email_log: lettura riservata agli
--    admin (profiles.is_admin). email_log esiste già (email-log-schema.sql) ma
--    la sua policy admin usa un claim JWT che gli admin MoviQ non hanno.
--
-- Idempotente. Richiede public.is_admin() (security-hardening.sql) ed
-- email_log (email-log-schema.sql).
-- ═════════════════════════════════════════════════════════════════════════

create table if not exists public.magazine_webhook_log (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  http_status int not null,
  ok          boolean not null,
  articles    int not null default 0,
  categories  int not null default 0,
  failed      int not null default 0,
  error       text,     -- errore dell'intera richiesta (secret errato, JSON non valido, …)
  items       jsonb,    -- esito per elemento: tipo, titolo/nome, slug, azione, errore
  ip          text,
  user_agent  text
);

alter table public.magazine_webhook_log
  add column if not exists event       text,   -- ping | article.publish (X-RPie-Event)
  add column if not exists delivery_id text;   -- X-RPie-Delivery

create index if not exists magazine_webhook_log_created_idx
  on public.magazine_webhook_log (created_at desc);

-- Nessuna policy: scrive solo service_role, l'admin legge via RPC.
alter table public.magazine_webhook_log enable row level security;
revoke all on public.magazine_webhook_log from anon, authenticated;

create or replace function public.magazine_webhook_log_prune()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.magazine_webhook_log where created_at < now() - interval '180 days';
  return null;
end;
$$;

drop trigger if exists magazine_webhook_log_prune on public.magazine_webhook_log;
create trigger magazine_webhook_log_prune after insert on public.magazine_webhook_log
  for each statement execute function public.magazine_webhook_log_prune();

-- ─── Lettura admin ──────────────────────────────────────────────────────────
create or replace function public.admin_magazine_webhook_log(p_limit int default 100, p_only_errors boolean default false)
returns setof public.magazine_webhook_log
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only' using errcode = '42501';
  end if;
  return query
    select * from public.magazine_webhook_log
    where not p_only_errors or not ok
    order by created_at desc
    limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

-- Senza payload (contiene le variabili del template, link inclusi).
create or replace function public.admin_email_log(p_limit int default 100, p_only_errors boolean default false)
returns table (
  id           uuid,
  created_at   timestamptz,
  to_email     text,
  template     text,
  subject      text,
  status       text,
  error        text,
  sent_at      timestamptz,
  delivered_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only' using errcode = '42501';
  end if;
  return query
    select e.id, e.created_at, e.to_email, e.template, e.subject, e.status, e.error, e.sent_at, e.delivered_at
    from public.email_log e
    where not p_only_errors or e.status in ('failed', 'bounced', 'rejected', 'complained')
    order by e.created_at desc
    limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

revoke all on function public.admin_magazine_webhook_log(int, boolean) from public, anon;
revoke all on function public.admin_email_log(int, boolean) from public, anon;
grant execute on function public.admin_magazine_webhook_log(int, boolean) to authenticated;
grant execute on function public.admin_email_log(int, boolean) to authenticated;
