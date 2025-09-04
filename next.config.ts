import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Memory configuration to prevent TypeScript OOM errors
  experimental: {
    // Increase memory limit for builds
    workerThreads: false,
    cpus: 1,
  },
  
  // TypeScript configuration
  typescript: {
    // During development, we'll allow builds with errors temporarily
    // This will be set to false once all errors are fixed
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration  
  eslint: {
    // During development, we'll allow builds with errors temporarily
    // This will be set to false once all errors are fixed
    ignoreDuringBuilds: false,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
  
  // Webpack configuration for memory optimization
  webpack: (config, { isServer }) => {
    // Optimize memory usage
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;