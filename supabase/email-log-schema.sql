-- MoviQ — Log invii email transazionali (SMTP2GO + altri provider)
-- Tracciamento per audit GDPR art. 15 + diagnostica deliverability + retry manuale.
-- Le scritture le fa la Edge Function send-email (service_role).

create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),

  -- Destinatario (sempre presente)
  to_email   text not null,
  to_user_id uuid references auth.users(id) on delete set null,

  -- Mittente
  from_email text not null default 'hello@moviq.it',
  reply_to   text,

  -- Contenuto
  template   text not null,                          -- es. 'magic_link', 'booking_confirmed'
  subject    text not null,
  -- Variabili usate nella render (utile per debug/replay; serve un audit-safe set)
  payload    jsonb default '{}'::jsonb,

  -- Stato
  status     text not null default 'queued'
    check (status in ('queued','sent','delivered','bounced','complained','failed','rejected','opened','clicked')),
  error      text,

  -- Provider info
  provider           text not null default 'smtp2go',
  provider_message_id text,
  provider_response   jsonb,

  -- Timestamp
  queued_at      timestamptz default now(),
  sent_at        timestamptz,
  delivered_at   timestamptz,
  opened_at      timestamptz,
  bounced_at     timestamptz,
  complained_at  timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists email_log_to_user_idx     on email_log(to_user_id) where to_user_id is not null;
create index if not exists email_log_status_idx      on email_log(status);
create index if not exists email_log_template_idx    on email_log(template);
create index if not exists email_log_created_idx     on email_log(created_at desc);
create index if not exists email_log_provider_id_idx on email_log(provider_message_id);

-- Trigger updated_at
create or replace function set_email_log_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_email_log_updated on email_log;
create trigger trg_email_log_updated
  before update on email_log
  for each row execute function set_email_log_updated_at();

-- ============================================================
-- RLS: l'utente vede solo le email indirizzate a lui (to_user_id),
-- per soddisfare diritto di accesso GDPR art. 15.
-- Admin vede tutto. Service_role scrive (Edge Function send-email).
-- ============================================================
alter table email_log enable row level security;

drop policy if exists "email_log user read"  on email_log;
drop policy if exists "email_log admin read" on email_log;

create policy "email_log user read"
  on email_log for select
  using (to_user_id = auth.uid());

create policy "email_log admin read"
  on email_log for select
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));
