/**
 * Pipeline tests with SYNTHETIC records shaped like Socrata/ArcGIS responses.
 * They check our parsing, paging and classification, not the live portals.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { asJurisdiction, sourceByKey } from "../src/lib/ingest/configs";
import { categoryFor, normalize, toDate, toZip, weeklyCounts } from "../src/lib/ingest/normalize";
import { fetchArcgis, fetchSocrata } from "../src/lib/ingest/sources";
import type { Jurisdiction } from "../src/lib/ingest/types";

const austin = asJurisdiction(sourceByKey("austin")!);

const row = (over: Record<string, unknown> = {}) => ({
  permit_number: "2026-123456 BP",
  issue_date: "2026-10-27T00:00:00.000",
  permit_type_desc: "Building Permit",
  work_class: "Pool",
  description: "New residential in-ground gunite swimming pool with spa",
  total_job_valuation: "85,000",
  original_address1: "100 EXAMPLE ST",
  original_zip: "78704",
  latitude: "30.25",
  longitude: "-97.76",
  contractor_company_name: "SAMPLE POOLS CO",
  link: { url: "https://example.invalid/permit/2026-123456" },
  ...over,
});

test("normalizes an Austin-shaped pool permit", () => {
  const p = normalize(austin, row())!;
  assert.equal(p.category, "pool");
  assert.equal(p.valuation, 85000);
  assert.equal(p.zip, "78704");
  assert.equal(p.issued_at, "2026-10-27");
  assert.equal(p.lat, 30.25);
  assert.equal(p.permit_type, "Building Permit · Pool");
  assert.equal(p.source_url, "https://example.invalid/permit/2026-123456");
  assert.equal(p.contractor_name, "SAMPLE POOLS CO");
});

test("missing permit number is dropped; missing builder is kept as null", () => {
  assert.equal(normalize(austin, row({ permit_number: "" })), null);
  assert.equal(normalize(austin, row({ contractor_company_name: undefined }))!.contractor_name, null);
});

test("classification picks the right single category", () => {
  assert.equal(categoryFor("Residential pool barrier fence and gate"), "pool");
  assert.equal(categoryFor("6 ft cedar privacy fence"), "fence");
  assert.equal(categoryFor("Covered patio with outdoor kitchen"), "landscaping");
  assert.equal(categoryFor("Hot tub install on existing slab"), "spa");
  assert.equal(categoryFor("Interior remodel, kitchen and bath"), "other");
  assert.equal(categoryFor("Parking deck structural repair"), "other");
});

test("date and zip parsing", () => {
  assert.equal(toDate(Date.UTC(2026, 10, 3)), "2026-11-03");
  assert.equal(toDate("11/3/2026"), "2026-11-03");
  assert.equal(toZip("78704-1234"), "78704");
  assert.equal(toZip("100 Example St, Austin TX 78745"), "78745");
});

test("weekly counts bucket by Monday", () => {
  const ps = [
    normalize(austin, row({ issue_date: "2026-10-26T00:00:00" }))!, // Mon
    normalize(austin, row({ permit_number: "b", issue_date: "2026-11-01T00:00:00" }))!, // Sun, same week
    normalize(austin, row({ permit_number: "c", issue_date: "2026-11-02T00:00:00", work_class: "Fence", description: "fence" }))!,
  ];
  assert.deepEqual(weeklyCounts(ps), [
    ["2026-10-26", { pool: 2 }],
    ["2026-11-02", { fence: 1 }],
  ]);
});

test("Socrata: builds SoQL, sends app token, pages until a short page", async () => {
  const calls: { url: URL; token: string | null }[] = [];
  const fake = (async (u: string, init?: RequestInit) => {
    const url = new URL(u);
    calls.push({ url, token: new Headers(init?.headers).get("x-app-token") });
    const offset = Number(url.searchParams.get("$offset"));
    const n = offset === 0 ? 5000 : 12;
    return new Response(JSON.stringify(Array.from({ length: n }, (_, i) => row({ permit_number: `p${offset + i}` }))));
  }) as typeof fetch;

  const rows = await fetchSocrata(austin, { since: "2026-08-01", appToken: "tok", fetchImpl: fake });
  assert.equal(rows.length, 5012);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.pathname, "/resource/3syk-w9eu.json");
  assert.equal(calls[0].token, "tok");
  assert.equal(calls[0].url.searchParams.get("$where"), "issue_date >= '2026-08-01T00:00:00' AND permit_class_mapped = 'Residential'");
});

test("Socrata: retries on 429, then succeeds", async () => {
  let n = 0;
  const fake = (async () => (++n === 1 ? new Response("slow down", { status: 429 }) : new Response("[]"))) as typeof fetch;
  assert.deepEqual(await fetchSocrata(austin, { since: "2026-11-01", fetchImpl: fake }), []);
  assert.equal(n, 2);
});

test("ArcGIS: pages on exceededTransferLimit and keeps geometry", async () => {
  const j: Jurisdiction = {
    id: "x",
    name: "Example County",
    state: "AZ",
    source_type: "arcgis",
    endpoint: "https://example.invalid/arcgis/rest/services/Permits/FeatureServer/0",
    dataset_id: null,
    status: "active",
    field_mapping: {
      permit_number: "PERMIT_NO",
      issued_at: "ISSUED",
      description: "WORK_DESC",
      zip: "ZIP",
      _query: { date_field: "ISSUED", where: "TYPE = 'RES'" },
    },
  };
  let page = 0;
  const fake = (async (u: string) => {
    const url = new URL(u);
    assert.equal(url.searchParams.get("where"), "ISSUED >= DATE '2026-10-01' AND TYPE = 'RES'");
    page++;
    const feats = Array.from({ length: page === 1 ? 2000 : 3 }, (_, i) => ({
      attributes: { PERMIT_NO: `A${page}-${i}`, ISSUED: Date.UTC(2026, 10, 3), WORK_DESC: "New pool", ZIP: "85251" },
      geometry: { x: -111.92, y: 33.49 },
    }));
    return new Response(JSON.stringify({ features: feats, exceededTransferLimit: page === 1 }));
  }) as typeof fetch;

  const rows = await fetchArcgis(j, { since: "2026-10-01", fetchImpl: fake });
  assert.equal(rows.length, 2003);
  const p = normalize(j, rows[0])!;
  assert.equal(p.category, "pool");
  assert.equal(p.lng, -111.92);
  assert.equal(p.issued_at, "2026-11-03");
});
