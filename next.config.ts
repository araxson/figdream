import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only fail builds on errors, not warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ensure TypeScript errors still fail the build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
