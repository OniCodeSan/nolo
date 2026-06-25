-- MoviQ — KYC noleggiatori (Know Your Customer)
-- Estende hosts con campi richiesti per accettare un partner reale:
-- ragione sociale, P.IVA, ATECO, sede legale, documento identità, dichiarazione polizza RC.
-- Aggiunge flusso di review admin: pending → submitted → approved/rejected.

-- ── Dati aziendali ───────────────────────────────────────────────────────────
alter table hosts add column if not exists legal_name        text;
alter table hosts add column if not exists ateco_code        text;
alter table hosts add column if not exists rea_number        text;             -- numero REA
alter table hosts add column if not exists fiscal_code       text;             -- codice fiscale (può coincidere con P.IVA)

-- vat_number già aggiunto in host-backoffice-schema.sql

-- ── Sede legale ─────────────────────────────────────────────────────────────
alter table hosts add column if not exists legal_address     text;
alter table hosts add column if not exists legal_city        text;
alter table hosts add column if not exists legal_zip         text;
alter table hosts add column if not exists legal_province    text;
alter table hosts add column if not exists legal_country     text default 'IT';

-- ── Documento del rappresentante legale ─────────────────────────────────────
alter table hosts add column if not exists id_document_type     text
  check (id_document_type in ('id_card','passport','driver_license') or id_document_type is null);
alter table hosts add column if not exists id_document_number   text;
alter table hosts add column if not exists id_document_path     text;          -- storage path nel bucket host-documents
alter table hosts add column if not exists id_document_expires  date;
alter table hosts add column if not exists representative_name  text;          -- nome/cognome legale rappresentante

-- ── Polizza RC (dichiarata, non upload obbligatorio) ────────────────────────
alter table hosts add column if not exists insurance_declared      boolean default false;
alter table hosts add column if not exists insurance_company       text;
alter table hosts add column if not exists insurance_policy_number text;
alter table hosts add column if not exists insurance_expires_at    date;

-- ── KYC workflow ─────────────────────────────────────────────────────────────
alter table hosts add column if not exists kyc_status             text not null default 'pending'
  check (kyc_status in ('pending','submitted','approved','rejected'));
alter table hosts add column if not exists kyc_submitted_at       timestamptz;
alter table hosts add column if not exists kyc_reviewed_at        timestamptz;
alter table hosts add column if not exists kyc_reviewed_by        uuid references auth.users(id);
alter table hosts add column if not exists kyc_rejection_reason   text;

create index if not exists hosts_kyc_status_idx on hosts(kyc_status) where kyc_status in ('submitted','pending');

-- ============================================================
-- Helper: KYC completo (per gating veicoli)
-- ============================================================
create or replace function host_kyc_approved(p_host_id text)
returns boolean language sql stable as $$
  select exists (select 1 from hosts where id = p_host_id and kyc_status = 'approved');
$$;

-- ============================================================
-- Aggiorna gating veicoli: serve KYC approved E subscription attiva
-- (la policy era già rimpiazzata in host-subscriptions-schema.sql)
-- ============================================================
drop policy if exists "vehicles host insert" on cars;
drop policy if exists "vehicles host update" on cars;
drop policy if exists "cars host insert" on cars;
drop policy if exists "cars host update" on cars;

create policy "cars host insert"
  on cars for insert
  with check (
    exists (
      select 1 from hosts h
      where h.id = cars.host_id
        and h.owner_user_id = auth.uid()
        and host_subscription_active(h.id)
        and host_kyc_approved(h.id)
    )
  );

create policy "cars host update"
  on cars for update
  using (
    exists (
      select 1 from hosts h
      where h.id = cars.host_id
        and h.owner_user_id = auth.uid()
        and host_subscription_active(h.id)
        and host_kyc_approved(h.id)
    )
  );

-- ============================================================
-- Bucket Storage `host-documents` (RLS-protected)
-- I file sono privati: solo l'host owner legge i propri, admin vede tutto.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('host-documents', 'host-documents', false)
on conflict (id) do nothing;

drop policy if exists "host_documents owner read"  on storage.objects;
drop policy if exists "host_documents owner write" on storage.objects;
drop policy if exists "host_documents admin read"  on storage.objects;

-- L'host può leggere/scrivere solo file dentro path che inizia con il suo host_id.
-- Convenzione: storage path = `${host_id}/id-document-${timestamp}.${ext}`
create policy "host_documents owner read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'host-documents'
    and (storage.foldername(name))[1] in (
      select id from hosts where owner_user_id = auth.uid()
    )
  );

create policy "host_documents owner write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'host-documents'
    and (storage.foldername(name))[1] in (
      select id from hosts where owner_user_id = auth.uid()
    )
  );

create policy "host_documents admin read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'host-documents'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
  );

-- ============================================================
-- RPC: submit_kyc - chiamata dal client per inviare i dati al review admin.
-- Verifica i campi minimi, poi imposta kyc_status='submitted'.
-- ============================================================
create or replace function submit_kyc(p_host_id text)
returns hosts
language plpgsql security definer set search_path = public
as $$
declare h hosts;
begin
  select * into h from hosts where id = p_host_id;
  if not found then raise exception 'host non trovato'; end if;
  if h.owner_user_id <> auth.uid() then raise exception 'forbidden'; end if;

  -- Validazioni minime
  if h.legal_name is null or h.vat_number is null or h.ateco_code is null
     or h.legal_address is null or h.legal_city is null or h.legal_zip is null
     or h.representative_name is null or h.id_document_path is null
     or not coalesce(h.insurance_declared, false)
  then
    raise exception 'dati incompleti: completa tutti i campi obbligatori';
  end if;

  update hosts
     set kyc_status = 'submitted',
         kyc_submitted_at = now(),
         kyc_rejection_reason = null
   where id = p_host_id
   returning * into h;
  return h;
end $$;

-- ============================================================
-- RPC admin: approve / reject KYC
-- ============================================================
create or replace function admin_review_kyc(p_host_id text, p_action text, p_reason text default null)
returns hosts
language plpgsql security definer set search_path = public
as $$
declare h hosts;
begin
  -- Solo admin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) is not true then
    raise exception 'forbidden — admin only';
  end if;
  if p_action not in ('approve','reject') then raise exception 'azione non valida'; end if;

  update hosts
     set kyc_status = case p_action when 'approve' then 'approved' else 'rejected' end,
         verified   = case p_action when 'approve' then true else verified end,
         kyc_reviewed_at = now(),
         kyc_reviewed_by = auth.uid(),
         kyc_rejection_reason = case p_action when 'reject' then p_reason else null end
   where id = p_host_id
   returning * into h;
  if not found then raise exception 'host non trovato'; end if;
  return h;
end $$;
