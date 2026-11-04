-- Landing-page zip check + "request your county" demand capture.

-- Where a source only covers part of its county (e.g. unincorporated areas only).
alter table jurisdictions add column if not exists coverage_note text;

update jurisdictions set coverage_note = 'Unincorporated Miami-Dade only (not the City of Miami or other cities)'
  where name = 'Miami-Dade County';
update jurisdictions set coverage_note = 'Unincorporated Maricopa County only (not Phoenix, Mesa or other cities)'
  where name = 'Maricopa County';
update jurisdictions set coverage_note = 'Builder names are not published in this city''s data'
  where name = 'Los Angeles';

-- Anonymous preview for one zip: counts and redacted samples. Never returns addresses,
-- builders or exact values, so it is safe to expose to anon.
create or replace function public.zip_preview(p_zip text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with recent as (
    select p.category, p.permit_type, p.valuation, p.issued_at, j.name as jurisdiction, j.coverage_note
    from permits p
    join jurisdictions j on j.id = p.jurisdiction_id
    where p.zip = p_zip
      and p_zip ~ '^\d{5}$'
      and p.issued_at >= current_date - 30
      and p.category in ('pool', 'spa', 'fence', 'landscaping')
  )
  select json_build_object(
    'zip', p_zip,
    'count', (select count(*) from recent),
    'by_category', coalesce((select json_object_agg(category, n) from (select category, count(*) n from recent group by 1) c), '{}'::json),
    'jurisdiction', (select jurisdiction from recent limit 1),
    'coverage_note', (select coverage_note from recent where coverage_note is not null limit 1),
    'samples', coalesce((
      select json_agg(s) from (
        select category,
               coalesce(permit_type, category::text) as work,
               case
                 when valuation is null then null
                 when valuation >= 75000 then '$75k+'
                 when valuation >= 25000 then '$25k–75k'
                 when valuation >= 10000 then '$10k–25k'
                 else 'Under $10k'
               end as value_band,
               issued_at
        from recent
        order by issued_at desc
        limit 3
      ) s
    ), '[]'::json)
  );
$$;

revoke all on function public.zip_preview(text) from public;
grant execute on function public.zip_preview(text) to anon, authenticated;

-- Demand for areas we don't cover yet.
create table coverage_requests (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  zip        text check (zip ~ '^\d{5}$'),
  county     text not null check (length(county) between 2 and 80),
  state      text check (state ~ '^[A-Z]{2}$'),
  trade      text,
  created_at timestamptz not null default now(),
  unique (email, county)
);

alter table coverage_requests enable row level security;
create policy "request coverage" on coverage_requests for insert to anon, authenticated with check (true);

-- Which county to add next:
--   select county, state, count(*) from coverage_requests group by 1, 2 order by 3 desc;
