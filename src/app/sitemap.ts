import type { MetadataRoute } from "next";
import { CITIES, SITE } from "@/lib/seo/cities";
import { GUIDES } from "@/lib/seo/guides";
import { createPublicClient } from "@/lib/supabase/public";
import { LIVE_TRADES } from "@/lib/trades";

export const dynamic = "force-dynamic";

/** City pages are listed only once they have real permits; empty ones are noindex. */
async function liveCityPages() {
  const out: MetadataRoute.Sitemap = [];
  try {
    const db = createPublicClient();
    for (const c of CITIES) {
      for (const t of LIVE_TRADES) {
        const { data } = await db.rpc("city_stats", { p_jurisdiction: c.name, p_categories: t.categories });
        if ((data as { last_30?: number } | null)?.last_30) {
          out.push({ url: `${SITE}/${t.slug}/${c.slug}`, changeFrequency: "daily", priority: 0.7 });
        }
      }
    }
  } catch {
    /* database not reachable: ship the static part */
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    ...LIVE_TRADES.map((t) => ({ url: `${SITE}/${t.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(await liveCityPages()),
    { url: `${SITE}/guides`, changeFrequency: "monthly", priority: 0.5 },
    ...GUIDES.map((g) => ({ url: `${SITE}/guides/${g.slug}`, lastModified: g.updated, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE}/alternatives`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
