import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

// Initialize OpenNext Cloudflare for development
initOpenNextCloudflareForDev();

export default nextConfig;