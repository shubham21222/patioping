-- Apify as a source type. Apify jurisdictions are named "<City> (Apify)" and are skipped
-- by the pipeline while an official source for the same city is active.
alter type source_type add value if not exists 'apify';

-- City pages count permits from the official source or its Apify stand-in.
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
    select p.* from permits p join j on j.id = p.jurisdiction_id
    where p.category = any (p_categories) and p.issued_at >= current_date - 84
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
