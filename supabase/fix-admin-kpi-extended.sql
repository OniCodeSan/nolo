-- Fix dashboard admin: admin_kpi_extended() controllava app_metadata.role='admin'
-- nel JWT, ma gli admin del progetto sono flaggati su profiles.is_admin (un utente
-- può essere host E admin insieme). Risultato: i KPI estesi restavano vuoti.
-- Allineiamo il check a public.is_admin() (come admin_kpi, blog, ai-config).
-- Idempotente: ridefinisce solo la funzione, corpo invariato a parte il check.

create or replace function admin_kpi_extended()
returns table (
  mrr_eur int,
  trialing int, trialing_ending_7d int, active int, past_due int, inactive int, canceling int,
  kyc_pending int, kyc_submitted int, kyc_approved int, kyc_rejected int,
  mail_sent bigint, mail_bounced bigint, mail_complained bigint, mail_failed bigint, mail_last_24h bigint,
  coupon_active bigint, coupon_redemptions int,
  bookings_all bigint, bookings_pending bigint, bookings_confirmed bigint, bookings_30d bigint
)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden — admin only';
  end if;
  return query
  with sub_buckets as (
    select
      (count(*) filter (where status = 'trialing'))::int as trialing,
      (count(*) filter (where status = 'trialing' and trial_end < now() + interval '7 days'))::int as trialing_ending_7d,
      (count(*) filter (where status = 'active'))::int as active,
      (count(*) filter (where status = 'past_due'))::int as past_due,
      (count(*) filter (where status in ('canceled','unpaid')))::int as inactive,
      (count(*) filter (where status = 'active' and cancel_at_period_end))::int as canceling
    from host_subscriptions
  ),
  kyc_buckets as (
    select
      (count(*) filter (where kyc_status = 'pending'))::int   as kyc_pending,
      (count(*) filter (where kyc_status = 'submitted'))::int as kyc_submitted,
      (count(*) filter (where kyc_status = 'approved'))::int  as kyc_approved,
      (count(*) filter (where kyc_status = 'rejected'))::int  as kyc_rejected
    from hosts
    where owner_user_id is not null
  ),
  mail_buckets as (
    select
      count(*) filter (where status in ('sent','delivered','opened')) as mail_sent,
      count(*) filter (where status = 'bounced')      as mail_bounced,
      count(*) filter (where status = 'complained')   as mail_complained,
      count(*) filter (where status = 'failed')       as mail_failed,
      count(*) filter (where created_at > now() - interval '24 hours') as mail_last_24h
    from email_log
  ),
  coupon_buckets as (
    select
      count(*) filter (where active) as coupon_active,
      coalesce(sum(times_redeemed) filter (where active), 0)::int as coupon_redemptions
    from admin_coupons
  ),
  booking_buckets as (
    select
      count(*) as bookings_all,
      count(*) filter (where status = 'requested') as bookings_pending,
      count(*) filter (where status = 'confirmed') as bookings_confirmed,
      count(*) filter (where created_at > now() - interval '30 days') as bookings_30d
    from bookings
  )
  select
    ((select active + past_due from sub_buckets) * 49)::int,
    sb.trialing, sb.trialing_ending_7d, sb.active, sb.past_due, sb.inactive, sb.canceling,
    kb.kyc_pending, kb.kyc_submitted, kb.kyc_approved, kb.kyc_rejected,
    mb.mail_sent, mb.mail_bounced, mb.mail_complained, mb.mail_failed, mb.mail_last_24h,
    cb.coupon_active, cb.coupon_redemptions,
    bb.bookings_all, bb.bookings_pending, bb.bookings_confirmed, bb.bookings_30d
  from sub_buckets sb, kyc_buckets kb, mail_buckets mb, coupon_buckets cb, booking_buckets bb;
end $$;

revoke all on function admin_kpi_extended() from public;
grant execute on function admin_kpi_extended() to authenticated;
