import { classifyByKeywords, type PermitCategory } from "../trades";
import type { FieldPath, Jurisdiction, NormalizedPermit, RawRecord } from "./types";

function at(rec: RawRecord, path: string): unknown {
  let cur: unknown = rec;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function pick(rec: RawRecord, path: FieldPath | undefined): unknown {
  if (!path) return undefined;
  if (Array.isArray(path)) {
    const parts = path.map((p) => at(rec, p)).filter((v) => v != null && String(v).trim() !== "");
    return parts.length ? parts.map(String).join(" · ") : undefined;
  }
  return at(rec, path);
}

const str = (v: unknown) => {
  if (v == null) return null;
  const s = String(v).replace(/\s+/g, " ").trim();
  return s === "" ? null : s;
};

export function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Socrata "2026-11-03T00:00:00.000", ArcGIS epoch ms, or "11/03/2026" → "2026-11-03". */
export function toDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return new Date(v).toISOString().slice(0, 10);
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export const toZip = (v: unknown) => str(v)?.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1] ?? null;

/** "1234 W. Main St.  Unit B" → "1234 w main st unit b": same project, however the permit spelled it. */
export const projectKey = (address: string | null) => {
  const k = address?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return k && /\d/.test(k) ? k : null; // no house number: too vague to group on
};

/** Pick the single category a permit becomes; pool beats spa beats fence beats outdoor. */
export function categoryFor(text: string): PermitCategory {
  const hits = classifyByKeywords(text);
  for (const c of ["pool", "spa", "fence", "landscaping"] as const) if (hits.includes(c)) return c;
  return "other";
}

export function normalize(j: Jurisdiction, rec: RawRecord): NormalizedPermit | null {
  const m = j.field_mapping;
  const permit_number = str(pick(rec, m.permit_number));
  if (!permit_number) return null;

  const permit_type = str(pick(rec, m.permit_type));
  const description = str(pick(rec, m.description));
  const address = str(pick(rec, m.address));
  const lat = toNumber(pick(rec, m.lat) ?? rec.__y);
  const lng = toNumber(pick(rec, m.lng) ?? rec.__x);
  const url =
    str(pick(rec, m.source_url)) ??
    (m._query.source_url_template ? m._query.source_url_template.replace("{permit_number}", encodeURIComponent(permit_number)) : null);

  return {
    jurisdiction_id: j.id,
    permit_number,
    permit_type,
    description: description?.slice(0, 2000) ?? null,
    category: categoryFor(`${permit_type ?? ""} ${description ?? ""}`),
    valuation: toNumber(pick(rec, m.valuation)),
    address,
    project_key: projectKey(address),
    zip: toZip(pick(rec, m.zip)) ?? toZip(pick(rec, m.address)),
    lat: lat && Math.abs(lat) <= 90 ? lat : null,
    lng: lng && Math.abs(lng) <= 180 ? lng : null,
    contractor_name: str(pick(rec, m.contractor_name)),
    issued_at: toDate(pick(rec, m.issued_at)),
    source_url: url,
  };
}

/** Phase 0 go/no-go: permits per ISO week per category. */
export function weeklyCounts(permits: NormalizedPermit[]) {
  const weeks = new Map<string, Record<string, number>>();
  for (const p of permits) {
    if (!p.issued_at || p.category === "other") continue;
    const d = new Date(`${p.issued_at}T00:00:00Z`);
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    const row = weeks.get(key) ?? {};
    row[p.category] = (row[p.category] ?? 0) + 1;
    weeks.set(key, row);
  }
  return [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Raw payloads are kept for re-checking, minus personal details some portals publish:
 * owner and applicant names, phones, emails. We never need them.
 */
const PERSONAL = /owner|applicant|phone|email|e_mail|contact_name/i;
export function redactRaw(rec: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(rec).filter(([k]) => !PERSONAL.test(k)));
}
