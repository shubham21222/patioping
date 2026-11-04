import type { MetadataRoute } from "next";
import { LIVE_TRADES } from "@/lib/trades";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    ...LIVE_TRADES.map((t) => ({ url: `${SITE}/${t.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${SITE}/signup`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
