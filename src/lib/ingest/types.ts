/**
 * Ingest pipeline types. This folder has no Next.js or server-only imports so it
 * runs the same in the CLI (tsx), the Cloudflare cron Worker, and tests.
 */
import type { PermitCategory } from "../trades";

/** A path into a raw record: "issue_date", "link.url". An array means "join these with ' · '". */
export type FieldPath = string | string[];

export type FieldMapping = {
  permit_number: FieldPath;
  issued_at: FieldPath;
  permit_type?: FieldPath;
  description?: FieldPath;
  valuation?: FieldPath;
  address?: FieldPath;
  zip?: FieldPath;
  lat?: FieldPath;
  lng?: FieldPath;
  contractor_name?: FieldPath;
  source_url?: FieldPath;
  /** Query settings, not columns */
  _query: {
    /** Column used for incremental pulls ("issued since") */
    date_field: string;
    /** Extra server-side filter, e.g. SoQL "permit_class_mapped = 'Residential'" or ArcGIS SQL */
    where?: string;
    /** Template when the source has no URL column: {permit_number} is substituted */
    source_url_template?: string;
    /** Apify only: where to read items from, and which of them belong to this jurisdiction */
    apify?: {
      /** Read the last successful run of a scheduled Apify task (recommended: no extra runs) */
      task?: string;
      /** Or run an actor synchronously with this input */
      actor?: string;
      input?: Record<string, unknown>;
      /** Keep items whose field equals one of these values (case-insensitive), e.g. city = "Austin" */
      filter?: { field: string; in: string[] };
    };
  };
};

export type Jurisdiction = {
  id: string;
  name: string;
  state: string;
  source_type: "socrata" | "arcgis" | "apify" | "scrape" | "planit";
  /** Socrata: "https://data.austintexas.gov". ArcGIS: full layer URL ".../FeatureServer/0" */
  endpoint: string;
  /** Socrata 4x4 id like "3syk-w9eu"; unused for ArcGIS */
  dataset_id: string | null;
  field_mapping: FieldMapping;
  status: string;
};

export type RawRecord = Record<string, unknown>;

export type NormalizedPermit = {
  jurisdiction_id: string;
  permit_number: string;
  permit_type: string | null;
  description: string | null;
  category: PermitCategory;
  valuation: number | null;
  address: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  contractor_name: string | null;
  issued_at: string | null; // YYYY-MM-DD
  source_url: string | null;
};

export type FetchOptions = {
  /** Only records issued on/after this date (YYYY-MM-DD) */
  since: string;
  /** Hard cap on records per run, to stay polite */
  maxRecords?: number;
  appToken?: string;
  apifyToken?: string;
  fetchImpl?: typeof fetch;
};
