-- Multi-trade launch: live trades + waitlist for coming-soon trades.

-- Demand signal for trades we haven't built yet.
create table trade_waitlist (
  id         uuid primary key default gen_random_uuid(),
  trade      text not null check (trade in ('solar', 'roofing', 'new_home', 'electrical_hvac')),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  zip        text check (zip ~ '^\d{5}$'),
  source     text not null default 'landing' check (source in ('landing', 'onboarding', 'trade_page')),
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (trade, email)
);

alter table trade_waitlist enable row level security;

-- Anyone may join; nobody can read the list through the API (use SQL editor / service role).
create policy "join waitlist" on trade_waitlist for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- Which trade to build next:
--   select trade, count(*), count(distinct zip) from trade_waitlist group by 1 order by 2 desc;

-- Live trades only on orgs.
alter table orgs
  add constraint orgs_trade_live check (trade in ('pool_service', 'fence', 'landscaping'));

-- Carry the trade picked on the landing/SEO page through signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_org uuid;
  t text := new.raw_user_meta_data->>'trade';
begin
  insert into orgs (name, trade)
  values (
    coalesce(nullif(new.raw_user_meta_data->>'company_name', ''), split_part(new.email, '@', 1)),
    case when t in ('pool_service', 'fence', 'landscaping') then t else 'pool_service' end
  )
  returning id into new_org;

  insert into profiles (id, org_id, email, role)
  values (new.id, new_org, new.email, 'owner');
  return new;
end $$;

-- Fence and outdoor jobs are one-off; pool service is recurring.
alter table leads add column if not exists won_value_job numeric(12,2);
