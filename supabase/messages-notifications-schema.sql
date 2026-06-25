-- MoviQ: messaggi cliente↔host + feed notifiche + preferenze utente.
-- Esegui DOPO host-stats-schema.sql.

-- ============ MESSAGGI ============
create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  sender_id     uuid not null references auth.users(id) on delete cascade,
  recipient_id  uuid not null references auth.users(id) on delete cascade,
  body          text not null check (length(body) > 0 and length(body) <= 2000),
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists messages_booking_idx       on messages(booking_id, created_at);
create index if not exists messages_recipient_unread  on messages(recipient_id) where read_at is null;

alter table messages enable row level security;

drop policy if exists "messages participants read"   on messages;
drop policy if exists "messages sender insert"        on messages;
drop policy if exists "messages recipient update"     on messages;

create policy "messages participants read"
  on messages for select using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

create policy "messages sender insert"
  on messages for insert with check (
    auth.uid() = sender_id
    -- valida che sender/recipient siano effettivamente le parti della booking
    and exists (
      select 1 from bookings b
        left join cars c on c.id = b.car_id
        left join hosts h on h.id = c.host_id
       where b.id = booking_id
         and (
           -- sender è il cliente
           (b.user_id = auth.uid() and recipient_id = h.owner_user_id)
           -- oppure sender è l'host
           or (h.owner_user_id = auth.uid() and recipient_id = b.user_id)
         )
    )
  );

create policy "messages recipient update"
  on messages for update using (auth.uid() = recipient_id);

-- ============ NOTIFICHE ============
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,                -- 'booking_confirmed' / 'booking_declined' / 'new_message' / 'booking_completed' / 'system' / 'booking_request'
  title       text not null,
  body        text,
  link        text,                          -- es. '/prenotazioni/<uuid>'
  meta        jsonb default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notif_user_recent   on notifications(user_id, created_at desc);
create index if not exists notif_unread        on notifications(user_id) where read_at is null;

alter table notifications enable row level security;
drop policy if exists "notifications owner read"   on notifications;
drop policy if exists "notifications owner update" on notifications;
create policy "notifications owner read"   on notifications for select using (auth.uid() = user_id);
create policy "notifications owner update" on notifications for update using (auth.uid() = user_id);

-- ============ PREFERENZE UTENTE (su profiles) ============
alter table profiles add column if not exists notif_email_bookings boolean default true;
alter table profiles add column if not exists notif_email_messages boolean default true;
alter table profiles add column if not exists notif_push_enabled   boolean default false;
alter table profiles add column if not exists language             text default 'it';
alter table profiles add column if not exists marketing_opt_in     boolean default false;

-- ============ TRIGGER AUTO NOTIFICHE ============

-- 1. Quando bookings.status cambia → notifica al cliente
create or replace function notify_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and old.status <> 'confirmed' then
    insert into notifications (user_id, kind, title, body, link, meta)
    values (
      new.user_id,
      'booking_confirmed',
      'Prenotazione confermata',
      coalesce(new.host_response, 'Il noleggiatore ha accettato la tua richiesta.'),
      '/prenotazioni/' || new.id,
      jsonb_build_object('booking_id', new.id, 'car_id', new.car_id)
    );
  elsif new.status = 'declined' and old.status <> 'declined' then
    insert into notifications (user_id, kind, title, body, link, meta)
    values (
      new.user_id,
      'booking_declined',
      'Prenotazione rifiutata',
      coalesce(new.decline_reason, 'Il noleggiatore non ha potuto accettare.'),
      '/prenotazioni/' || new.id,
      jsonb_build_object('booking_id', new.id, 'car_id', new.car_id)
    );
  elsif new.status = 'completed' and old.status <> 'completed' then
    insert into notifications (user_id, kind, title, body, link, meta)
    values (
      new.user_id,
      'booking_completed',
      'Noleggio concluso',
      'Speriamo sia andato tutto bene! Lasceresti una recensione?',
      '/prenotazioni/' || new.id,
      jsonb_build_object('booking_id', new.id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists booking_status_change on bookings;
create trigger booking_status_change
  after update of status on bookings
  for each row execute function notify_booking_status_change();

-- 2. Quando bookings viene inserita → notifica all'host (richiesta arrivata)
create or replace function notify_booking_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_host_owner uuid;
begin
  select h.owner_user_id into v_host_owner
    from cars c join hosts h on h.id = c.host_id
   where c.id = new.car_id;
  if v_host_owner is not null then
    insert into notifications (user_id, kind, title, body, link, meta)
    values (
      v_host_owner,
      'booking_request',
      'Nuova richiesta di prenotazione',
      'Hai ricevuto una richiesta — vai a Richieste per gestirla.',
      '/noleggia/richieste',
      jsonb_build_object('booking_id', new.id, 'car_id', new.car_id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists booking_created on bookings;
create trigger booking_created
  after insert on bookings
  for each row execute function notify_booking_created();

-- 3. Quando arriva un messaggio → notifica al recipient
create or replace function notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (user_id, kind, title, body, link, meta)
  values (
    new.recipient_id,
    'new_message',
    'Nuovo messaggio',
    substring(new.body for 100),
    '/profilo/messaggi?b=' || new.booking_id,
    jsonb_build_object('booking_id', new.booking_id, 'message_id', new.id, 'sender_id', new.sender_id)
  );
  return new;
end;
$$;

drop trigger if exists message_created on messages;
create trigger message_created
  after insert on messages
  for each row execute function notify_new_message();

-- ============ RPC ============

create or replace function mark_all_notifications_read()
returns int
language sql
security definer
set search_path = public
as $$
  with upd as (
    update notifications set read_at = now()
     where user_id = auth.uid() and read_at is null
     returning 1
  )
  select count(*)::int from upd;
$$;

create or replace function count_unread_notifications()
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from notifications
   where user_id = auth.uid() and read_at is null;
$$;

create or replace function mark_thread_read(p_booking_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  with upd as (
    update messages set read_at = now()
     where booking_id = p_booking_id
       and recipient_id = auth.uid()
       and read_at is null
     returning 1
  )
  select count(*)::int from upd;
$$;
