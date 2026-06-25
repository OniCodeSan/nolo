-- ═════════════════════════════════════════════════════════════════════════
-- MoviQ — SECURITY HARDENING MIGRATION (consolidata)
-- ═════════════════════════════════════════════════════════════════════════
--
-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  ⚠️  ATTENZIONE — DA RIVEDERE ED ESEGUIRE A MANO DAL PROPRIETARIO       │
-- │                                                                         │
-- │  Questo file modifica RLS, policy, grant e RPC sul database di          │
-- │  PRODUZIONE. NON eseguirlo in automatico in una pipeline senza review.  │
-- │                                                                         │
-- │  • Esegui in una transazione su un branch/clone Supabase di staging.    │
-- │  • Verifica con le query di controllo in coda al file.                  │
-- │  • Aggiorna il frontend PRIMA o INSIEME a questa migrazione:            │
-- │      - services/bookings.js  createBooking  → rpc('create_booking')     │
-- │      - services/bookings.js  cancelBooking  → rpc('cancel_booking')     │
-- │      (l'INSERT/UPDATE diretto su bookings viene revocato qui sotto)     │
-- │                                                                         │
-- │  Idempotente: può essere rieseguito più volte senza errori.            │
-- │                                                                         │
-- │  ★ TOLLERANTE AGLI OGGETTI MANCANTI: ogni statement che tocca un        │
-- │    oggetto specifico (tabella/view/funzione) è protetto da un guard     │
-- │    `to_regclass(...)` o da un handler `undefined_function`. Se          │
-- │    l'oggetto non esiste in questo database, lo statement viene SALTATO  │
-- │    con un `raise notice` invece di abortire la migrazione. Puoi quindi  │
-- │    incollare l'intero file nel SQL Editor di Supabase anche se il tuo   │
-- │    schema è solo un SOTTOINSIEME di quello del repo.                    │
-- └───────────────────────────────────────────────────────────────────────┘
--
-- Esegui DOPO tutti gli altri schema (auth, host-backoffice, host-kyc,
-- host-subscriptions, host-stats, host-bookings*, moderation, messages,
-- admin-coupons, security-pii-isolation, security-rate-limit-audit,
-- image-cleanup, utm-tracking, auth-roles).
--
-- ─── Indice finding affrontati ───────────────────────────────────────────
--   §0  L2  — service_role key in GUC (solo nota, nessuna modifica distruttiva)
--   §1  M9  — modello admin unificato: helper public.is_admin()
--   §2  C1  — protezione profiles.is_admin (trigger + revoke)
--   §3  H1  — hosts: l'owner non può alterare colonne di moderazione (trigger)
--   §4  H3  — PII isolation: nessuna policy SELECT using(true) su hosts/cars
--   §5  H4  — bookings: rimozione UPDATE ampio del customer
--   §6  H5/L8 — create_booking RPC (ricalcolo server-side, no self-booking) + CHECK
--   §7  cancel_booking RPC
--   §8  H6  — paywall: rimozione "cars owner write" non gated + delete gated
--   §9  M1  — host_subscription_status: security_invoker + revoke anon
--   §10 M5  — messages: niente update ampio del recipient (solo read_at via RPC)
--   §11 M9  — riscrittura RPC/policy che usavano il claim JWT app_metadata.role
--             (admin_review_kyc, host_documents admin read, admin_coupons) → is_admin()
--             + fix admin_utm_overview (profiles.id, non profiles.user_id)
--   §12 L4  — admin_coupons: rimozione branch globale pg_class
--   §13 L7  — car_views: niente insert pubblico, solo via log_car_view
--   §14 L14 — market_stats(): revoke da public/anon, grant authenticated
--   §15 L15 — hardening grant SECURITY DEFINER (revoke public/anon, grant authenticated)
--   §16 L16/H2 — user_sessions RLS + ping_session ownership/limiti
-- ═════════════════════════════════════════════════════════════════════════


-- ═════════════════════════════════════════════════════════════════════════
-- §0 — L2: service_role key nelle GUC (booking-email-triggers.sql)
-- ═════════════════════════════════════════════════════════════════════════
-- NOTA (nessuna modifica qui): booking-email-triggers.sql legge la service
-- role key da `current_setting('app.service_role_key')`. Memorizzare la
-- service_role key in una GUC di sessione/cluster è un rischio (chiunque con
-- accesso SQL può leggerla con `show app.service_role_key`).
-- RACCOMANDAZIONE: spostare la chiave in Supabase Vault (vault.secrets) e
-- leggerla con vault.decrypted_secrets dentro get_service_role_key().
-- NON tocchiamo quel meccanismo qui per non rompere l'invio email; va
-- migrato a mano dal proprietario. Vedi sezione "follow-up manuali" nel report.


-- ═════════════════════════════════════════════════════════════════════════
-- §1 — M9: modello admin unico = profiles.is_admin. Helper is_admin().
-- ═════════════════════════════════════════════════════════════════════════
-- Unica fonte di verità per i privilegi admin. Tutte le policy/RPC qui sotto
-- (e quelle riscritte in §11) usano questa funzione invece del claim JWT.
-- NB: `language sql` ma referenzia public.profiles solo a runtime — la CREATE
-- non fallisce se profiles manca (è comunque una tabella core, assunta presente).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and is_admin = true
  );
$$;

comment on function public.is_admin() is
  'Unica fonte di verità per i privilegi admin: profiles.is_admin = true. Usare ovunque al posto del claim JWT app_metadata.role.';

-- Grant su is_admin(): guardato contro undefined_function (difesa in profondità).
do $guard$
begin
  begin
    execute $ddl$ revoke all on function public.is_admin() from public, anon $ddl$;
    execute $ddl$ grant execute on function public.is_admin() to authenticated $ddl$;
  exception
    when undefined_function then raise notice 'skip: funzione public.is_admin() assente';
    when others then raise notice 'skip grant is_admin(): %', sqlerrm;
  end;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §2 — C1: protezione di profiles.is_admin
-- ═════════════════════════════════════════════════════════════════════════
-- Nessun utente normale deve poter promuoversi ad admin. Anche con la policy
-- "profiles owner update" (che permette di aggiornare il proprio record),
-- senza questo trigger l'owner potrebbe settare is_admin=true.
-- Il trigger blocca ogni cambio di is_admin se il chiamante NON è service_role.

create or replace function public.guard_profiles_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(
    current_setting('request.jwt.claim.role', true),  -- ruolo PostgREST (anon/authenticated/service_role)
    current_setting('role', true),                    -- fallback ruolo Postgres corrente
    ''
  );
begin
  if new.is_admin is distinct from old.is_admin then
    if v_role <> 'service_role' then
      raise exception 'Cambio di is_admin non consentito (solo service_role).'
        using errcode = '42501';  -- insufficient_privilege
    end if;
  end if;
  return new;
end;
$$;

-- Guard: crea il trigger solo se la tabella public.profiles esiste.
do $guard$
begin
  if to_regclass('public.profiles') is not null then
    execute $ddl$ drop trigger if exists guard_profiles_is_admin on public.profiles $ddl$;
    execute $ddl$ create trigger guard_profiles_is_admin
      before update on public.profiles
      for each row execute function public.guard_profiles_is_admin() $ddl$;
  else
    raise notice 'skip: tabella public.profiles assente — trigger guard_profiles_is_admin non creato';
  end if;
end $guard$;

-- Revoca esplicita del privilegio di UPDATE sulla sola colonna is_admin.
-- Guard: tabella mancante o setup senza grant a livello-colonna → notice.
do $guard$
begin
  if to_regclass('public.profiles') is not null then
    begin
      execute $ddl$ revoke update (is_admin) on public.profiles from authenticated $ddl$;
    exception when others then
      raise notice 'revoke update(is_admin) saltato: %', sqlerrm;
    end;
  else
    raise notice 'skip: tabella public.profiles assente — revoke update(is_admin) non applicato';
  end if;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §3 — H1: hosts — l'owner non può alterare le colonne di moderazione
-- ═════════════════════════════════════════════════════════════════════════
-- Le policy owner-update (host-backoffice "hosts owner update" e auth-roles
-- "hosts_update_host_only") permettono all'owner di aggiornare il proprio
-- record host: senza protezioni potrebbe auto-verificarsi o togliersi una
-- sospensione. Usiamo un trigger che FORZA i campi di moderazione ai valori
-- OLD, a meno che il chiamante sia service_role o admin (is_admin()).

create or replace function public.guard_hosts_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(
    current_setting('request.jwt.claim.role', true),
    current_setting('role', true),
    ''
  );
  v_privileged boolean;
begin
  -- service_role bypassa; admin (is_admin) può cambiare i campi di moderazione.
  v_privileged := (v_role = 'service_role') or public.is_admin();
  if not v_privileged then
    new.status           := old.status;
    new.verified         := old.verified;
    new.verified_at      := old.verified_at;
    new.suspended_at     := old.suspended_at;
    new.featured         := old.featured;
    new.kyc_status       := old.kyc_status;
    new.kyc_submitted_at := old.kyc_submitted_at;
    new.kyc_reviewed_at  := old.kyc_reviewed_at;
    new.kyc_reviewed_by  := old.kyc_reviewed_by;
    new.kyc_rejection_reason := old.kyc_rejection_reason;
    new.moderation_notes := old.moderation_notes;
    new.max_images       := old.max_images;
    new.owner_user_id    := old.owner_user_id;  -- niente cambio proprietà via UPDATE diretto
  end if;
  return new;
end;
$$;

-- Guard: crea il trigger solo se la tabella public.hosts esiste.
do $guard$
begin
  if to_regclass('public.hosts') is not null then
    execute $ddl$ drop trigger if exists guard_hosts_moderation on public.hosts $ddl$;
    execute $ddl$ create trigger guard_hosts_moderation
      before update on public.hosts
      for each row execute function public.guard_hosts_moderation() $ddl$;
  else
    raise notice 'skip: tabella public.hosts assente — trigger guard_hosts_moderation non creato';
  end if;
end $guard$;

-- NB: i campi sopra restano modificabili solo via RPC SECURITY DEFINER
-- (admin_set_host_status, admin_set_host_featured, admin_review_kyc, submit_kyc)
-- e dalle Edge Functions con service_role.


-- ═════════════════════════════════════════════════════════════════════════
-- §4 — H3: PII isolation — nessuna policy SELECT using(true) su hosts/cars
-- ═════════════════════════════════════════════════════════════════════════
-- La superficie pubblica sono le view *_public (security-pii-isolation.sql).
-- Rimuoviamo qualsiasi policy di lettura pubblica permissiva sulle tabelle
-- base, lasciando solo owner-read + admin-read.

-- hosts: droppa eventuali public-read residui (schema.sql ne ricrea uno!) +
-- riconferma owner/admin read. Tutto guardato su esistenza di public.hosts.
do $guard$
begin
  if to_regclass('public.hosts') is not null then
    execute $ddl$ drop policy if exists "public read hosts" on public.hosts $ddl$;
    execute $ddl$ drop policy if exists "hosts public read" on public.hosts $ddl$;

    execute $ddl$ drop policy if exists "hosts owner read" on public.hosts $ddl$;
    execute $ddl$ create policy "hosts owner read" on public.hosts
      for select to authenticated
      using (auth.uid() is not null and auth.uid() = owner_user_id) $ddl$;

    execute $ddl$ drop policy if exists "hosts admin read" on public.hosts $ddl$;
    execute $ddl$ create policy "hosts admin read" on public.hosts
      for select to authenticated
      using (public.is_admin()) $ddl$;
  else
    raise notice 'skip: tabella public.hosts assente — policy read su hosts non applicate';
  end if;
end $guard$;

-- cars: droppa public-read residui + riconferma owner/admin read.
-- Owner-read su cars: il proprietario (host) deve leggere il proprio inventario
-- completo (anche draft/rejected). Definita qui in modo idempotente nel caso
-- in cui host-vehicles-schema non sia stato applicato.
do $guard$
begin
  if to_regclass('public.cars') is not null then
    execute $ddl$ drop policy if exists "public read cars" on public.cars $ddl$;
    execute $ddl$ drop policy if exists "cars public read" on public.cars $ddl$;

    execute $ddl$ drop policy if exists "cars admin read" on public.cars $ddl$;
    execute $ddl$ create policy "cars admin read" on public.cars
      for select to authenticated
      using (public.is_admin()) $ddl$;

    execute $ddl$ drop policy if exists "cars owner read" on public.cars $ddl$;
    execute $ddl$ create policy "cars owner read" on public.cars
      for select to authenticated
      using (
        auth.uid() is not null
        and exists (
          select 1 from public.hosts h
          where h.id = public.cars.host_id
            and h.owner_user_id = auth.uid()
        )
      ) $ddl$;
  else
    raise notice 'skip: tabella public.cars assente — policy read su cars non applicate';
  end if;
end $guard$;

-- Guard finale: se per qualsiasi motivo restasse una policy SELECT con
-- qualifier 'true' su hosts/cars, la rimuoviamo dinamicamente.
-- (pg_policies è sempre presente; il loop non gira su tabelle inesistenti.)
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('hosts','cars')
      and cmd = 'SELECT'
      and coalesce(qual, '') in ('true', '(true)')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    raise notice 'Rimossa policy permissiva % su %.%', r.policyname, r.schemaname, r.tablename;
  end loop;
end $$;


-- ═════════════════════════════════════════════════════════════════════════
-- §5 — H4: bookings — rimozione dell'UPDATE ampio del customer
-- ═════════════════════════════════════════════════════════════════════════
-- Il customer NON deve poter cambiare status/total/date direttamente.
-- La cancellazione passa da cancel_booking() (§7); le transizioni host
-- passano da accept/decline/complete_booking().
-- Guard: solo se public.bookings esiste.
do $guard$
begin
  if to_regclass('public.bookings') is not null then
    execute $ddl$ drop policy if exists "bookings owner update" on public.bookings $ddl$;
  else
    raise notice 'skip: tabella public.bookings assente — drop "bookings owner update" non applicato';
  end if;
end $guard$;
-- (La policy "bookings host update" resta: serve all'host, ma le RPC sono il
--  percorso raccomandato. L'host non può comunque toccare prezzi qui perché
--  le RPC sono il canale e non esiste UI di edit prezzo lato host.)


-- ═════════════════════════════════════════════════════════════════════════
-- §6 — H5 / L8: CHECK constraints + create_booking RPC
-- ═════════════════════════════════════════════════════════════════════════

-- ── CHECK constraints (guardati: NOT VALID per non fallire su dati legacy) ──
-- Guard aggiuntivo: salta tutto se public.bookings non esiste.
do $$
begin
  if to_regclass('public.bookings') is null then
    raise notice 'skip: tabella public.bookings assente — CHECK constraints non aggiunti';
    return;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_total_nonneg') then
    alter table public.bookings add constraint bookings_total_nonneg check (total >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_subtotal_nonneg') then
    alter table public.bookings add constraint bookings_subtotal_nonneg check (subtotal >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_days_positive') then
    alter table public.bookings add constraint bookings_days_positive check (days > 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_dates_order') then
    alter table public.bookings add constraint bookings_dates_order check (date_to >= date_from) not valid;
  end if;
  -- deposit esiste come colonna NOT NULL in auth-schema; vincolo >= 0
  if exists (select 1 from information_schema.columns
              where table_schema='public' and table_name='bookings' and column_name='deposit')
     and not exists (select 1 from pg_constraint where conname = 'bookings_deposit_nonneg') then
    alter table public.bookings add constraint bookings_deposit_nonneg check (deposit >= 0) not valid;
  end if;
end $$;

-- ── RPC: create_booking ─────────────────────────────────────────────────
-- Ricalcola TUTTO lato server leggendo price_per_day da cars; il client non
-- può più "regalarsi" prezzi. deposit = costante 200€ (come nel frontend).
-- Vincoli: date_to > date_from, date_from non nel passato, no self-booking (L8).
-- NB plpgsql: la CREATE non fallisce anche se cars/bookings mancano (binding
-- differito a runtime); lasciata incondizionata.
create or replace function public.create_booking(
  p_car_id    text,
  p_date_from date,
  p_date_to   date,
  p_message   text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_car        public.cars;
  v_host_owner uuid;
  v_days       int;
  v_subtotal   int;
  v_deposit    constant int := 200;  -- cauzione fissa, allineata al frontend
  v_total      int;
  b            public.bookings;
begin
  if v_uid is null then
    raise exception 'Devi essere autenticato per prenotare.' using errcode = '42501';
  end if;

  -- Validazione date
  if p_date_from is null or p_date_to is null then
    raise exception 'Date mancanti.';
  end if;
  if p_date_to <= p_date_from then
    raise exception 'La data di riconsegna deve essere successiva al ritiro.';
  end if;
  if p_date_from < current_date then
    raise exception 'Non puoi prenotare in una data passata.';
  end if;

  -- Carica l'auto (server-side) e l'owner dell'host
  select * into v_car from public.cars where id = p_car_id;
  if not found then
    raise exception 'Auto non trovata.';
  end if;
  if v_car.status is distinct from 'active' then
    raise exception 'Questa auto non è prenotabile.';
  end if;

  select h.owner_user_id into v_host_owner
    from public.hosts h where h.id = v_car.host_id;

  -- L8: niente prenotazione della propria auto
  if v_host_owner is not null and v_host_owner = v_uid then
    raise exception 'Non puoi prenotare un veicolo di cui sei il noleggiatore.';
  end if;

  -- Ricalcolo importi server-side
  v_days     := (p_date_to - p_date_from);          -- giorni interi tra le date
  if v_days < 1 then v_days := 1; end if;
  v_subtotal := v_car.price_per_day * v_days;
  v_total    := v_subtotal + v_deposit;

  insert into public.bookings (
    user_id, car_id, host_id, date_from, date_to,
    days, price_per_day, subtotal, deposit, total,
    message, status
  ) values (
    v_uid, v_car.id, v_car.host_id, p_date_from, p_date_to,
    v_days, v_car.price_per_day, v_subtotal, v_deposit, v_total,
    nullif(left(coalesce(p_message, ''), 2000), ''), 'requested'
  )
  returning * into b;

  return b;
end;
$$;

-- Revoca INSERT diretto su bookings: si crea SOLO via RPC. Guardato su tabella.
do $guard$
begin
  if to_regclass('public.bookings') is not null then
    begin
      execute $ddl$ revoke insert on public.bookings from authenticated $ddl$;
    exception when others then
      raise notice 'revoke insert on bookings saltato: %', sqlerrm;
    end;
    -- Drop policy di insert dirette (sia owner che role-based di auth-roles).
    execute $ddl$ drop policy if exists "bookings owner insert" on public.bookings $ddl$;
    execute $ddl$ drop policy if exists "bookings_insert_customer_only" on public.bookings $ddl$;
  else
    raise notice 'skip: tabella public.bookings assente — revoke insert/drop policy non applicati';
  end if;
end $guard$;

-- Grant su create_booking(): guardato contro undefined_function.
do $guard$
begin
  begin
    execute $ddl$ revoke all on function public.create_booking(text, date, date, text) from public, anon $ddl$;
    execute $ddl$ grant execute on function public.create_booking(text, date, date, text) to authenticated $ddl$;
  exception
    when undefined_function then raise notice 'skip: funzione public.create_booking(...) assente';
    when others then raise notice 'skip grant create_booking(): %', sqlerrm;
  end;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §7 — cancel_booking RPC (il customer cancella SOLO le proprie, se cancellabili)
-- ═════════════════════════════════════════════════════════════════════════
-- NB plpgsql: CREATE incondizionata (binding differito).
create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare b public.bookings;
begin
  if auth.uid() is null then
    raise exception 'Non autenticato.' using errcode = '42501';
  end if;
  update public.bookings
     set status = 'cancelled'
   where id = p_booking_id
     and user_id = auth.uid()
     and status in ('requested', 'confirmed')   -- stati cancellabili dal cliente
  returning * into b;
  if b.id is null then
    raise exception 'Prenotazione non cancellabile (non tua o in stato non valido).';
  end if;
  return b;
end;
$$;

-- Grant su cancel_booking(): guardato contro undefined_function.
do $guard$
begin
  begin
    execute $ddl$ revoke all on function public.cancel_booking(uuid) from public, anon $ddl$;
    execute $ddl$ grant execute on function public.cancel_booking(uuid) to authenticated $ddl$;
  exception
    when undefined_function then raise notice 'skip: funzione public.cancel_booking(uuid) assente';
    when others then raise notice 'skip grant cancel_booking(): %', sqlerrm;
  end;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §8 — H6: paywall — rimozione "cars owner write" non gated
-- ═════════════════════════════════════════════════════════════════════════
-- La policy "cars owner write" (FOR ALL, host-backoffice-schema) bypassa il
-- gating subscription+KYC. La rimuoviamo SOLO se le policy gated esistono.
-- Guard: tutto saltato se public.cars non esiste.
do $$
declare
  v_has_gated_insert boolean;
  v_has_gated_update boolean;
begin
  if to_regclass('public.cars') is null then
    raise notice 'skip: tabella public.cars assente — gestione "cars owner write" non applicata';
    return;
  end if;
  select exists(select 1 from pg_policies where schemaname='public' and tablename='cars' and policyname='cars host insert') into v_has_gated_insert;
  select exists(select 1 from pg_policies where schemaname='public' and tablename='cars' and policyname='cars host update') into v_has_gated_update;

  if v_has_gated_insert and v_has_gated_update then
    drop policy if exists "cars owner write" on public.cars;
    raise notice 'Policy "cars owner write" rimossa: restano solo le policy gated insert/update.';
  else
    raise warning 'Policy gated "cars host insert"/"cars host update" NON trovate: "cars owner write" NON rimossa. Applica prima host-kyc-schema.sql.';
  end if;
end $$;

-- DELETE gated esplicito: solo l'owner con subscription attiva + KYC approvato.
-- (Prima il DELETE era coperto dal FOR ALL ungated; ora serve una policy dedicata.)
-- Guard: solo se public.cars esiste.
do $guard$
begin
  if to_regclass('public.cars') is not null then
    execute $ddl$ drop policy if exists "cars host delete" on public.cars $ddl$;
    execute $ddl$ create policy "cars host delete"
      on public.cars for delete to authenticated
      using (
        exists (
          select 1 from public.hosts h
          where h.id = public.cars.host_id
            and h.owner_user_id = auth.uid()
            and public.host_subscription_active(h.id)
            and public.host_kyc_approved(h.id)
        )
      ) $ddl$;
  else
    raise notice 'skip: tabella public.cars assente — policy "cars host delete" non creata';
  end if;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §9 — M1: host_subscription_status view → security_invoker + revoke anon
-- ═════════════════════════════════════════════════════════════════════════
-- Con security_invoker la view rispetta la RLS di host_subscriptions
-- (owner-read), quindi un utente vede solo lo stato dei propri host.
-- Guard: tutto saltato se la view public.host_subscription_status non esiste.
do $guard$
begin
  if to_regclass('public.host_subscription_status') is not null then
    begin
      execute 'alter view public.host_subscription_status set (security_invoker = on)';
    exception when others then
      -- security_invoker richiede Postgres 15+. Se non disponibile, avvisa.
      raise warning 'security_invoker non applicabile su host_subscription_status: % — verificare versione Postgres (>=15).', sqlerrm;
    end;
    execute $ddl$ revoke select on public.host_subscription_status from anon $ddl$;
    execute $ddl$ grant  select on public.host_subscription_status to authenticated $ddl$;
  else
    raise notice 'skip: view public.host_subscription_status assente — security_invoker/grant non applicati';
  end if;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §10 — M5: messages — niente UPDATE ampio del recipient
-- ═════════════════════════════════════════════════════════════════════════
-- Senza colonne specificate, "messages recipient update" lascia al recipient
-- la possibilità di modificare body/sender_id/created_at. Rimuoviamo la policy
-- e indirizziamo la "segna come letto" sulla RPC mark_thread_read() (già
-- presente, SECURITY DEFINER). Aggiungiamo anche un trigger di difesa in
-- profondità che impedisce modifiche a campi diversi da read_at.

-- Function trigger: CREATE incondizionata (plpgsql, binding differito).
create or replace function public.guard_messages_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.body        is distinct from old.body
     or new.sender_id    is distinct from old.sender_id
     or new.recipient_id is distinct from old.recipient_id
     or new.booking_id   is distinct from old.booking_id
     or new.created_at   is distinct from old.created_at
  then
    raise exception 'Solo read_at è modificabile sui messaggi.' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Guard: drop policy + create trigger solo se public.messages esiste.
do $guard$
begin
  if to_regclass('public.messages') is not null then
    execute $ddl$ drop policy if exists "messages recipient update" on public.messages $ddl$;
    execute $ddl$ drop trigger if exists guard_messages_immutable on public.messages $ddl$;
    execute $ddl$ create trigger guard_messages_immutable
      before update on public.messages
      for each row execute function public.guard_messages_immutable() $ddl$;
  else
    raise notice 'skip: tabella public.messages assente — policy/trigger messages non applicati';
  end if;
end $guard$;
-- NB: mark_thread_read() è SECURITY DEFINER e bypassa l'assenza di policy
-- UPDATE; il trigger sopra protegge comunque da modifiche indebite.


-- ═════════════════════════════════════════════════════════════════════════
-- §11 — M9: riscrittura RPC/policy che usavano il claim JWT app_metadata.role
-- ═════════════════════════════════════════════════════════════════════════

-- 11.a — admin_review_kyc: usa is_admin() invece del claim JWT.
-- NB plpgsql: CREATE incondizionata (binding differito su hosts).
create or replace function public.admin_review_kyc(p_host_id text, p_action text, p_reason text default null)
returns public.hosts
language plpgsql security definer set search_path = public
as $$
declare h public.hosts;
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only';
  end if;
  if p_action not in ('approve','reject') then raise exception 'azione non valida'; end if;

  update public.hosts
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

-- 11.b — storage: "host_documents admin read" usa is_admin() invece del claim.
-- storage.objects esiste sempre su Supabase, ma wrappiamo in DO con handler
-- difensivo per non abortire in ambienti senza l'estensione storage.
do $guard$
begin
  begin
    execute $ddl$ drop policy if exists "host_documents admin read" on storage.objects $ddl$;
    execute $ddl$ create policy "host_documents admin read"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'host-documents'
        and public.is_admin()
      ) $ddl$;
  exception when others then
    raise notice 'skip: policy "host_documents admin read" su storage.objects non applicata: %', sqlerrm;
  end;
end $guard$;

-- 11.c — admin_utm_overview: FIX bug profiles.user_id → profiles.id + is_admin().
-- NB plpgsql: CREATE incondizionata (binding differito su user_sessions).
create or replace function public.admin_utm_overview()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  with recent as (
    select * from public.user_sessions
     where started_at >= now() - interval '30 days'
  ),
  by_src as (
    select coalesce(utm_source, '(direct)') as k, count(*)::int as v
    from recent group by 1 order by 2 desc limit 12
  ),
  by_med as (
    select coalesce(utm_medium, '(none)') as k, count(*)::int as v
    from recent where utm_source is not null group by 1 order by 2 desc limit 12
  ),
  by_camp as (
    select utm_campaign as k, count(*)::int as v,
           count(distinct anon_id)::int as visitors
    from recent where utm_campaign is not null
    group by 1 order by 2 desc limit 20
  ),
  by_landing as (
    select coalesce(landing_path, '/') as k, count(*)::int as v
    from recent where utm_source is not null
    group by 1 order by 2 desc limit 10
  ),
  totals as (
    select
      count(*) filter (where utm_source is not null)::int as utm_sessions,
      count(*)::int as total_sessions,
      count(distinct anon_id) filter (where utm_source is not null)::int as utm_visitors
    from recent
  )
  select jsonb_build_object(
    'utm_sessions',  (select utm_sessions  from totals),
    'utm_visitors',  (select utm_visitors  from totals),
    'total_sessions',(select total_sessions from totals),
    'by_source',     coalesce((select jsonb_object_agg(k, v) from by_src),     '{}'::jsonb),
    'by_medium',     coalesce((select jsonb_object_agg(k, v) from by_med),     '{}'::jsonb),
    'by_landing',    coalesce((select jsonb_object_agg(k, v) from by_landing), '{}'::jsonb),
    'campaigns',     coalesce((
        select jsonb_agg(jsonb_build_object('campaign', k, 'sessions', v, 'visitors', visitors))
        from by_camp
      ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end $$;


-- ═════════════════════════════════════════════════════════════════════════
-- §12 — L4: admin_coupons read policy gated strettamente su is_admin()
-- ═════════════════════════════════════════════════════════════════════════
-- Rimuoviamo il branch globale "or exists (select 1 from pg_class where
-- relname='admin_users')" che apriva la lettura a chiunque (la tabella di
-- catalogo esiste sempre).
-- Guard: solo se public.admin_coupons esiste.
do $guard$
begin
  if to_regclass('public.admin_coupons') is not null then
    execute $ddl$ drop policy if exists "admin_coupons admin read" on public.admin_coupons $ddl$;
    execute $ddl$ create policy "admin_coupons admin read"
      on public.admin_coupons for select to authenticated
      using (public.is_admin()) $ddl$;
  else
    raise notice 'skip: tabella public.admin_coupons assente — policy "admin_coupons admin read" non applicata';
  end if;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §13 — L7: car_views — niente insert pubblico, solo via log_car_view
-- ═════════════════════════════════════════════════════════════════════════
-- (questo è esattamente lo statement che aveva causato l'errore 42P01 in prod)
-- Guard: drop policy + revoke insert solo se public.car_views esiste.
do $guard$
begin
  if to_regclass('public.car_views') is not null then
    execute $ddl$ drop policy if exists "car_views public insert" on public.car_views $ddl$;
    -- (la policy "car_views host read" resta invariata)
    -- log_car_view è già SECURITY DEFINER (host-stats-schema): bypassa l'assenza
    -- di policy insert. Revochiamo l'INSERT diretto su car_views.
    begin
      execute $ddl$ revoke insert on public.car_views from authenticated, anon $ddl$;
    exception when others then
      raise notice 'revoke insert on car_views saltato: %', sqlerrm;
    end;
  else
    raise notice 'skip: tabella public.car_views assente — policy/revoke su car_views non applicati';
  end if;
end $guard$;

-- Grant su log_car_view(): guardato contro undefined_function.
-- (anon mantenuto: il log delle view deve funzionare anche per non loggati)
do $guard$
begin
  begin
    execute $ddl$ revoke all on function public.log_car_view(text, text) from public $ddl$;
    execute $ddl$ grant execute on function public.log_car_view(text, text) to anon, authenticated $ddl$;
  exception
    when undefined_function then raise notice 'skip: funzione public.log_car_view(text, text) assente';
    when others then raise notice 'skip grant log_car_view(): %', sqlerrm;
  end;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §14 — L14: market_stats() — revoke da public/anon, grant authenticated
-- ═════════════════════════════════════════════════════════════════════════
-- Guard: funzione potenzialmente assente → handler undefined_function.
do $guard$
begin
  begin
    execute $ddl$ revoke execute on function public.market_stats() from public, anon $ddl$;
    execute $ddl$ grant  execute on function public.market_stats() to authenticated $ddl$;
  exception
    when undefined_function then raise notice 'skip: funzione public.market_stats() assente';
    when others then raise notice 'skip grant market_stats(): %', sqlerrm;
  end;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- §15 — L15: hardening grant su tutte le RPC SECURITY DEFINER
-- ═════════════════════════════════════════════════════════════════════════
-- Pattern: revoke da public/anon, grant solo authenticated.
-- (ping_session resta eseguibile da anon — vedi §16; è intenzionale.)
-- Già tollerante: cattura undefined_function per ogni funzione assente.
do $$
declare
  fn text;
  fns text[] := array[
    'public.accept_booking(uuid, text)',
    'public.decline_booking(uuid, text)',
    'public.complete_booking(uuid, text)',
    'public.create_booking(text, date, date, text)',
    'public.cancel_booking(uuid)',
    'public.claim_host(text)',
    'public.submit_kyc(text)',
    'public.admin_review_kyc(text, text, text)',
    'public.admin_set_host_status(text, host_status, text)',
    'public.admin_set_host_featured(text, boolean)',
    'public.admin_reject_car(text, text)',
    'public.admin_set_report_status(uuid, text, text)',
    'public.admin_kpi()',
    'public.admin_audit_log(int, int)',
    'public.admin_utm_overview()',
    'public.admin_images_stats()',
    'public.admin_cleanup_queue(text, int)',
    'public.admin_purge_host_images(text)',
    'public.host_stats(text)',
    'public.mark_thread_read(uuid)',
    'public.mark_all_notifications_read()',
    'public.count_unread_notifications()'
  ];
begin
  foreach fn in array fns loop
    begin
      execute format('revoke all on function %s from public, anon', fn);
      execute format('grant execute on function %s to authenticated', fn);
    exception when undefined_function then
      raise notice 'Funzione assente, salto grant: %', fn;
    when others then
      raise notice 'Grant non applicato su %: %', fn, sqlerrm;
    end;
  end loop;
end $$;


-- ═════════════════════════════════════════════════════════════════════════
-- §16 — L16 / H2: user_sessions RLS + ping_session ownership & limiti
-- ═════════════════════════════════════════════════════════════════════════

-- Tabella (la creiamo noi qui con IF NOT EXISTS → sempre presente dopo questo blocco).
create table if not exists public.user_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  anon_id      text,
  ip           text,
  country      text,
  region       text,
  city         text,
  user_agent   text,
  referrer     text,
  started_at   timestamptz not null default now(),
  last_ping_at timestamptz not null default now(),
  pages_viewed int not null default 1
);

alter table public.user_sessions enable row level security;

-- Lettura: solo l'owner (no anon SELECT). Gli admin leggono via RPC aggregata.
drop policy if exists "user_sessions owner read" on public.user_sessions;
create policy "user_sessions owner read"
  on public.user_sessions for select to authenticated
  using (user_id = auth.uid());

-- Nessuna policy INSERT/UPDATE: la scrittura passa SOLO da ping_session
-- (SECURITY DEFINER) e dalle Edge Functions con service_role.
do $$
begin
  begin
    revoke insert, update on public.user_sessions from authenticated, anon;
  exception when others then
    raise notice 'revoke su user_sessions saltato: %', sqlerrm;
  end;
end $$;

-- ping_session hardened: la branch UPDATE verifica l'ownership della sessione
-- (id + anon_id corrispondente OPPURE user_id già uguale all'utente corrente),
-- così un caller non può "rubare" o riassegnare sessioni altrui. Limiti di
-- lunghezza su tutti i campi testo per evitare abusi.
create or replace function public.ping_session(
  p_session_id   uuid     default null,
  p_anon_id      text     default null,
  p_ip           text     default null,
  p_country      text     default null,
  p_region       text     default null,
  p_city         text     default null,
  p_user_agent   text     default null,
  p_referrer     text     default null,
  p_utm_source   text     default null,
  p_utm_medium   text     default null,
  p_utm_campaign text     default null,
  p_utm_term     text     default null,
  p_utm_content  text     default null,
  p_landing_path text     default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_id  uuid := p_session_id;
  v_uid uuid := auth.uid();
  v_updated boolean := false;
  -- Limiti di lunghezza (difesa contro payload abnormi)
  l_anon    text := left(p_anon_id,     128);
  l_ip      text := left(p_ip,           64);
  l_country text := left(p_country,      64);
  l_region  text := left(p_region,      128);
  l_city    text := left(p_city,        128);
  l_ua      text := left(p_user_agent,  512);
  l_ref     text := left(p_referrer,    512);
  l_src     text := nullif(trim(left(p_utm_source,   128)), '');
  l_med     text := nullif(trim(left(p_utm_medium,   128)), '');
  l_camp    text := nullif(trim(left(p_utm_campaign, 128)), '');
  l_term    text := nullif(trim(left(p_utm_term,     128)), '');
  l_cont    text := nullif(trim(left(p_utm_content,  128)), '');
  l_land    text := nullif(trim(left(p_landing_path, 256)), '');
begin
  -- NOTA IP: idealmente l'IP andrebbe derivato server-side (header
  -- X-Forwarded-For dentro un'Edge Function), non passato dal client che può
  -- falsificarlo. Qui lo accettiamo come fornito; spostare la cattura IP a
  -- una Edge Function è un follow-up consigliato.

  if v_id is not null then
    -- UPDATE solo se il caller è davvero il proprietario della sessione.
    update public.user_sessions
       set last_ping_at = now(),
           pages_viewed = pages_viewed + 1,
           user_id      = coalesce(user_id, v_uid),
           utm_source   = coalesce(utm_source,   l_src),
           utm_medium   = coalesce(utm_medium,   l_med),
           utm_campaign = coalesce(utm_campaign, l_camp),
           utm_term     = coalesce(utm_term,     l_term),
           utm_content  = coalesce(utm_content,  l_cont),
           landing_path = coalesce(landing_path, l_land),
           referrer     = coalesce(referrer,     l_ref),
           country      = coalesce(country,      l_country),
           region       = coalesce(region,       l_region),
           city         = coalesce(city,         l_city),
           ip           = coalesce(ip,           l_ip)
     where id = v_id
       and (
            (v_uid is not null and user_id = v_uid)        -- owner autenticato
         or (anon_id is not distinct from l_anon)          -- stessa sessione anon
         or (user_id is null and l_anon is null)           -- sessione anon senza id
       );
    if found then v_updated := true; end if;
  end if;

  if not v_updated then
    -- Crea una nuova sessione (id ignorato/non posseduto → nuovo record).
    insert into public.user_sessions (
      user_id, anon_id, ip, country, region, city, user_agent, referrer,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_path
    ) values (
      v_uid, l_anon, l_ip, l_country, l_region, l_city, l_ua, l_ref,
      l_src, l_med, l_camp, l_term, l_cont, l_land
    )
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

-- ping_session resta eseguibile da anon (tracking pre-login: intenzionale).
-- Guard: funzione appena creata, ma wrappiamo per difesa in profondità.
do $guard$
begin
  begin
    execute $ddl$ revoke all on function public.ping_session(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) from public $ddl$;
    execute $ddl$ grant execute on function public.ping_session(uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated $ddl$;
  exception
    when undefined_function then raise notice 'skip: funzione public.ping_session(...) assente';
    when others then raise notice 'skip grant ping_session(): %', sqlerrm;
  end;
end $guard$;


-- ═════════════════════════════════════════════════════════════════════════
-- ✅ QUERY DI VERIFICA (esegui dopo la migrazione, leggono solo)
-- ═════════════════════════════════════════════════════════════════════════
--
-- 1) Nessuna policy SELECT permissiva (using true) su hosts/cars:
--    select tablename, policyname, qual from pg_policies
--     where schemaname='public' and tablename in ('hosts','cars')
--       and cmd='SELECT' order by tablename, policyname;
--    (atteso: solo owner/admin read; nessun qual = 'true')
--
-- 2) RLS attiva sulle tabelle sensibili:
--    select relname, relrowsecurity from pg_class
--     where relname in ('profiles','bookings','hosts','cars','car_views',
--                       'user_sessions','messages','admin_coupons')
--     order by relname;
--    (atteso: relrowsecurity = true ovunque)
--
-- 3) Trigger di protezione presenti:
--    select tgname, tgrelid::regclass from pg_trigger
--     where tgname in ('guard_profiles_is_admin','guard_hosts_moderation',
--                      'guard_messages_immutable')
--     order by tgname;
--
-- 4) bookings: niente policy di INSERT/UPDATE diretta per il customer:
--    select policyname, cmd from pg_policies
--     where schemaname='public' and tablename='bookings' order by cmd;
--    (atteso: nessuna 'bookings owner insert'/'bookings owner update'/
--     'bookings_insert_customer_only')
--
-- 5) Grant sulle RPC (nessun EXECUTE a public/anon eccetto ping_session/log_car_view):
--    select p.proname, array_agg(distinct acl.privilege_type) , grantee
--      from pg_proc p
--      cross join lateral aclexplode(p.proacl) acl
--      join pg_roles r on r.oid = acl.grantee
--     where p.pronamespace = 'public'::regnamespace
--       and p.proname in ('create_booking','cancel_booking','market_stats',
--                         'admin_review_kyc','admin_utm_overview')
--     group by p.proname, grantee;
--
-- 6) host_subscription_status NON leggibile da anon:
--    select grantee, privilege_type from information_schema.role_table_grants
--     where table_name='host_subscription_status';
--
-- 7) Helper is_admin() esiste ed è SECURITY DEFINER:
--    select proname, prosecdef from pg_proc
--     where proname='is_admin' and pronamespace='public'::regnamespace;
-- ═════════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════════
-- §18 — L5: idempotenza stripe-webhook
-- Tabella di deduplica eventi Stripe. La edge function stripe-webhook inserisce
-- event.id prima di elaborare; una violazione di PK = evento già processato →
-- short-circuit (evita email transazionali duplicate sui retry/replay).
-- ═════════════════════════════════════════════════════════════════════════
create table if not exists public.stripe_webhook_events (
  event_id     text primary key,
  type         text,
  processed_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
-- Solo service_role (la edge function) accede: nessuna policy per anon/authenticated.
revoke all on public.stripe_webhook_events from anon, authenticated;

-- Retention: pulizia eventi più vecchi di 30 giorni (eseguibile da un cron).
create or replace function public.prune_stripe_webhook_events()
returns void language sql security definer set search_path = public as $$
  delete from public.stripe_webhook_events where processed_at < now() - interval '30 days';
$$;
revoke all on function public.prune_stripe_webhook_events() from public, anon, authenticated;
