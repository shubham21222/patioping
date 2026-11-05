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

const configured = (s: SourceConfig) =>
  s.source_type === "apify" ? !!(s.field_mapping._query.apify?.task || s.field_mapping._query.apify?.actor) : !!s.endpoint;
const baseCity = (name: string) => name.replace(/\s*\(apify\)\s*$/i, "");

/** One page set per city: the official source if configured, else its Apify stand-in. */
export const CITIES: City[] = Object.values(
  SOURCES.filter(configured).reduce<Record<string, SourceConfig>>((acc, s) => {
    const key = `${baseCity(s.name)}|${s.state}`;
    if (!acc[key] || (acc[key].source_type === "apify" && s.source_type !== "apify")) acc[key] = s;
    return acc;
  }, {}),
).map((s) => ({
  slug: `${baseCity(s.name)}-${s.state}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name: baseCity(s.name),
  state: s.state,
  source: s,
  hasBuilder: !!s.field_mapping.contractor_name,
}));

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);
export const stateName = (code: string) => STATE_NAME[code] ?? code;
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com";
