import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Lets `next dev` access Cloudflare bindings (env, KV, etc.) locally.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
