-- Phase 1 ingest: source health columns, lead matching, and the first source configs.

alter table jurisdictions
  add column if not exists last_error text,
  add column if not exists last_fetched_count int;

-- Status values the pipeline writes: active | failing | paused (paused sources are skipped).

create or replace function public.trade_categories(p_trade text)
returns permit_category[] language sql immutable as $$
  select case p_trade
    when 'pool_service' then array['pool', 'spa']::permit_category[]
    when 'fence'        then array['fence']::permit_category[]
    when 'landscaping'  then array['landscaping']::permit_category[]
    else array[]::permit_category[]
  end
$$;

-- Turn freshly stored permits into leads for every org whose zips and trade match.
-- Returns how many leads were created. Service role only.
create or replace function public.match_leads(p_since timestamptz, p_jurisdiction uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into leads (org_id, permit_id)
  select distinct o.id, p.id
  from permits p
  join territories t on t.type = 'zip' and p.zip = any (t.zips)
  join orgs o on o.id = t.org_id
  where (p.created_at >= p_since or p.issued_at >= (p_since::date - 7))
    and (p_jurisdiction is null or p.jurisdiction_id = p_jurisdiction)
    and p.category = any (trade_categories(o.trade))
  on conflict (org_id, permit_id) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.match_leads(timestamptz, uuid) from public, anon, authenticated;

-- A territory saved today should see the last 30 days straight away, not only tomorrow's permits.
create or replace function public.backfill_org_leads()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into leads (org_id, permit_id)
  select new.org_id, p.id
  from permits p
  join orgs o on o.id = new.org_id
  where new.type = 'zip'
    and p.zip = any (new.zips)
    and p.issued_at >= current_date - 30
    and p.category = any (trade_categories(o.trade))
  on conflict (org_id, permit_id) do nothing;
  return new;
end $$;

drop trigger if exists territories_backfill on territories;
create trigger territories_backfill after insert on territories
  for each row execute function public.backfill_org_leads();

-- Source configs (endpoints, dataset ids, field mappings) live in src/lib/ingest/configs.ts
-- and are written here with `npm run ingest -- sync-config`.
