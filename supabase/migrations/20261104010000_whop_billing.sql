-- Payments move from Stripe to Whop.
alter table orgs drop column if exists stripe_customer_id;

alter table orgs
  add column if not exists whop_membership_id text unique,
  add column if not exists whop_user_id       text,
  add column if not exists plan_status        text not null default 'trialing',
  add column if not exists current_period_end timestamptz;

-- Owners may edit onboarding fields, never billing fields (those come from the Whop webhook).
revoke update on orgs from authenticated;
grant update (name, trade, alert_hour_local, timezone) on orgs to authenticated;

-- Members may edit their own name only, never role or org.
revoke update on profiles from authenticated;
grant update (full_name) on profiles to authenticated;
