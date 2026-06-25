-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — CONFIG AI (chiavi cloud in Vault + impostazioni provider/modello)
-- ═════════════════════════════════════════════════════════════════════════
--
-- Modulo per la generazione AI degli articoli (Fase 2) e, in futuro, le foto
-- auto (Fase 3). Le CHIAVI API stanno in **Supabase Vault** (cifrate at-rest),
-- mai in tabelle leggibili né nel bundle. La config NON segreta (provider,
-- modello) sta in admin_ai_config.
--
-- Flusso: UI admin → edge function `admin-ai` (verifica is_admin via JWT utente)
--          → usa il service_role per chiamare ai_store_secret / ai_read_secret.
-- Le RPC sui segreti sono eseguibili SOLO dal service_role (la edge function),
-- mai dal client. Lo stato "chiave impostata" è esposto senza rivelarne il valore.
--
-- Idempotente. Richiede public.is_admin() (security-hardening.sql §1) e Vault.
-- ═════════════════════════════════════════════════════════════════════════

-- Vault (su Supabase è disponibile; idempotente).
create extension if not exists supabase_vault with schema vault;

-- ─── Config NON segreta ─────────────────────────────────────────────────────
create table if not exists public.admin_ai_config (
  key        text primary key,           -- es. 'model', 'image_provider'
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.admin_ai_config enable row level security;

drop policy if exists "ai_config admin all" on public.admin_ai_config;
create policy "ai_config admin all"
  on public.admin_ai_config for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Default modello (se assente).
insert into public.admin_ai_config (key, value)
values ('model', jsonb_build_object('article', 'claude-sonnet-4-6'))
on conflict (key) do nothing;

-- ─── Helper Vault (SOLO service_role: chiamati dalla edge function) ──────────
-- Salva/aggiorna un segreto per nome (delete+create per evitare problemi di
-- firma di vault.update_secret tra versioni).
create or replace function public.ai_store_secret(p_name text, p_value text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  delete from vault.secrets where name = p_name;
  perform vault.create_secret(p_value, p_name, 'MoviQ AI key');
end $$;
revoke all on function public.ai_store_secret(text, text) from public, anon, authenticated;
grant execute on function public.ai_store_secret(text, text) to service_role;

-- Legge il valore decifrato di un segreto (solo service_role).
create or replace function public.ai_read_secret(p_name text)
returns text
language sql
stable
security definer
set search_path = public, vault
as $$
  select decrypted_secret from vault.decrypted_secrets where name = p_name limit 1;
$$;
revoke all on function public.ai_read_secret(text) from public, anon, authenticated;
grant execute on function public.ai_read_secret(text) to service_role;

-- Cancella un segreto (rotazione/rimozione) — solo service_role.
create or replace function public.ai_delete_secret(p_name text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  delete from vault.secrets where name = p_name;
end $$;
revoke all on function public.ai_delete_secret(text) from public, anon, authenticated;
grant execute on function public.ai_delete_secret(text) to service_role;

-- Stato "chiave impostata?" (NON rivela il valore) — callable da admin per la UI.
create or replace function public.ai_secret_status(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, vault
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only' using errcode = '42501';
  end if;
  return exists (select 1 from vault.secrets where name = p_name);
end $$;
revoke all on function public.ai_secret_status(text) from public, anon;
grant execute on function public.ai_secret_status(text) to authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- ✅ VERIFICA
--   select key, value from public.admin_ai_config;
--   select proname, prosecdef from pg_proc
--    where proname in ('ai_store_secret','ai_read_secret','ai_secret_status');
--   -- dopo aver salvato una chiave dalla UI:
--   select name from vault.secrets;     -- es. ANTHROPIC_API_KEY
-- ═════════════════════════════════════════════════════════════════════════
