import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { isProduction } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed — duplicate content and leaked
  // unreleased pages are both real costs.
  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout", "/orders", "/sign-in"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
