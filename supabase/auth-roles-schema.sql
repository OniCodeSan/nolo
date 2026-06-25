-- MoviQ — Separazione hard ruoli customer/host
-- Esegui DOPO auth-schema.sql.
-- Premessa: il ruolo vive in auth.users.raw_app_meta_data->>'role' ∈ {'customer','host'}.
-- È settato solo lato server (service_role) via Edge Function 'auth-login'.
-- Il client non può modificarlo: leggibile via auth.jwt() ma non scrivibile.

-- ============================================================
-- Helper: ruolo dell'utente corrente (dal JWT)
-- ============================================================
create or replace function auth_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    'customer'  -- default per utenti pre-migrazione senza ruolo esplicito
  );
$$;

comment on function auth_role() is
  'Ritorna il ruolo dell''utente loggato dal JWT app_metadata (customer|host). Default: customer.';

-- ============================================================
-- Helper: lookup ruolo per email (uso esclusivo Edge Function auth-login)
-- Security definer: accede a auth.users bypassando RLS.
-- Esposto SOLO al service_role.
-- ============================================================
create or replace function get_user_role_by_email(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role text;
begin
  -- Distingue "non esiste" da "esiste senza role" usando il flag FOUND di PL/pgSQL.
  -- FOUND è true se la SELECT precedente ha trovato almeno una riga.
  select raw_app_meta_data ->> 'role'
    into v_role
    from auth.users
   where lower(email) = lower(p_email)
   limit 1;

  if not found then
    return null;                  -- utente non esiste
  end if;
  return coalesce(v_role, '');    -- esiste: 'customer' | 'host' | '' (legacy senza ruolo)
end;
$$;

revoke all on function get_user_role_by_email(text) from public, anon, authenticated;
grant execute on function get_user_role_by_email(text) to service_role;

-- ============================================================
-- RLS hardening: bookings — solo customer può creare prenotazioni
-- ============================================================
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'bookings') then
    -- Drop esistente (l'eventuale policy precedente potrebbe non avere il check ruolo)
    drop policy if exists "bookings_insert_customer_only" on bookings;
    execute $POL$
      create policy "bookings_insert_customer_only"
        on bookings for insert
        with check (auth_role() = 'customer' and user_id = auth.uid())
    $POL$;
  end if;
end$$;

-- ============================================================
-- RLS hardening: hosts — solo host può creare/aggiornare il proprio record
-- ============================================================
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'hosts') then
    drop policy if exists "hosts_insert_host_only" on hosts;
    execute $POL$
      create policy "hosts_insert_host_only"
        on hosts for insert
        with check (auth_role() = 'host' and owner_user_id = auth.uid())
    $POL$;

    drop policy if exists "hosts_update_host_only" on hosts;
    execute $POL$
      create policy "hosts_update_host_only"
        on hosts for update
        using (auth_role() = 'host' and owner_user_id = auth.uid())
        with check (auth_role() = 'host' and owner_user_id = auth.uid())
    $POL$;
  end if;
end$$;
