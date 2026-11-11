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

// Each case below is (lightly trimmed) text from a real Austin, Orlando or Mesa permit.
test("classification: whole words only", () => {
  assert.equal(categoryFor("Building Permit · Roof 7299 CHELSEA HARBOR DR REROOF"), "other");
  assert.equal(categoryFor("Interior remodel, spacious open-plan kitchen"), "other");
  assert.equal(categoryFor("New pools and spas for the HOA amenity center"), "pool");
  assert.equal(categoryFor("Pool deck pavers and new decking"), "pool");
});

test("classification: a patio on a new home or whole-house remodel is not an outdoor lead", () => {
  for (const text of [
    "Building Permit · New SINGLE FAMILY RESIDENTIAL NEW HOME CONSTRUCTION. 2-STORY 4 BEDROOM WITH 2.5 BATHROOMS WITH 2 CAR GARAGE AND COVERED PATIO",
    "Plumbing Permit · New New 1-story single-family dwelling with 3 bedrooms and 2 baths 2 car garage rear patio and front porch",
    "Mechanical Permit · New New 3-story 3 bedroom 2.5 bathroom duplex condo residence with covered front porch and rear covered patio.",
    "Plumbing Permit · New PB: New construction of 3 story SFR attached garage covered patio 2nd floor balcony 3 beds 3.5 baths",
    "Building Permit · New New two story SFR with 5b/3bath attached garage covered front porch and covered patio",
  ]) assert.equal(categoryFor(text), "other", text);

  assert.equal(categoryFor("Electrical Permit · Addition and Remodel Covered patio addition"), "landscaping");
  assert.equal(categoryFor("Building Permit · Addition and Remodel Retroactively permit attached covered patio"), "landscaping");
  assert.equal(categoryFor("Engineering · Other RAMPERAUD DECK"), "landscaping");
  assert.equal(categoryFor("Patio cover for existing single family residence"), "landscaping");
});

test("classification: a pool on a new home is still a pool lead", () => {
  assert.equal(categoryFor("Building Permit · New New inground swimming pool and spa for existing 1-story single family residence"), "pool");
  assert.equal(categoryFor("New construction single-family residence 4 bedroom with pool and spa"), "pool");
});

test("classification: pool demolitions and site-protection fences are dropped", () => {
  assert.equal(categoryFor("Building Permit · Demolition Total demo of SFR 1350 sq ft circa 1953 and pool 1250 sq ft circa 2011"), "other");
  assert.equal(categoryFor("Residential Permit · Pool fill in the existing swimming pool"), "other");
  assert.equal(categoryFor("Electrical Permit · New New autofill inground pool; demo of existing wood deck stairs"), "pool");
  assert.equal(categoryFor("Building Permit · Pool 1225 YATES POOL DEMO"), "other");
  assert.equal(categoryFor("Electrical Permit · New Rebuilding demolished pool that was failing due to ARS [Demolition permit #2025-144801]."), "pool");
  assert.equal(categoryFor("Building Permit · Repair Express: Re-roof (not going past decking)"), "other");
  assert.equal(categoryFor("Building Permit · Repair Express: Remove and replace roof shingles as well as approximately 400 sq ft of decking"), "other");
  assert.equal(categoryFor("Building Permit · Repair Express: Foundation repair - Installing 13 Steel Piers 1 DECK Breakouts"), "other");
  assert.equal(categoryFor("Residential Permit · Additions Install a 224 SF detached pergola per structural engineering."), "landscaping");
  assert.equal(categoryFor("Building Permit · Addition and Remodel Full house remodel and deck build in back new bathrooms new kitchen"), "other");
  assert.equal(categoryFor("Residential Permit · Non-Structural This permit is for installation of the temporary protective fence only."), "other");
  assert.equal(categoryFor("Building Permit · Fence ALUMINUM FENCE"), "fence");
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

test("Mesa-shaped residential pool permit normalizes; zip comes from enrichment", async () => {
  const { enrichZips } = await import("../src/lib/ingest/enrich");
  const mesa = asJurisdiction(sourceByKey("mesa")!);
  const p = normalize(mesa, {
    permit_number: "PMT26-01234",
    issued_date: "2026-10-30T00:00:00.000",
    record_type: "Residential",
    type_of_work: "Pool/Spa",
    description_of_work: "New in-ground swimming pool and spa",
    job_value: 64000,
    property_address: "100 E EXAMPLE ST",
    latitude: 33.41,
    longitude: -111.83,
    contractor_name: "SAMPLE POOLS CO",
    contractor_phone: "(000) 000-0000",
  })!;
  assert.equal(p.category, "pool");
  assert.equal(p.zip, null);
  assert.equal(p.permit_type, "Residential · Pool/Spa");
  assert.ok(!JSON.stringify(p).includes("000-0000"), "contractor phone must not be mapped");

  const seen: string[] = [];
  const fake = (async (u: string) => {
    seen.push(new URL(u).searchParams.get("address")!);
    return new Response(JSON.stringify({ result: { addressMatches: [{ addressComponents: { zip: "85201" } }] } }));
  }) as typeof fetch;
  assert.equal(await enrichZips([p], { city: "Mesa", state: "AZ" }, { fetchImpl: fake }), 1);
  assert.equal(p.zip, "85201");
  assert.deepEqual(seen, ["100 E EXAMPLE ST, Mesa, AZ"]);
});

test("zip enrichment tolerates no match and network errors", async () => {
  const { lookupZip } = await import("../src/lib/ingest/enrich");
  const none = (async () => new Response(JSON.stringify({ result: { addressMatches: [] } }))) as typeof fetch;
  const boom = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  assert.equal(await lookupZip("1 Nowhere", none), null);
  assert.equal(await lookupZip("1 Nowhere", boom), null);
});

test("raw payloads drop owner, applicant, phone and email fields", async () => {
  const { redactRaw } = await import("../src/lib/ingest/normalize");
  const kept = redactRaw({
    permit_number: "X1",
    property_owner_name: "A PERSON",
    parcel_owner_name: "A PERSON",
    applicant: "A PERSON",
    contractor_phone: "(000) 000-0000",
    contractor_phone_number: "(000) 000-0000",
    contractor_email: "a@example.invalid",
    contractor_name: "SAMPLE CO",
    job_value: 1,
  });
  assert.deepEqual(Object.keys(kept).sort(), ["contractor_name", "job_value", "permit_number"]);
});

test("Apify task: reads last successful run, token in header, filters city and date", async () => {
  const { fetchApify } = await import("../src/lib/ingest/sources");
  const j: Jurisdiction = {
    id: "a",
    name: "Austin (Apify)",
    state: "TX",
    source_type: "apify",
    endpoint: "https://api.apify.com",
    dataset_id: null,
    status: "active",
    field_mapping: {
      permit_number: "permit_number",
      issued_at: "issue_date",
      description: "description",
      zip: "zip",
      _query: { date_field: "issue_date", apify: { task: "me~austin-pools", filter: { field: "city", in: ["Austin"] } } },
    },
  };
  let seen: { url: URL; auth: string | null; method?: string } | null = null;
  const fake = (async (u: string, init?: RequestInit) => {
    seen = { url: new URL(u), auth: new Headers(init?.headers).get("authorization"), method: init?.method };
    return new Response(
      JSON.stringify([
        { permit_number: "1", issue_date: "2026-11-01", city: "Austin", description: "New pool", zip: "78704" },
        { permit_number: "2", issue_date: "2026-11-01", city: "Mesa", description: "New pool", zip: "85201" },
        { permit_number: "3", issue_date: "2026-09-01", city: "austin", description: "New pool", zip: "78704" },
      ]),
    );
  }) as typeof fetch;

  const items = await fetchApify(j, { since: "2026-10-01", apifyToken: "secret", fetchImpl: fake });
  assert.deepEqual(items.map((i) => i.permit_number), ["1"]);
  assert.equal(seen!.url.pathname, "/v2/actor-tasks/me~austin-pools/runs/last/dataset/items");
  assert.equal(seen!.url.searchParams.get("status"), "SUCCEEDED");
  assert.equal(seen!.url.searchParams.get("token"), null, "token must not be in the URL");
  assert.equal(seen!.auth, "Bearer secret");
  assert.equal(normalize(j, items[0])!.category, "pool");
});

test("Apify actor mode POSTs the input; missing token fails clearly", async () => {
  const { fetchApify } = await import("../src/lib/ingest/sources");
  const j: Jurisdiction = {
    id: "a", name: "Mesa (Apify)", state: "AZ", source_type: "apify", endpoint: "https://api.apify.com", dataset_id: null, status: "active",
    field_mapping: { permit_number: "id", issued_at: "date", _query: { date_field: "date", apify: { actor: "someone/permits", input: { city: "Mesa" } } } },
  };
  let body = "";
  const fake = (async (u: string, init?: RequestInit) => {
    assert.ok(u.includes("/v2/acts/someone%2Fpermits/run-sync-get-dataset-items"));
    assert.equal(init?.method, "POST");
    body = String(init?.body);
    return new Response("[]");
  }) as typeof fetch;
  await fetchApify(j, { since: "2026-10-01", apifyToken: "t", fetchImpl: fake });
  assert.deepEqual(JSON.parse(body), { city: "Mesa" });
  await assert.rejects(fetchApify(j, { since: "2026-10-01", fetchImpl: fake }), /APIFY_TOKEN/);
});

test("Apify stand-in is skipped while the city's official source is active", async () => {
  const { skipDuplicates } = await import("../src/lib/ingest/run");
  const mk = (name: string, source_type: Jurisdiction["source_type"]): Jurisdiction => ({
    id: name, name, state: "TX", source_type, endpoint: "", dataset_id: null, status: "active",
    field_mapping: { permit_number: "x", issued_at: "y", _query: { date_field: "y" } },
  });
  const r = skipDuplicates([mk("Austin", "socrata"), mk("Austin (Apify)", "apify"), mk("Dallas (Apify)", "apify")]);
  assert.deepEqual(r.run.map((j) => j.name), ["Austin", "Dallas (Apify)"]);
  assert.deepEqual(r.skipped, ["Austin (Apify)"]);
});

test("city pages: one per city, unconfigured Apify stand-ins add nothing", async () => {
  const { CITIES } = await import("../src/lib/seo/cities");
  const slugs = CITIES.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.includes("austin-tx"));
  assert.equal(CITIES.find((c) => c.slug === "austin-tx")!.source.source_type, "socrata");
});
