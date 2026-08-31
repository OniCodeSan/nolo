-- FIX registrazione: "ogni email risulta già registrata".
--
-- Causa: la versione in produzione di get_user_role_by_email ritornava ''
-- (stringa vuota) anche per email INESISTENTI, invece di NULL. L'edge function
-- auth-login fa `userExists = (existingRole !== null)`, quindi '' veniva letto
-- come "utente esiste" → blocco "email già registrata" per qualunque email.
--
-- Fix: distinguere "non esiste" (NULL) da "esiste senza ruolo" ('') usando il
-- flag FOUND di PL/pgSQL. Eseguire nel SQL Editor di Supabase.

create or replace function get_user_role_by_email(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role text;
begin
  select raw_app_meta_data ->> 'role'
    into v_role
    from auth.users
   where lower(email) = lower(p_email)
   limit 1;

  if not found then
    return null;                  -- utente NON esiste
  end if;
  return coalesce(v_role, '');    -- esiste: 'customer' | 'host' | '' (legacy)
end;
$$;

revoke all on function get_user_role_by_email(text) from public, anon, authenticated;
grant execute on function get_user_role_by_email(text) to service_role;
