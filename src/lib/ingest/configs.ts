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
