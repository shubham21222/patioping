import type { NormalizedPermit } from "./types";

/**
 * Fill missing zips from the US Census Geocoder (free, no key, public domain).
 * Leads match on zip, so sources without a zip column (Mesa, Orlando) need this.
 * Runs only on permits we keep, a few dozen per city per day.
 *
 * https://geocoding.geo.census.gov/geocoder/locations/onelineaddress
 */
const CENSUS = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";

type CensusResponse = {
  result?: { addressMatches?: { addressComponents?: { zip?: string } }[] };
};

export async function lookupZip(oneLine: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const qs = new URLSearchParams({ address: oneLine, benchmark: "Public_AR_Current", format: "json" });
  try {
    const res = await fetchImpl(`${CENSUS}?${qs}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const body = (await res.json()) as CensusResponse;
    const zip = body.result?.addressMatches?.[0]?.addressComponents?.zip;
    return zip && /^\d{5}$/.test(zip) ? zip : null;
  } catch {
    return null;
  }
}

/** Mutates permits in place. Returns how many zips were filled. */
export async function enrichZips(
  permits: NormalizedPermit[],
  place: { city: string; state: string },
  opts: {
    concurrency?: number;
    fetchImpl?: typeof fetch;
    /** The record's own city (county-wide sources); falls back to `place.city` */
    cityOf?: (p: NormalizedPermit) => string | null;
  } = {},
): Promise<number> {
  const todo = permits.filter((p) => !p.zip && p.address);
  let filled = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const city = opts.cityOf?.(p) || place.city;
      const zip = await lookupZip(`${p.address}, ${city}, ${place.state}`, opts.fetchImpl);
      if (zip) {
        p.zip = zip;
        filled++;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.concurrency ?? 4, todo.length) }, worker));
  return filled;
}
