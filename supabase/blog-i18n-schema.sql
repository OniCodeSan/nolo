-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — BLOG i18n (contenuto articoli multilingua)
-- ═════════════════════════════════════════════════════════════════════════
--
-- Aggiunge il supporto multilingua al contenuto degli articoli, coerente con
-- il sito multilingua (prefisso /en /es /de /pt /fr, IT default).
--
-- Modello: una RIGA per (slug, lingua). Le traduzioni condividono lo stesso
-- `slug` dell'originale IT → l'URL resta identico in ogni lingua
-- (/en/blog/<slug> serve la riga lang='en', con fallback alla riga 'it').
--
-- Idempotente. Da applicare DOPO blog-schema.sql.
-- ═════════════════════════════════════════════════════════════════════════

-- ─── Colonna lingua ─────────────────────────────────────────────────────────
alter table public.blog_articles
  add column if not exists lang text not null default 'it';

create index if not exists blog_articles_lang_idx on public.blog_articles (lang);
create index if not exists blog_articles_slug_lang_idx on public.blog_articles (slug, lang);

-- ─── Unicità: da slug globale → (slug, lang) ────────────────────────────────
do $$
begin
  -- rimuovi il vecchio vincolo di unicità globale sullo slug, se presente
  if exists (select 1 from pg_constraint where conname = 'blog_articles_slug_key') then
    alter table public.blog_articles drop constraint blog_articles_slug_key;
  end if;
  -- aggiungi unicità composita (slug, lang)
  if not exists (select 1 from pg_constraint where conname = 'blog_articles_slug_lang_key') then
    alter table public.blog_articles
      add constraint blog_articles_slug_lang_key unique (slug, lang);
  end if;
end $$;

-- ─── RPC pubbliche aggiornate (lang-aware con fallback IT) ───────────────────
-- Le firme cambiano (aggiunto p_lang) → drop & recreate + re-grant.

drop function if exists public.get_blog_article(text);
create or replace function public.get_blog_article(p_slug text, p_lang text default 'it')
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
     and lang in (p_lang, 'it')
   order by (lang = p_lang) desc   -- preferisci la lingua richiesta, poi IT
   limit 1;
  return a;  -- NULL se non trovato/non pubblicato
end $$;

revoke all on function public.get_blog_article(text, text) from public;
grant execute on function public.get_blog_article(text, text) to anon, authenticated;

drop function if exists public.list_blog_articles(int, int, text);
create or replace function public.list_blog_articles(
  p_limit int default 20,
  p_offset int default 0,
  p_tag text default null,
  p_lang text default 'it'
)
returns setof public.blog_articles
language sql
stable
security definer
set search_path = public
as $$
  -- una riga per slug, preferendo la lingua richiesta (fallback IT), poi
  -- ordinata per data di pubblicazione.
  select b.* from (
    select distinct on (a.slug) a.*
      from public.blog_articles a
     where a.status = 'published'
       and a.published_at is not null and a.published_at <= now()
       and (p_tag is null or p_tag = any(a.tags))
       and a.lang in (p_lang, 'it')
     order by a.slug, (a.lang = p_lang) desc
  ) b
  order by b.published_at desc
   limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.list_blog_articles(int, int, text, text) from public;
grant execute on function public.list_blog_articles(int, int, text, text) to anon, authenticated;

-- ─── Admin: l'editor gestisce le righe canoniche IT ─────────────────────────
-- La lista admin mostra solo gli articoli 'it' (le traduzioni sono righe
-- collegate per slug, gestite separatamente), così l'editor resta invariato.
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
       and lang = 'it'
     order by updated_at desc
     limit greatest(1, least(coalesce(p_limit, 100), 500))
    offset greatest(0, coalesce(p_offset, 0));
end $$;

revoke all on function public.admin_list_blog_articles(text, int, int) from public, anon;
grant execute on function public.admin_list_blog_articles(text, int, int) to authenticated;

-- ─── Upsert traduzione (admin) ──────────────────────────────────────────────
-- Salva/aggiorna la traduzione di un articolo per (slug, lang). La riga eredita
-- status/published_at/cover/tags dall'originale IT così appare appena pubblicata.
create or replace function public.admin_save_blog_translation(
  p_slug             text,
  p_lang             text,
  p_title            text,
  p_excerpt          text default null,
  p_content_md       text default '',
  p_meta_title       text default null,
  p_meta_description text default null
)
returns public.blog_articles
language plpgsql
security definer
set search_path = public
as $$
declare
  base public.blog_articles;
  a    public.blog_articles;
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  if p_lang is null or p_lang = 'it' then
    raise exception 'lingua traduzione non valida';
  end if;
  select * into base from public.blog_articles where slug = p_slug and lang = 'it' limit 1;
  if base.id is null then raise exception 'articolo originale (it) non trovato'; end if;

  insert into public.blog_articles (
    slug, lang, title, excerpt, content_md, cover_image_url, tags, status,
    meta_title, meta_description, ai_generated, ai_model, author_id, published_at
  ) values (
    p_slug, p_lang, p_title, p_excerpt, coalesce(p_content_md, ''), base.cover_image_url,
    base.tags, base.status, p_meta_title, p_meta_description,
    base.ai_generated, base.ai_model, auth.uid(), base.published_at
  )
  on conflict (slug, lang) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content_md = excluded.content_md,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    cover_image_url = base.cover_image_url,
    tags = base.tags,
    status = base.status,
    published_at = base.published_at,
    updated_at = now()
  returning * into a;
  return a;
end $$;

revoke all on function public.admin_save_blog_translation(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_save_blog_translation(text, text, text, text, text, text, text) to authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- ✅ VERIFICA
--   select slug, lang, title from public.blog_articles order by slug, lang;
--   select * from public.list_blog_articles(5,0,null,'en');   -- preferisce EN
--   select (public.get_blog_article('<slug>','en')).title;
-- ═════════════════════════════════════════════════════════════════════════
