-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — BLOG (articoli pubblici + gestione admin)
-- ═════════════════════════════════════════════════════════════════════════
--
-- Tabella + RPC per il blog /blog. Articoli scritti a mano (Fase 1) o generati
-- con AI (Fase 2, status='draft' finché un admin non pubblica).
--
-- Sicurezza (allineata a security-hardening.sql):
--   • Lettura pubblica SOLO degli articoli published. La scrittura passa SOLO
--     da RPC SECURITY DEFINER con guard public.is_admin(): niente INSERT/UPDATE
--     diretto, niente policy permissive.
--   • get_blog_article / list_blog_articles eseguibili da anon (pagine pubbliche).
--   • RPC admin eseguibili da authenticated + guard is_admin().
--
-- Idempotente. Richiede public.is_admin() (security-hardening.sql §1).
-- ═════════════════════════════════════════════════════════════════════════

-- ─── Tabella ──────────────────────────────────────────────────────────────
create table if not exists public.blog_articles (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  content_md       text not null default '',     -- corpo in Markdown
  cover_image_url  text,
  tags             text[] not null default '{}',
  status           text not null default 'draft', -- draft|published|archived
  published_at     timestamptz,
  author_id        uuid references auth.users(id) on delete set null,
  -- SEO
  meta_title       text,
  meta_description text,
  -- AI
  ai_generated     boolean not null default false,
  ai_model         text,
  -- Analytics
  view_count       int not null default 0
);

-- Guard status valido (NOT VALID per non fallire su dati legacy eventuali).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blog_articles_status_chk') then
    alter table public.blog_articles
      add constraint blog_articles_status_chk
      check (status in ('draft','published','archived')) not valid;
  end if;
end $$;

create index if not exists blog_articles_slug_idx      on public.blog_articles (slug);
create index if not exists blog_articles_status_idx    on public.blog_articles (status);
create index if not exists blog_articles_published_idx on public.blog_articles (published_at desc) where status = 'published';

-- updated_at automatico
create or replace function public.blog_articles_touch()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists blog_articles_touch on public.blog_articles;
create trigger blog_articles_touch before update on public.blog_articles
  for each row execute function public.blog_articles_touch();

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table public.blog_articles enable row level security;

-- Lettura pubblica SOLO articoli pubblicati (le bozze restano invisibili).
drop policy if exists "blog public read published" on public.blog_articles;
create policy "blog public read published"
  on public.blog_articles for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

-- Lettura admin di tutto (bozze incluse) per l'editor.
drop policy if exists "blog admin read all" on public.blog_articles;
create policy "blog admin read all"
  on public.blog_articles for select to authenticated
  using (public.is_admin());

-- Nessuna policy INSERT/UPDATE/DELETE: scrittura solo via RPC SECURITY DEFINER.
do $$
begin
  begin
    revoke insert, update, delete on public.blog_articles from anon, authenticated;
  exception when others then
    raise notice 'revoke su blog_articles saltato: %', sqlerrm;
  end;
end $$;

-- ─── RPC pubbliche ──────────────────────────────────────────────────────────
-- Singolo articolo pubblicato per slug (incrementa view_count best-effort).
create or replace function public.get_blog_article(p_slug text)
returns public.blog_articles
language plpgsql
stable
security definer
set search_path = public
as $$
declare a public.blog_articles;
begin
  select * into a from public.blog_articles
   where slug = p_slug and status = 'published'
     and published_at is not null and published_at <= now()
   limit 1;
  return a;  -- NULL se non trovato/non pubblicato
end $$;

revoke all on function public.get_blog_article(text) from public;
grant execute on function public.get_blog_article(text) to anon, authenticated;

-- Lista articoli pubblicati (paginata, opz. per tag).
create or replace function public.list_blog_articles(
  p_limit int default 20,
  p_offset int default 0,
  p_tag text default null
)
returns setof public.blog_articles
language sql
stable
security definer
set search_path = public
as $$
  select *
    from public.blog_articles
   where status = 'published'
     and published_at is not null and published_at <= now()
     and (p_tag is null or p_tag = any(tags))
   order by published_at desc
   limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.list_blog_articles(int, int, text) from public;
grant execute on function public.list_blog_articles(int, int, text) to anon, authenticated;

-- Incremento view (best-effort, non blocca il render).
create or replace function public.increment_blog_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.blog_articles set view_count = view_count + 1
   where slug = p_slug and status = 'published';
$$;
revoke all on function public.increment_blog_view(text) from public;
grant execute on function public.increment_blog_view(text) to anon, authenticated;

-- ─── RPC admin ──────────────────────────────────────────────────────────────
create or replace function public.admin_list_blog_articles(
  p_status text default null,
  p_limit  int  default 100,
  p_offset int  default 0
)
returns setof public.blog_articles
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
    select * from public.blog_articles
     where (p_status is null or status = p_status)
     order by updated_at desc
     limit greatest(1, least(coalesce(p_limit, 100), 500))
    offset greatest(0, coalesce(p_offset, 0));
end $$;

revoke all on function public.admin_list_blog_articles(text, int, int) from public, anon;
grant execute on function public.admin_list_blog_articles(text, int, int) to authenticated;

-- Upsert articolo. p_id NULL = nuovo. Gestisce published_at al passaggio a published.
create or replace function public.admin_save_blog_article(
  p_id               uuid,
  p_slug             text,
  p_title            text,
  p_excerpt          text default null,
  p_content_md       text default '',
  p_cover_image_url  text default null,
  p_tags             text[] default '{}',
  p_status           text default 'draft',
  p_meta_title       text default null,
  p_meta_description text default null,
  p_ai_generated     boolean default false,
  p_ai_model         text default null
)
returns public.blog_articles
language plpgsql
security definer
set search_path = public
as $$
declare
  a    public.blog_articles;
  v_slug text := lower(regexp_replace(trim(coalesce(p_slug, '')), '[^a-z0-9]+', '-', 'g'));
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  if p_status not in ('draft','published','archived') then
    raise exception 'stato non valido';
  end if;
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then raise exception 'slug obbligatorio'; end if;
  if nullif(trim(coalesce(p_title, '')), '') is null then raise exception 'titolo obbligatorio'; end if;

  if p_id is null then
    insert into public.blog_articles (
      slug, title, excerpt, content_md, cover_image_url, tags, status,
      meta_title, meta_description, ai_generated, ai_model, author_id,
      published_at
    ) values (
      v_slug, p_title, p_excerpt, coalesce(p_content_md, ''), p_cover_image_url,
      coalesce(p_tags, '{}'), p_status, p_meta_title, p_meta_description,
      coalesce(p_ai_generated, false), p_ai_model, auth.uid(),
      case when p_status = 'published' then now() else null end
    )
    returning * into a;
  else
    update public.blog_articles set
      slug = v_slug, title = p_title, excerpt = p_excerpt,
      content_md = coalesce(p_content_md, ''), cover_image_url = p_cover_image_url,
      tags = coalesce(p_tags, '{}'), status = p_status,
      meta_title = p_meta_title, meta_description = p_meta_description,
      ai_generated = coalesce(p_ai_generated, ai_generated), ai_model = coalesce(p_ai_model, ai_model),
      -- imposta published_at la prima volta che passa a published
      published_at = case when p_status = 'published' and published_at is null then now()
                          when p_status <> 'published' then published_at
                          else published_at end
    where id = p_id
    returning * into a;
    if not found then raise exception 'articolo non trovato'; end if;
  end if;
  return a;
end $$;

revoke all on function public.admin_save_blog_article(uuid, text, text, text, text, text, text[], text, text, text, boolean, text) from public, anon;
grant execute on function public.admin_save_blog_article(uuid, text, text, text, text, text, text[], text, text, text, boolean, text) to authenticated;

create or replace function public.admin_delete_blog_article(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  delete from public.blog_articles where id = p_id;
end $$;

revoke all on function public.admin_delete_blog_article(uuid) from public, anon;
grant execute on function public.admin_delete_blog_article(uuid) to authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- ✅ VERIFICA
--   select count(*) from public.blog_articles;
--   select relrowsecurity from pg_class where relname='blog_articles';  -- true
--   select proname, prosecdef from pg_proc
--    where proname in ('get_blog_article','list_blog_articles',
--                      'admin_list_blog_articles','admin_save_blog_article');
-- ═════════════════════════════════════════════════════════════════════════
