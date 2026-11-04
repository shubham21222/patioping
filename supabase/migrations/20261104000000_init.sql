-- PatioPing initial schema (plan section 6)
create extension if not exists "pgcrypto";

-- ───────────── Enums ─────────────
create type source_type   as enum ('socrata', 'arcgis', 'scrape', 'planit');
create type permit_category as enum ('pool', 'spa', 'fence', 'solar', 'roof', 'landscaping', 'enclosure', 'other');
create type lead_stage    as enum ('new', 'contacted', 'postcard_sent', 'quoted', 'won', 'lost');
create type member_role   as enum ('owner', 'member');
create type plan_tier     as enum ('trial', 'starter', 'growth', 'pro');
create type activity_type as enum ('note', 'stage_change', 'postcard', 'export', 'assign');

-- ───────────── Data pipeline (service-role only writes) ─────────────
create table jurisdictions (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  state          text not null,
  country        text not null default 'US',
  source_type    source_type not null,
  endpoint       text not null,
  dataset_id     text,
  field_mapping  jsonb not null default '{}'::jsonb,
  timezone       text not null default 'America/Chicago',
  last_synced_at timestamptz,
  status         text not null default 'active',  -- active | paused | failing
  created_at     timestamptz not null default now()
);

create table permits_raw (
  id              bigserial primary key,
  jurisdiction_id uuid not null references jurisdictions(id) on delete cascade,
  external_id     text not null,
  payload         jsonb not null,
  fetched_at      timestamptz not null default now(),
  unique (jurisdiction_id, external_id)
);

create table permits (
  id              uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid not null references jurisdictions(id) on delete cascade,
  permit_number   text not null,
  permit_type     text,
  description     text,
  category        permit_category not null default 'other',
  valuation       numeric(12,2),
  address         text,
  zip             text,
  lat             double precision,
  lng             double precision,
  contractor_name text,
  issued_at       date,
  source_url      text,
  ai_score        text check (ai_score in ('high', 'medium', 'low')),
  created_at      timestamptz not null default now(),
  unique (jurisdiction_id, permit_number)
);
create index permits_zip_idx      on permits (zip);
create index permits_category_idx on permits (category, issued_at desc);

-- ───────────── Tenancy ─────────────
create table orgs (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  trade              text not null default 'pool_service',
  plan               plan_tier not null default 'trial',
  trial_ends_at      timestamptz default (now() + interval '7 days'),
  stripe_customer_id text unique,
  alert_hour_local   smallint not null default 7,
  timezone           text not null default 'America/Chicago',
  created_at         timestamptz not null default now()
);

-- "users" from the plan; linked 1:1 to auth.users
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  org_id     uuid not null references orgs(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       member_role not null default 'member',
  created_at timestamptz not null default now()
);
create index profiles_org_idx on profiles (org_id);

create table territories (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references orgs(id) on delete cascade,
  type       text not null check (type in ('zip', 'radius')),
  zips       text[] not null default '{}',
  center_lat double precision,
  center_lng double precision,
  radius_km  numeric(6,2),
  created_at timestamptz not null default now()
);

-- ───────────── CRM ─────────────
create table leads (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references orgs(id) on delete cascade,
  permit_id         uuid not null references permits(id) on delete cascade,
  stage             lead_stage not null default 'new',
  assigned_to       uuid references profiles(id) on delete set null,
  next_follow_up    date,
  won_value_monthly numeric(10,2),
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (org_id, permit_id)
);
create index leads_org_stage_idx on leads (org_id, stage, created_at desc);

create table lead_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  user_id    uuid references profiles(id) on delete set null,
  type       activity_type not null,
  body       text,
  created_at timestamptz not null default now()
);

create table alerts_log (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references orgs(id) on delete cascade,
  sent_at    timestamptz not null default now(),
  channel    text not null default 'email',
  lead_count int not null default 0
);

-- Phase 4
create table postcards (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  provider_id text,
  status      text not null default 'queued',
  cost        numeric(8,2),
  sent_at     timestamptz
);

-- ───────────── Helpers ─────────────
create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid()
$$;

-- New auth user → create an org + owner profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_org uuid;
begin
  insert into orgs (name)
  values (coalesce(nullif(new.raw_user_meta_data->>'company_name', ''), split_part(new.email, '@', 1)))
  returning id into new_org;

  insert into profiles (id, org_id, email, role)
  values (new.id, new_org, new.email, 'owner');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger leads_touch before update on leads
  for each row execute function public.touch_updated_at();

-- ───────────── Row Level Security ─────────────
alter table jurisdictions   enable row level security;
alter table permits_raw     enable row level security;
alter table permits         enable row level security;
alter table orgs            enable row level security;
alter table profiles        enable row level security;
alter table territories     enable row level security;
alter table leads           enable row level security;
alter table lead_activities enable row level security;
alter table alerts_log      enable row level security;
alter table postcards       enable row level security;

-- permits_raw: no policies → service role only.
create policy "jurisdictions readable" on jurisdictions for select to authenticated using (true);

-- Users only see permits that are leads for their org.
create policy "permits via own leads" on permits for select to authenticated
  using (exists (select 1 from leads l where l.permit_id = permits.id and l.org_id = current_org_id()));

create policy "own org read"   on orgs for select to authenticated using (id = current_org_id());
create policy "owner updates org" on orgs for update to authenticated
  using (id = current_org_id() and exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

create policy "org members read" on profiles for select to authenticated using (org_id = current_org_id());
create policy "update self"      on profiles for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and org_id = current_org_id());

create policy "org territories" on territories for all to authenticated
  using (org_id = current_org_id()) with check (org_id = current_org_id());

create policy "org leads read"   on leads for select to authenticated using (org_id = current_org_id());
create policy "org leads update" on leads for update to authenticated
  using (org_id = current_org_id()) with check (org_id = current_org_id());

create policy "org activities" on lead_activities for all to authenticated
  using (exists (select 1 from leads l where l.id = lead_id and l.org_id = current_org_id()))
  with check (exists (select 1 from leads l where l.id = lead_id and l.org_id = current_org_id()));

create policy "org alerts read" on alerts_log for select to authenticated using (org_id = current_org_id());
create policy "org postcards read" on postcards for select to authenticated
  using (exists (select 1 from leads l where l.id = lead_id and l.org_id = current_org_id()));
