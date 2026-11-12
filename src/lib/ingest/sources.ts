import type { FetchOptions, Jurisdiction, RawRecord } from "./types";

const UA = "PatioPing permit ingest (+https://patioping.com)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string, opts: FetchOptions, headers: Record<string, string> = {}) {
  const f = opts.fetchImpl ?? fetch;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await f(url, { headers: { Accept: "application/json", "User-Agent": UA, ...headers } });
    if (res.ok) return res.json();
    // Back off on throttling and transient errors; fail fast on everything else.
    if (res.status === 429 || res.status >= 500) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    throw new Error(`${res.status} ${res.statusText} for ${url}: ${(await res.text()).slice(0, 300)}`);
  }
  throw new Error(`Gave up after retries: ${url}`);
}

/**
 * Socrata SODA 2.x: GET {domain}/resource/{id}.json with SoQL.
 * Pages with $limit/$offset ordered by the date field, then :id for a stable order.
 */
/** Every day from `since` through today (UTC) as MM/DD/YY: "11/04/26". */
export function textDays(since: string, now = new Date()): string[] {
  const out: string[] = [];
  const end = now.toISOString().slice(0, 10);
  for (let d = new Date(`${since}T00:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString();
    out.push(`${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(2, 4)}`);
  }
  return out;
}

export async function fetchSocrata(j: Jurisdiction, opts: FetchOptions): Promise<RawRecord[]> {
  if (!j.dataset_id) throw new Error(`${j.name}: Socrata source needs dataset_id`);
  const { date_field, where, date_text } = j.field_mapping._query;
  const page = 5000;
  const max = opts.maxRecords ?? 50_000;
  // A text date column can't be compared, so ask for each day by its exact text.
  const window = date_text
    ? `${date_field} in (${textDays(opts.since).map((d) => `'${d}'`).join(", ")})`
    : `${date_field} >= '${opts.since}T00:00:00'`;
  const clauses = [window, where].filter(Boolean).join(" AND ");
  const out: RawRecord[] = [];

  for (let offset = 0; offset < max; offset += page) {
    const qs = new URLSearchParams({
      $where: clauses,
      $order: date_text ? ":id" : `${date_field} ASC, :id`,
      $limit: String(Math.min(page, max - offset)),
      $offset: String(offset),
    });
    const url = `${j.endpoint.replace(/\/$/, "")}/resource/${j.dataset_id}.json?${qs}`;
    const rows = (await getJson(url, opts, opts.appToken ? { "X-App-Token": opts.appToken } : {})) as RawRecord[];
    out.push(...rows);
    if (rows.length < page) break;
    await sleep(250);
  }
  return out;
}

/**
 * ArcGIS FeatureServer/MapServer layer: GET {layer}/query. Dates come back as epoch ms;
 * geometry is requested in WGS84 so x/y are lng/lat.
 */
export async function fetchArcgis(j: Jurisdiction, opts: FetchOptions): Promise<RawRecord[]> {
  const { date_field, where } = j.field_mapping._query;
  const max = opts.maxRecords ?? 50_000;
  const base = j.endpoint.replace(/\/$/, "");
  const since = `${date_field} >= DATE '${opts.since}'`;
  const filter = [since, where].filter(Boolean).join(" AND ");
  const out: RawRecord[] = [];
  let offset = 0;

  while (offset < max) {
    const qs = new URLSearchParams({
      where: filter,
      outFields: "*",
      outSR: "4326",
      returnGeometry: "true",
      orderByFields: `${date_field} ASC`,
      resultOffset: String(offset),
      resultRecordCount: "2000",
      f: "json",
    });
    const body = (await getJson(`${base}/query?${qs}`, opts)) as {
      features?: { attributes: RawRecord; geometry?: { x?: number; y?: number } }[];
      exceededTransferLimit?: boolean;
      error?: { message: string };
    };
    if (body.error) throw new Error(`${j.name}: ArcGIS error: ${body.error.message}`);
    const feats = body.features ?? [];
    for (const f of feats) out.push({ ...f.attributes, __x: f.geometry?.x ?? null, __y: f.geometry?.y ?? null });
    offset += feats.length;
    if (!feats.length || !body.exceededTransferLimit) break;
    await sleep(250);
  }
  return out;
}

const APIFY = "https://api.apify.com/v2";

function apifyUrl(j: Jurisdiction, limit?: number) {
  const a = j.field_mapping._query.apify;
  const qs = new URLSearchParams({ clean: "true", format: "json" });
  if (limit) qs.set("limit", String(limit));
  if (a?.task) {
    qs.set("status", "SUCCEEDED");
    return { method: "GET" as const, url: `${APIFY}/actor-tasks/${encodeURIComponent(a.task)}/runs/last/dataset/items?${qs}` };
  }
  if (a?.actor) {
    return { method: "POST" as const, url: `${APIFY}/acts/${encodeURIComponent(a.actor)}/run-sync-get-dataset-items?${qs}`, body: JSON.stringify(a.input ?? {}) };
  }
  throw new Error(`${j.name}: Apify source needs _query.apify.task or _query.apify.actor`);
}

/**
 * Apify: read a scheduled task's last successful dataset (or run an actor), then keep the
 * items for this jurisdiction and issued on/after `since`. Date filtering is client-side
 * because each actor shapes its output differently.
 */
export async function fetchApify(j: Jurisdiction, opts: FetchOptions): Promise<RawRecord[]> {
  if (!opts.apifyToken) throw new Error(`${j.name}: set APIFY_TOKEN to use an Apify source`);
  const f = opts.fetchImpl ?? fetch;
  const req = apifyUrl(j, opts.maxRecords);
  const res = await f(req.url, {
    method: req.method,
    // Token in a header, not the URL, so it never lands in logs.
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": UA, Authorization: `Bearer ${opts.apifyToken}` },
    body: req.body,
  });
  if (!res.ok) throw new Error(`${j.name}: Apify ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const items = (await res.json()) as RawRecord[];

  const { date_field, apify } = j.field_mapping._query;
  const wanted = apify?.filter?.in.map((v) => v.toLowerCase());
  return items.filter((it) => {
    if (wanted && !wanted.includes(String(it[apify!.filter!.field] ?? "").toLowerCase())) return false;
    const d = it[date_field];
    const iso = typeof d === "number" ? new Date(d).toISOString() : String(d ?? "");
    return iso.slice(0, 10) >= opts.since;
  });
}

export function fetchSource(j: Jurisdiction, opts: FetchOptions) {
  if (j.source_type === "socrata") return fetchSocrata(j, opts);
  if (j.source_type === "arcgis") return fetchArcgis(j, opts);
  if (j.source_type === "apify") return fetchApify(j, opts);
  throw new Error(`${j.name}: source_type "${j.source_type}" has no connector yet`);
}

/** Column names + a few sample rows, to write or check a field_mapping. */
export async function discover(j: Jurisdiction, opts: Omit<FetchOptions, "since">) {
  if (j.source_type === "socrata") {
    const meta = (await getJson(`${j.endpoint.replace(/\/$/, "")}/api/views/${j.dataset_id}.json`, { ...opts, since: "" })) as {
      name: string;
      rowsUpdatedAt?: number;
      columns: { fieldName: string; dataTypeName: string; name: string }[];
    };
    const sample = (await getJson(
      `${j.endpoint.replace(/\/$/, "")}/resource/${j.dataset_id}.json?$limit=3&$order=:id DESC`,
      { ...opts, since: "" },
    )) as RawRecord[];
    return {
      name: meta.name,
      updated: meta.rowsUpdatedAt ? new Date(meta.rowsUpdatedAt * 1000).toISOString() : null,
      columns: meta.columns.map((c) => `${c.fieldName} (${c.dataTypeName}) — ${c.name}`),
      sample,
    };
  }
  if (j.source_type === "arcgis") {
    const meta = (await getJson(`${j.endpoint.replace(/\/$/, "")}?f=json`, { ...opts, since: "" })) as {
      name: string;
      fields: { name: string; type: string; alias: string }[];
      editingInfo?: { lastEditDate?: number };
    };
    const sample = (await getJson(
      `${j.endpoint.replace(/\/$/, "")}/query?where=1%3D1&outFields=*&resultRecordCount=3&f=json`,
      { ...opts, since: "" },
    )) as { features?: { attributes: RawRecord }[] };
    return {
      name: meta.name,
      updated: meta.editingInfo?.lastEditDate ? new Date(meta.editingInfo.lastEditDate).toISOString() : null,
      columns: meta.fields.map((f) => `${f.name} (${f.type}) — ${f.alias}`),
      sample: (sample.features ?? []).map((f) => f.attributes),
    };
  }
  if (j.source_type === "apify") {
    const items = await fetchApify(j, { ...opts, since: "0000-00-00", maxRecords: 200 });
    const keys = [...new Set(items.flatMap((it) => Object.keys(it)))];
    return { name: j.name, updated: null, columns: keys.map((k) => `${k} (${typeof items.find((i) => i[k] != null)?.[k]})`), sample: items.slice(0, 3) };
  }
  throw new Error(`No discover for ${j.source_type}`);
}
