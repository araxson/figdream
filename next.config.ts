import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "recharts",
      "clsx",
      "class-variance-authority",
    ],
  },

  // Enable Turbopack for faster development builds
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Optimize compilation
  output: "standalone",

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Type Options
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Frame Options
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // XSS Protection (legacy but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? `
                default-src 'self';
                script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: https://*.supabase.co https://*.supabase.in;
                font-src 'self';
                connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
                worker-src 'self' blob:;
                child-src 'self' blob:;
                object-src 'none';
                base-uri 'self';
                form-action 'self';
                frame-ancestors 'none';
                upgrade-insecure-requests;
              `
                    .replace(/\s+/g, " ")
                    .trim()
                : `
                default-src 'self';
                script-src 'self' https://*.supabase.co;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: https://*.supabase.co https://*.supabase.in;
                font-src 'self';
                connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
                worker-src 'self';
                object-src 'none';
                base-uri 'self';
                form-action 'self';
                frame-ancestors 'none';
                upgrade-insecure-requests;
              `
                    .replace(/\s+/g, " ")
                    .trim(),
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ["hlwlbighcjnmgoulvkog.supabase.co"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
};

export default nextConfig;
