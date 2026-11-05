import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Gives `next dev` access to Cloudflare bindings. Only in dev: during `next build` the
// parallel build workers would each start Miniflare and fight over its SQLite state.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
