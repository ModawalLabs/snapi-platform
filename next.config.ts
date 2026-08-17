import type { NextConfig } from "next";

/**
 * Static security headers applied to every response.
 *
 * CSP is deliberately absent here — it is emitted per-request from
 * `src/middleware.ts` so it can carry a fresh nonce.
 */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Camera stays open: Snapi's visual search needs it.
    value: "camera=(self), microphone=(self), geolocation=(self), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * `standalone` keeps container images small (no node_modules copy).
   *
   * This is *not* what broke the Vercel build with
   * `ENOENT … .next/next-server.js.nft.json`, despite being the only option that
   * touches the output-tracing path the error comes from. The sibling project
   * carries the identical line and deploys clean — the difference between them was
   * the Next version, not this. Left alone deliberately, so the next person
   * debugging a Vercel build does not spend an afternoon here.
   */
  output: "standalone",

  // Never flip this to `true` — a red build is the point.
  // (Lint runs as its own CI step; Next 16 no longer wires ESLint into build.)
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,
  compress: true,

  images: {
    // Product imagery comes from a CDN / merchant feeds. Add hosts explicitly —
    // wildcards defeat the purpose of this allowlist.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.snapi.app" },
    ],
    formats: ["image/avif", "image/webp"],
    // 30 days: merchant images are effectively immutable per URL.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    // Trim the client bundle for icon-style barrel exports.
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
