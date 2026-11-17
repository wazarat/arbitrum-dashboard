import type { NextConfig } from "next";

/**
 * Served by Next on Vercel (no static export since the login wall, 2026-11-09). Pages still
 * prerender as static HTML; src/proxy.ts runs Clerk in front of them.
 */
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
