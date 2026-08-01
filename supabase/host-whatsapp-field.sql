-- Campo WhatsApp dedicato per il noleggiatore.
-- Viene mostrato nella scheda auto (bottone "Scrivi su WhatsApp") come contatto
-- diretto, separato dal telefono aziendale (business_phone) usato per le chiamate.
-- Eseguire nel SQL Editor di Supabase (progetto togcwgymwrnhiihduapb).
--
-- NB: la view hosts_public in produzione ha un ORDINE di colonne diverso da
-- questo file, quindi `create or replace view` fallisce ("cannot change name of
-- view column"). Serve DROP + CREATE. La view è referenziata dalla funzione
-- public_get_host → la droppiamo e la ricreiamo dopo.

alter table public.hosts add column if not exists whatsapp text;

-- Rimuovi i dipendenti (la funzione ritorna il tipo della view), poi la view.
drop function if exists public.public_get_host(text);
drop view if exists public.hosts_public cascade;

-- View pubblica: esclude i campi sensibili (IBAN/BIC/holder, moderation_notes).
create view public.hosts_public as
  select
    id, name, city, rating, reviews_count, since, response_time,
    verified, status, featured, description, logo_url,
    business_email, business_phone, whatsapp, vat_number,
    terms,
    payment_cards, payment_debit, payment_cash, payment_cash_limit_eur,
    payment_bank_transfer,
    created_at, updated_at
  from public.hosts
  where status in ('verified', 'pending');

grant select on public.hosts_public to anon, authenticated;
comment on view public.hosts_public is
  'View pubblica della tabella hosts. Esclude bank_iban/bank_bic/bank_holder e moderation_notes che sono PII non destinata al marketplace.';

-- Ricrea la RPC che ritorna una riga host pubblica.
create or replace function public.public_get_host(p_host_id text)
returns public.hosts_public
language sql
security definer
set search_path = public
stable
as $$
  select * from public.hosts_public where id = p_host_id;
$$;

grant execute on function public.public_get_host to anon, authenticated;

comment on column public.hosts.whatsapp is
  'Numero WhatsApp del noleggiatore per il contatto diretto dalla scheda auto (formato libero, normalizzato a E.164 lato client).';
