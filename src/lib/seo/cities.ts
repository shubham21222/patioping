import { SOURCES, type SourceConfig } from "../ingest/configs";

export type City = {
  slug: string; // "austin-tx"
  name: string;
  state: string;
  source: SourceConfig;
  /** Whether this source publishes builder / contractor names */
  hasBuilder: boolean;
};

const STATE_NAME: Record<string, string> = { TX: "Texas", FL: "Florida", AZ: "Arizona", CA: "California", TN: "Tennessee" };

export const CITIES: City[] = SOURCES.filter((s) => s.endpoint).map((s) => ({
  slug: `${s.name}-${s.state}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name: s.name,
  state: s.state,
  source: s,
  hasBuilder: !!s.field_mapping.contractor_name,
}));

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);
export const stateName = (code: string) => STATE_NAME[code] ?? code;
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com";
