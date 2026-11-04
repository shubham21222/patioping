-- Tier-1 Sun Belt sources (plan section 5). Verify dataset IDs / endpoints on each portal before enabling.
insert into jurisdictions (name, state, source_type, endpoint, dataset_id, timezone, status) values
  ('Austin',               'TX', 'socrata', 'https://data.austintexas.gov',  null, 'America/Chicago',     'paused'),
  ('Mesa',                 'AZ', 'socrata', 'https://citydata.mesaaz.gov',   null, 'America/Phoenix',     'paused'),
  ('Los Angeles',          'CA', 'socrata', 'https://data.lacity.org',       null, 'America/Los_Angeles', 'paused'),
  ('Miami-Dade County',    'FL', 'arcgis',  'TODO: county ArcGIS FeatureServer URL', null, 'America/New_York', 'paused'),
  ('Maricopa County',      'AZ', 'arcgis',  'TODO: county ArcGIS FeatureServer URL', null, 'America/Phoenix',  'paused'),
  ('Nashville',            'TN', 'arcgis',  'TODO: metro ArcGIS FeatureServer URL',  null, 'America/Chicago',  'paused');
