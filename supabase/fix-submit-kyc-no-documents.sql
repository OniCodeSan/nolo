-- KYC semplificato: non servono più documento del legale rappresentante né upload.
-- submit_kyc ora richiede solo i dati societari + sede + dichiarazione assicurativa.
-- Idempotente (create or replace). Corpo invariato a parte i check rimossi.

create or replace function submit_kyc(p_host_id text)
returns hosts
language plpgsql security definer set search_path = public
as $$
declare h hosts;
begin
  select * into h from hosts where id = p_host_id;
  if not found then raise exception 'host non trovato'; end if;
  if h.owner_user_id <> auth.uid() then raise exception 'forbidden'; end if;

  -- Validazioni minime: dati società + sede + assicurazione (niente documenti)
  if h.legal_name is null or h.vat_number is null or h.ateco_code is null
     or h.legal_address is null or h.legal_city is null or h.legal_zip is null
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
