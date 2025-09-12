import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
