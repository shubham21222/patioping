import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/leads", "/onboarding", "/settings", "/api/", "/auth/"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
