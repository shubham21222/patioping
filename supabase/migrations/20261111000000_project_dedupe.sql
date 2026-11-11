-- One project, one lead. Cities file a separate permit per trade for the same job (Austin:
-- "2025-141464 BP" / "EP" / "PP"; Orlando: BLD + ELE + ENG at one address), so a single new
-- pool used to become 3-4 leads. Permits now carry project_key (normalized address, set by the
-- ingest pipeline); leads and city counts take one permit per project.
--
-- Run this BEFORE deploying the ingest Worker that writes project_key.

alter table permits add column if not exists project_key text;
create index if not exists permits_project_idx on permits (jurisdiction_id, project_key);

-- Backfill stored permits. Same rule as projectKey() in src/lib/ingest/normalize.ts.
update permits
set project_key = nullif(trim(regexp_replace(lower(address), '[^a-z0-9]+', ' ', 'g')), '')
where project_key is null and address ~ '[0-9]';

-- Which permit represents a project: the building permit (or the pool permit itself) first,
-- then the one with the job value, then the earliest.
create or replace function public.project_rank(p_type text, p_valuation numeric)
returns int language sql immutable as $$
  select case when p_type ilike '%building%' or p_type ilike '%pool%' or p_type ilike '%fence%' then 0 else 1 end * 2
       + case when coalesce(p_valuation, 0) > 0 then 0 else 1 end
$$;

-- Permits within this many days at one address count as the same project.
-- (A second pool at the same house years later is a new lead.)
create or replace function public.same_project(a_jurisdiction uuid, a_key text, a_issued date,
                                               b_jurisdiction uuid, b_key text, b_issued date)
returns boolean language sql immutable as $$
  select a_key is not null and a_jurisdiction = b_jurisdiction and a_key = b_key
     and abs(coalesce(a_issued, current_date) - coalesce(b_issued, current_date)) <= 180
$$;

create or replace function public.match_leads(p_since timestamptz, p_jurisdiction uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into leads (org_id, permit_id)
  select c.org_id, c.permit_id
  from (
    select distinct on (o.id, p.jurisdiction_id, coalesce(p.project_key, p.id::text))
           o.id as org_id, p.id as permit_id, p.jurisdiction_id, p.project_key, p.issued_at
    from permits p
    join territories t on t.type = 'zip' and p.zip = any (t.zips)
    join orgs o on o.id = t.org_id
    where (p.created_at >= p_since or p.issued_at >= (p_since::date - 7))
      and (p_jurisdiction is null or p.jurisdiction_id = p_jurisdiction)
      and p.category = any (trade_categories(o.trade))
    order by o.id, p.jurisdiction_id, coalesce(p.project_key, p.id::text),
             project_rank(p.permit_type, p.valuation), p.valuation desc nulls last, p.issued_at
  ) c
  where not exists (
    select 1 from leads l join permits lp on lp.id = l.permit_id
    where l.org_id = c.org_id
      and same_project(lp.jurisdiction_id, lp.project_key, lp.issued_at, c.jurisdiction_id, c.project_key, c.issued_at)
  )
  on conflict (org_id, permit_id) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.match_leads(timestamptz, uuid) from public, anon, authenticated;

create or replace function public.backfill_org_leads()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into leads (org_id, permit_id)
  select c.org_id, c.permit_id
  from (
    select distinct on (p.jurisdiction_id, coalesce(p.project_key, p.id::text))
           new.org_id as org_id, p.id as permit_id, p.jurisdiction_id, p.project_key, p.issued_at
    from permits p
    join orgs o on o.id = new.org_id
    where new.type = 'zip'
      and p.zip = any (new.zips)
      and p.issued_at >= current_date - 30
      and p.category = any (trade_categories(o.trade))
    order by p.jurisdiction_id, coalesce(p.project_key, p.id::text),
             project_rank(p.permit_type, p.valuation), p.valuation desc nulls last, p.issued_at
  ) c
  where not exists (
    select 1 from leads l join permits lp on lp.id = l.permit_id
    where l.org_id = c.org_id
      and same_project(lp.jurisdiction_id, lp.project_key, lp.issued_at, c.jurisdiction_id, c.project_key, c.issued_at)
  )
  on conflict (org_id, permit_id) do nothing;
  return new;
end $$;

-- City pages count projects, not permits.
create or replace function public.city_stats(p_jurisdiction text, p_categories permit_category[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  with j as (
    select id, last_synced_at, coverage_note from jurisdictions
    where name in (p_jurisdiction, p_jurisdiction || ' (Apify)')
  ),
  recent as (
    select distinct on (p.jurisdiction_id, coalesce(p.project_key, p.id::text)) p.*
    from permits p join j on j.id = p.jurisdiction_id
    where p.category = any (p_categories) and p.issued_at >= current_date - 84
    order by p.jurisdiction_id, coalesce(p.project_key, p.id::text),
             project_rank(p.permit_type, p.valuation), p.valuation desc nulls last, p.issued_at
  )
  select json_build_object(
    'last_synced_at', (select max(last_synced_at) from j),
    'coverage_note', (select coverage_note from j where coverage_note is not null limit 1),
    'last_30', (select count(*) from recent where issued_at >= current_date - 30),
    'median_value', (select percentile_cont(0.5) within group (order by valuation)
                     from recent where valuation > 0 and issued_at >= current_date - 90),
    'weekly', coalesce((
      select json_agg(w order by w.week) from (
        select date_trunc('week', issued_at)::date as week, count(*) as n from recent group by 1
      ) w
    ), '[]'::json),
    'top_zips', coalesce((
      select json_agg(z) from (
        select zip, count(*) as n from recent
        where zip is not null and issued_at >= current_date - 30
        group by zip order by n desc limit 8
      ) z
    ), '[]'::json)
  );
$$;
