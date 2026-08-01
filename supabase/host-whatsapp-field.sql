-- Campo WhatsApp dedicato per il noleggiatore.
-- Viene mostrato nella scheda auto (bottone "Scrivi su WhatsApp") come contatto
-- diretto, separato dal telefono aziendale (business_phone) usato per le chiamate.
-- Eseguire nel SQL Editor di Supabase (progetto togcwgymwrnhiihduapb).

alter table public.hosts add column if not exists whatsapp text;

-- Esponi il campo sulla view pubblica. CREATE OR REPLACE mantiene le GRANT
-- esistenti: le nuove colonne vanno APPESE in fondo (vincolo di Postgres).
create or replace view public.hosts_public as
  select
    id, name, city, rating, reviews_count, since, response_time,
    verified, status, featured, description, logo_url,
    business_email, business_phone, vat_number,
    terms,
    payment_cards, payment_debit, payment_cash, payment_cash_limit_eur,
    payment_bank_transfer,
    created_at, updated_at,
    whatsapp
  from public.hosts
  where status in ('verified', 'pending');

comment on column public.hosts.whatsapp is
  'Numero WhatsApp del noleggiatore per il contatto diretto dalla scheda auto (formato libero, normalizzato a E.164 lato client).';
