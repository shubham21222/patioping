import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Prerendered pages (trade pages, guides: `dynamicParams = false`) are read from Workers static
// assets. Without an incremental cache they 404 in production. No page uses revalidation (ISR);
// add an R2 cache instead if one ever does.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
