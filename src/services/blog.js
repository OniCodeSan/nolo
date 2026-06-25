// Service blog — articoli pubblici + gestione admin.
// Lettura via RPC SECURITY DEFINER (get_blog_article / list_blog_articles,
// eseguibili da anon). Scrittura solo admin (admin_save/admin_delete con
// guard is_admin lato DB). Vedi supabase/blog-schema.sql.

import { supabase, hasSupabase } from '../lib/supabase.js';

// ─── Pubblico ───────────────────────────────────────────────────────────────
export async function listBlogArticles({ limit = 20, offset = 0, tag = null, lang = 'it' } = {}) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.rpc('list_blog_articles', {
    p_limit: limit, p_offset: offset, p_tag: tag, p_lang: lang,
  });
  if (error) throw error;
  return data || [];
}

export async function getBlogArticle(slug, lang = 'it') {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.rpc('get_blog_article', { p_slug: slug, p_lang: lang });
  if (error) throw error;
  return data || null;
}

// Lingue in cui esiste una versione pubblicata di questo articolo (per gli
// hreflang corretti). L'IT è sempre presente; le altre solo se tradotte.
export async function getArticleLangs(slug) {
  if (!hasSupabase || !slug) return ['it'];
  const { data, error } = await supabase
    .from('blog_articles')
    .select('lang')
    .eq('slug', slug)
    .eq('status', 'published');
  if (error || !data?.length) return ['it'];
  return [...new Set(data.map(r => r.lang))];
}

// Incremento view best-effort (non blocca il render in caso di errore).
export function incrementBlogView(slug) {
  if (!hasSupabase || !slug) return;
  supabase.rpc('increment_blog_view', { p_slug: slug }).then(() => {}, () => {});
}

// ─── Admin ────────────────────────────────────────────────────────────────
export async function adminListBlogArticles({ status = null, limit = 100, offset = 0 } = {}) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.rpc('admin_list_blog_articles', {
    p_status: status, p_limit: limit, p_offset: offset,
  });
  if (error) throw error;
  return data || [];
}

// fields: { id?, slug, title, excerpt, contentMd, coverImageUrl, tags[], status,
//           metaTitle, metaDescription, aiGenerated, aiModel }
export async function adminSaveBlogArticle(fields) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('admin_save_blog_article', {
    p_id:               fields.id ?? null,
    p_slug:             fields.slug ?? '',
    p_title:            fields.title ?? '',
    p_excerpt:          fields.excerpt || null,
    p_content_md:       fields.contentMd ?? '',
    p_cover_image_url:  fields.coverImageUrl || null,
    p_tags:             Array.isArray(fields.tags) ? fields.tags : [],
    p_status:           fields.status || 'draft',
    p_meta_title:       fields.metaTitle || null,
    p_meta_description: fields.metaDescription || null,
    p_ai_generated:     !!fields.aiGenerated,
    p_ai_model:         fields.aiModel || null,
  });
  if (error) throw error;
  return data;
}

export async function adminDeleteBlogArticle(id) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { error } = await supabase.rpc('admin_delete_blog_article', { p_id: id });
  if (error) throw error;
}

export const BLOG_STATUSES = [
  { id: 'draft',     l: 'Bozza',       tone: 'neutral' },
  { id: 'published', l: 'Pubblicato',  tone: 'success' },
  { id: 'archived',  l: 'Archiviato',  tone: 'alert'   },
];
