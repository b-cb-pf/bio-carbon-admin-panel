import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // ECS runs with a read-only root filesystem, so the runtime image optimizer
  // cannot write its cache under .next/cache.
  images: { unoptimized: true },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
