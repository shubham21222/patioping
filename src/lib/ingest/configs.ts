import type { FieldMapping, Jurisdiction } from "./types";

/**
 * Source registry. `verified: false` means the column names come from the portal's
 * published schema but nobody has run `discover` against the live API yet. Run it,
 * fix the mapping if needed, flip `verified`, then `sync-config` and set status active.
 */
export type SourceConfig = Omit<Jurisdiction, "id" | "status"> & {
  key: string;
  country: string;
  timezone: string;
  coverage_note: string | null;
  verified: boolean;
  /** Where a human can look at the dataset */
  portal: string;
};

const austinMapping: FieldMapping = {
  permit_number: "permit_number",
  issued_at: "issue_date",
  permit_type: ["permit_type_desc", "work_class"],
  description: "description",
  valuation: "total_job_valuation",
  address: "original_address1",
  zip: "original_zip",
  lat: "latitude",
  lng: "longitude",
  contractor_name: "contractor_company_name",
  source_url: "link.url",
  _query: { date_field: "issue_date", where: "permit_class_mapped = 'Residential'" },
};

export const SOURCES: SourceConfig[] = [
  {
    key: "austin",
    name: "Austin",
    state: "TX",
    country: "US",
    timezone: "America/Chicago",
    source_type: "socrata",
    endpoint: "https://data.austintexas.gov",
    dataset_id: "3syk-w9eu", // "Issued Construction Permits"
    portal: "https://data.austintexas.gov/d/3syk-w9eu",
    field_mapping: austinMapping,
    coverage_note: null,
    verified: false,
  },
  {
    key: "orlando",
    name: "Orlando",
    state: "FL",
    country: "US",
    timezone: "America/New_York",
    source_type: "socrata",
    endpoint: "https://data.cityoforlando.net",
    dataset_id: "ryhf-m453", // Permit Applications
    portal: "https://data.cityoforlando.net/d/ryhf-m453",
    // Column names taken from a live query of this dataset (Nov 2026).
    // Owner names and contractor phone numbers are published but deliberately not mapped.
    field_mapping: {
      permit_number: "permit_number",
      issued_at: "issue_permit_date",
      permit_type: ["application_type", "worktype"],
      description: "project_name",
      valuation: "estimated_cost",
      address: "permit_address",
      // No zip column: filled by the Census geocoder in run.ts (enrichZips).
      lat: "geocoded_column.coordinates.1",
      lng: "geocoded_column.coordinates.0",
      contractor_name: "contractor",
      _query: { date_field: "issue_permit_date", where: "plan_review_type like 'Residential%'" },
    },
    coverage_note: "City of Orlando only (not unincorporated Orange County)",
    verified: false,
  },
  {
    key: "mesa",
    name: "Mesa",
    state: "AZ",
    country: "US",
    timezone: "America/Phoenix",
    source_type: "socrata",
    endpoint: "https://data.mesaaz.gov",
    dataset_id: "dzpk-hxfb", // "Building Permits", Development Services
    portal: "https://data.mesaaz.gov/d/dzpk-hxfb",
    // Column names and meanings from the dataset's catalog entry (Nov 2026).
    // Contractor email/phone and applicant names are published but deliberately not mapped.
    field_mapping: {
      permit_number: "permit_number",
      issued_at: "issued_date",
      permit_type: ["record_type", "type_of_work"],
      description: ["description_of_work", "application_name"],
      valuation: "job_value",
      address: "property_address",
      // No zip column: filled by the Census geocoder in run.ts (enrichZips).
      lat: "latitude",
      lng: "longitude",
      contractor_name: "contractor_name",
      _query: { date_field: "issued_date", where: "permit_type = 'RES'" },
    },
    coverage_note: "City of Mesa only",
    verified: false,
  },
  // ── Added Nov 12 2026. Field names from live API queries that day. ────────────
  {
    key: "los-angeles",
    name: "Los Angeles",
    state: "CA",
    country: "US",
    timezone: "America/Los_Angeles",
    source_type: "socrata",
    endpoint: "https://data.lacity.org",
    dataset_id: "pi9x-tg5x", // LADBS "Building Permits Issued from 2020 to Present"
    portal: "https://data.lacity.org/d/pi9x-tg5x",
    // LADBS doesn't publish the contractor in this dataset.
    field_mapping: {
      permit_number: "permit_nbr",
      issued_at: "issue_date",
      permit_type: ["permit_type", "use_desc"],
      description: "work_desc",
      valuation: "valuation",
      address: "primary_address",
      zip: "zip_code",
      lat: "lat",
      lng: "lon",
      _query: { date_field: "issue_date", where: "permit_sub_type = '1 or 2 Family Dwelling'" },
    },
    coverage_note: "City of Los Angeles only (not other cities in LA County)",
    verified: true,
  },
  {
    key: "miami-dade",
    name: "Miami-Dade County",
    state: "FL",
    country: "US",
    timezone: "America/New_York",
    source_type: "arcgis",
    endpoint: "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/miamidade_permit_data/FeatureServer/0",
    dataset_id: null,
    portal: "https://gis-mdc.opendata.arcgis.com/",
    // One permit per trade (BLDG, PLUM "POOL PIPING", ELEC); project_key groups them.
    // Owner names and contractor phones are published but deliberately not mapped.
    field_mapping: {
      permit_number: "PermitNumber",
      issued_at: "PermitIssuedDate",
      permit_type: ["PermitType", "ApplicationTypeDescription"],
      description: "DetailDescriptionComments",
      valuation: "EstimatedValue",
      address: "PropertyAddress",
      // No zip or geometry: zips come from the Census geocoder with each record's own city.
      geocode_city: "City",
      contractor_name: "ContractorName",
      _query: { date_field: "PermitIssuedDate", where: "ResidentialCommercial = 'R'" },
    },
    coverage_note: "Permits issued by Miami-Dade County (unincorporated areas), not cities with their own building departments",
    verified: true,
  },
  {
    key: "collin-county",
    name: "Collin County",
    state: "TX",
    country: "US",
    timezone: "America/Chicago",
    source_type: "socrata",
    endpoint: "https://data.texas.gov",
    dataset_id: "82ee-gbj5", // "Collin CAD Building Permits"
    portal: "https://data.texas.gov/d/82ee-gbj5",
    // The appraisal district collects permits from every city in the county, so permit
    // numbers repeat across cities: permitid is the district's unique id. Owner names are
    // published but deliberately not mapped (and redacted from raw payloads).
    field_mapping: {
      permit_number: "permitid",
      issued_at: "permitissueddate",
      permit_type: ["permittypedescr", "permitsubtypedescr"],
      description: "permitcomments",
      valuation: "permitvalue",
      address: "situsconcatshort",
      zip: "situszip",
      contractor_name: "permitbuildername",
      // A few rows carry typo dates centuries out; keep them out of "recent".
      _query: { date_field: "permitissueddate", where: "proprescom = 'Residential' AND permitissueddate < '2030-01-01T00:00:00'" },
    },
    coverage_note: "Permits from cities across Collin County (Plano, Frisco, McKinney, Allen and more), as recorded by the Collin Central Appraisal District, which can lag the city by a few days",
    verified: true,
  },
  {
    key: "san-diego-county",
    name: "San Diego County",
    state: "CA",
    country: "US",
    timezone: "America/Los_Angeles",
    source_type: "socrata",
    endpoint: "https://internal-sandiegocounty.data.socrata.com",
    dataset_id: "red2-qccu", // County PDS "Building Permits"
    portal: "https://internal-sandiegocounty.data.socrata.com/d/red2-qccu",
    // "use" holds the cross street and the work description. Contractor phone not mapped.
    field_mapping: {
      permit_number: "record_id",
      issued_at: "issued_date",
      permit_type: ["record_category", "primary_scope_code"],
      description: "use",
      valuation: "valuation",
      address: "street_address",
      zip: "zip_code",
      contractor_name: "contractor_name",
      // record_category: "New Residential Acc Structure", "Residential Alteration-Addn", … (no commercial)
      _query: {
        date_field: "issued_date",
        where: "record_type = 'Building' AND record_category like '%Residential%' AND issued_date < '2030-01-01T00:00:00'",
      },
    },
    coverage_note: "Unincorporated San Diego County (County Planning & Development Services), not the City of San Diego",
    verified: true,
  },
  {
    key: "dallas",
    name: "Dallas",
    state: "TX",
    country: "US",
    timezone: "America/Chicago",
    source_type: "socrata",
    endpoint: "https://www.dallasopendata.com",
    dataset_id: "e7gq-4sah", // "Building Permits"
    portal: "https://www.dallasopendata.com/d/e7gq-4sah",
    field_mapping: {
      permit_number: "permit_number",
      issued_at: "issued_date",
      permit_type: "permit_type",
      description: "work_description",
      valuation: "value",
      address: "street_address",
      zip: "zip_code",
      contractor_name: "contractor",
      // issued_date is text ("11/04/26"), so the connector asks for each day by name.
      _query: { date_field: "issued_date", date_text: "MM/DD/YY", where: "permit_type like 'Residential%'" },
    },
    coverage_note: "City of Dallas only",
    verified: true,
  },
  {
    key: "raleigh",
    name: "Raleigh",
    state: "NC",
    country: "US",
    timezone: "America/New_York",
    source_type: "arcgis",
    endpoint: "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Building_Permits/FeatureServer/0",
    dataset_id: null,
    portal: "https://data-ral.opendata.arcgis.com/",
    // Contractor email/phone and parcel owner are published but deliberately not mapped.
    field_mapping: {
      permit_number: "permitnum",
      issued_at: "issueddate",
      permit_type: ["permittypemapped", "workclass"],
      description: "proposedworkdescription",
      valuation: "estprojectcost",
      address: "originaladdress1",
      zip: "originalzip",
      lat: "latitude_perm",
      lng: "longitude_perm",
      contractor_name: "contractorcompanyname",
      _query: { date_field: "issueddate", where: "permitclassmapped = 'Residential'" },
    },
    coverage_note: "City of Raleigh (Wake County)",
    verified: true,
  },
  {
    key: "baton-rouge",
    name: "Baton Rouge",
    state: "LA",
    country: "US",
    timezone: "America/Chicago",
    source_type: "socrata",
    endpoint: "https://data.brla.gov",
    dataset_id: "7fq7-8j7r", // "EBR Building Permits"
    portal: "https://data.brla.gov/d/7fq7-8j7r",
    // Owner and applicant names are published but deliberately not mapped.
    field_mapping: {
      permit_number: "permitnumber",
      issued_at: "issueddate",
      permit_type: ["permittype", "designation"],
      description: "projectdescription",
      valuation: "projectvalue",
      address: "streetaddress",
      zip: "zip",
      lat: "lat",
      lng: "long",
      contractor_name: "contractorname",
      _query: { date_field: "issueddate", where: "designation = 'Residential'" },
    },
    coverage_note: "City of Baton Rouge and East Baton Rouge Parish",
    verified: true,
  },
  {
    key: "scottsdale",
    name: "Scottsdale",
    state: "AZ",
    country: "US",
    timezone: "America/Phoenix",
    source_type: "arcgis",
    // ArcGIS Hub portal. Find the building-permits layer on data.scottsdaleaz.gov
    // (dataset page → "View API resources" → the FeatureServer/N URL) and put it here.
    endpoint: "",
    dataset_id: null,
    portal: "https://data.scottsdaleaz.gov/",
    field_mapping: {
      permit_number: "PermitNumber",
      issued_at: "IssueDate",
      _query: { date_field: "IssueDate" },
    },
    coverage_note: null,
    verified: false,
  },
  // ── Apify stand-ins ──────────────────────────────────────────────────────────
  // For cities without a working official source. Create a task for the actor in the
  // Apify console, schedule it daily, put its id in `task`, run `discover <key>` to see
  // the real field names, then fix the mapping below. Skipped automatically while the
  // city's official source is active, so leads are never duplicated.
  {
    key: "austin-apify",
    name: "Austin (Apify)",
    state: "TX",
    country: "US",
    timezone: "America/Chicago",
    source_type: "apify",
    endpoint: "https://api.apify.com",
    dataset_id: null,
    portal: "https://apify.com/loomwise/city-building-permits/examples/swimming-pool-permits",
    field_mapping: {
      // Placeholder field names: replace after `discover austin-apify`.
      permit_number: "permit_number",
      issued_at: "issue_date",
      permit_type: "permit_type",
      description: "description",
      valuation: "valuation",
      address: "address",
      zip: "zip",
      lat: "latitude",
      lng: "longitude",
      contractor_name: "contractor",
      _query: {
        date_field: "issue_date",
        apify: { task: "", filter: { field: "city", in: ["Austin"] } },
      },
    },
    coverage_note: null,
    verified: false,
  },
];

export const sourceByKey = (key: string) => SOURCES.find((s) => s.key === key.toLowerCase());

/** A config as a Jurisdiction for CLI dry runs (no database row needed). */
export const asJurisdiction = (s: SourceConfig): Jurisdiction => ({
  id: `local:${s.key}`,
  name: s.name,
  state: s.state,
  source_type: s.source_type,
  endpoint: s.endpoint,
  dataset_id: s.dataset_id,
  field_mapping: s.field_mapping,
  status: "active",
});
