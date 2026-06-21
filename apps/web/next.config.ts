import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shared workspace package ships raw .ts (no build step), so Next must compile it.
  transpilePackages: ["@sidequest/shared"],
};

export default nextConfig;
