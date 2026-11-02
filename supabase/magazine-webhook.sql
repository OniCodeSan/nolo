-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — MAGAZINE: categorie + pubblicazione da tool esterno (webhook)
-- ═════════════════════════════════════════════════════════════════════════
--
-- 1. Categorie vere del magazine (blog_categories), gestite sia dall'admin
--    sia dal tool AI esterno. Una categoria per articolo (category_id); i tag
--    restano come prima. Solo italiano: le traduzioni ereditano la categoria
--    dalla riga IT con lo stesso slug.
-- 2. external_id: identità dell'articolo nel tool esterno → il webhook fa
--    upsert (crea o modifica) senza duplicati. Il tool può SOLO creare e
--    modificare i propri articoli: niente delete/archiviazione, e non può
--    toccare articoli creati dall'admin (external_id null).
-- 3. RPC webhook_* eseguibili SOLO da service_role (edge function
--    magazine-webhook); RPC admin_* con guard is_admin come il resto del blog.
--
-- Idempotente. Da applicare DOPO blog-schema.sql e blog-i18n-schema.sql.
-- ═════════════════════════════════════════════════════════════════════════

-- ─── Slug helper (accenti italiani → ascii) ─────────────────────────────────
create or replace function public.blog_slugify(p text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    translate(lower(trim(coalesce(p, ''))), 'àáâäãèéêëìíîïòóôöõùúûüçñ', 'aaaaaeeeeiiiiooooouuuucn'),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- ─── Categorie ──────────────────────────────────────────────────────────────
create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  slug        text not null unique,
  name        text not null,
  description text,
  source      text not null default 'admin'   -- admin|webhook (chi l'ha creata)
);

drop trigger if exists blog_categories_touch on public.blog_categories;
create trigger blog_categories_touch before update on public.blog_categories
  for each row execute function public.blog_articles_touch();

alter table public.blog_categories enable row level security;

drop policy if exists "blog categories public read" on public.blog_categories;
create policy "blog categories public read"
  on public.blog_categories for select to anon, authenticated
  using (true);

-- Scrittura solo via RPC SECURITY DEFINER.
do $$
begin
  begin
    revoke insert, update, delete on public.blog_categories from anon, authenticated;
  exception when others then
    raise notice 'revoke su blog_categories saltato: %', sqlerrm;
  end;
end $$;

-- ─── Nuove colonne articoli ─────────────────────────────────────────────────
alter table public.blog_articles
  add column if not exists category_id uuid references public.blog_categories(id) on delete set null,
  add column if not exists external_id text;

create index if not exists blog_articles_category_idx on public.blog_articles (category_id);
-- external_id solo sulle righe IT (le traduzioni non lo hanno).
create unique index if not exists blog_articles_external_id_key
  on public.blog_articles (external_id) where external_id is not null;

-- ─── Admin: categorie ───────────────────────────────────────────────────────
create or replace function public.admin_save_blog_category(
  p_id          uuid,
  p_name        text,
  p_slug        text default null,
  p_description text default null
)
returns public.blog_categories
language plpgsql
security definer
set search_path = public
as $$
declare
  c      public.blog_categories;
  v_slug text := public.blog_slugify(coalesce(nullif(trim(p_slug), ''), p_name));
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'nome categoria obbligatorio'; end if;
  if v_slug = '' then raise exception 'slug categoria non valido'; end if;

  if p_id is null then
    insert into public.blog_categories (slug, name, description, source)
    values (v_slug, trim(p_name), nullif(trim(p_description), ''), 'admin')
    returning * into c;
  else
    update public.blog_categories
       set slug = v_slug, name = trim(p_name), description = nullif(trim(p_description), '')
     where id = p_id
    returning * into c;
    if not found then raise exception 'categoria non trovata'; end if;
  end if;
  return c;
exception when unique_violation then
  raise exception 'esiste già una categoria con slug "%"', v_slug;
end $$;

revoke all on function public.admin_save_blog_category(uuid, text, text, text) from public, anon;
grant execute on function public.admin_save_blog_category(uuid, text, text, text) to authenticated;

-- Elimina la categoria; gli articoli restano, senza categoria (on delete set null).
create or replace function public.admin_delete_blog_category(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  delete from public.blog_categories where id = p_id;
end $$;

revoke all on function public.admin_delete_blog_category(uuid) from public, anon;
grant execute on function public.admin_delete_blog_category(uuid) to authenticated;

-- Assegna la categoria a un articolo (riga IT + traduzioni con lo stesso slug).
-- Separata da admin_save_blog_article per non cambiarne la firma.
create or replace function public.admin_set_blog_article_category(p_id uuid, p_category_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_slug text;
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  select slug into v_slug from public.blog_articles where id = p_id;
  if v_slug is null then raise exception 'articolo non trovato'; end if;
  update public.blog_articles set category_id = p_category_id where slug = v_slug;
end $$;

revoke all on function public.admin_set_blog_article_category(uuid, uuid) from public, anon;
grant execute on function public.admin_set_blog_article_category(uuid, uuid) to authenticated;

-- ─── Webhook: categorie (crea o modifica, mai elimina) ──────────────────────
create or replace function public.webhook_upsert_blog_category(
  p_name        text,
  p_slug        text default null,
  p_description text default null
)
returns public.blog_categories
language plpgsql
security definer
set search_path = public
as $$
declare
  c      public.blog_categories;
  v_slug text := public.blog_slugify(coalesce(nullif(trim(p_slug), ''), p_name));
begin
  if nullif(trim(coalesce(p_name, '')), '') is null then
    raise exception 'nome categoria obbligatorio' using errcode = '22023';
  end if;
  if v_slug = '' then raise exception 'slug categoria non valido' using errcode = '22023'; end if;

  insert into public.blog_categories (slug, name, description, source)
  values (v_slug, trim(p_name), nullif(trim(p_description), ''), 'webhook')
  on conflict (slug) do update set
    name        = excluded.name,
    description = coalesce(excluded.description, blog_categories.description)
  returning * into c;
  return c;
end $$;

revoke all on function public.webhook_upsert_blog_category(text, text, text) from public, anon, authenticated;
grant execute on function public.webhook_upsert_blog_category(text, text, text) to service_role;

-- ─── Webhook: articoli (crea o modifica, solo IT, solo i propri) ────────────
-- Identità = p_external_id (fallback: slug). Sui campi opzionali NULL = lascia
-- il valore attuale, così il tool può mandare anche solo i testi modificati.
-- p_category: nome o slug; se non esiste viene creata.
create or replace function public.webhook_upsert_blog_article(
  p_external_id      text,
  p_title            text,
  p_content          text,
  p_slug             text    default null,
  p_excerpt          text    default null,
  p_cover_image_url  text    default null,
  p_tags             text[]  default null,
  p_category         text    default null,
  p_status           text    default null,
  p_meta_title       text    default null,
  p_meta_description text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cur      public.blog_articles;
  a        public.blog_articles;
  v_slug   text;
  v_ext    text;
  v_cat_id uuid;
  v_status text := coalesce(nullif(trim(p_status), ''), 'published');
begin
  if v_status not in ('draft', 'published') then
    raise exception 'status non valido (draft|published)' using errcode = '22023';
  end if;
  if p_cover_image_url is not null and p_cover_image_url !~* '^https://' then
    raise exception 'cover_image_url deve essere un URL https' using errcode = '22023';
  end if;

  v_slug := public.blog_slugify(coalesce(nullif(trim(p_slug), ''), p_title));
  v_ext  := coalesce(nullif(trim(p_external_id), ''), v_slug);
  if coalesce(v_ext, '') = '' then
    raise exception 'serve id o slug o titolo per identificare l''articolo' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_category, '')), '') is not null then
    select id into v_cat_id from public.blog_categories
     where slug = public.blog_slugify(p_category);
    if v_cat_id is null then
      v_cat_id := (public.webhook_upsert_blog_category(p_category)).id;
    end if;
  end if;

  select * into cur from public.blog_articles where external_id = v_ext and lang = 'it';

  if cur.id is null then
    -- ── Creazione ──
    if nullif(trim(coalesce(p_title, '')), '') is null then
      raise exception 'title obbligatorio' using errcode = '22023';
    end if;
    if nullif(trim(coalesce(p_content, '')), '') is null then
      raise exception 'contenuto obbligatorio' using errcode = '22023';
    end if;
    if exists (select 1 from public.blog_articles where slug = v_slug and lang = 'it') then
      raise exception 'slug "%" già usato da un altro articolo', v_slug using errcode = '23505';
    end if;

    insert into public.blog_articles (
      slug, lang, external_id, title, excerpt, content_md, cover_image_url, tags,
      category_id, status, meta_title, meta_description, ai_generated, published_at
    ) values (
      v_slug, 'it', v_ext, trim(p_title), p_excerpt, p_content, p_cover_image_url,
      coalesce(p_tags, '{}'), v_cat_id, v_status, p_meta_title, p_meta_description, true,
      case when v_status = 'published' then now() end
    )
    returning * into a;
    return jsonb_build_object('action', 'created', 'id', a.id, 'slug', a.slug, 'status', a.status);
  end if;

  -- ── Modifica ──
  -- Lo slug cambia solo se il tool lo manda esplicitamente.
  v_slug := coalesce(nullif(public.blog_slugify(p_slug), ''), cur.slug);
  if v_slug <> cur.slug and exists (
    select 1 from public.blog_articles where slug = v_slug and lang = 'it'
  ) then
    raise exception 'slug "%" già usato da un altro articolo', v_slug using errcode = '23505';
  end if;

  update public.blog_articles set
    slug             = v_slug,
    title            = coalesce(nullif(trim(p_title), ''), title),
    content_md       = coalesce(nullif(p_content, ''), content_md),
    excerpt          = coalesce(p_excerpt, excerpt),
    cover_image_url  = coalesce(p_cover_image_url, cover_image_url),
    tags             = coalesce(p_tags, tags),
    category_id      = case when p_category is null then category_id else v_cat_id end,
    status           = case when p_status is null then status else v_status end,
    meta_title       = coalesce(p_meta_title, meta_title),
    meta_description = coalesce(p_meta_description, meta_description),
    published_at     = case when (case when p_status is null then status else v_status end) = 'published'
                            then coalesce(published_at, now()) else published_at end
  where id = cur.id
  returning * into a;

  -- Le traduzioni restano agganciate (stesso slug) ed ereditano i campi
  -- condivisi, come fa admin_save_blog_translation.
  update public.blog_articles set
    slug = a.slug, category_id = a.category_id, cover_image_url = a.cover_image_url,
    tags = a.tags, status = a.status, published_at = a.published_at
  where slug = cur.slug and lang <> 'it';

  return jsonb_build_object('action', 'updated', 'id', a.id, 'slug', a.slug, 'status', a.status);
end $$;

revoke all on function public.webhook_upsert_blog_article(text, text, text, text, text, text, text[], text, text, text, text) from public, anon, authenticated;
grant execute on function public.webhook_upsert_blog_article(text, text, text, text, text, text, text[], text, text, text, text) to service_role;

-- ═════════════════════════════════════════════════════════════════════════
-- ✅ VERIFICA
--   select * from public.blog_categories order by name;
--   select slug, external_id, category_id, status from public.blog_articles
--    where external_id is not null order by updated_at desc;
--   select public.blog_slugify('Città & Mobilità');   -- citta-mobilita
-- ═════════════════════════════════════════════════════════════════════════
