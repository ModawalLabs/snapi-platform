import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Sitemap.
 *
 * Static routes only for now. Once the catalog exists, product URLs should be
 * emitted from a paginated sitemap index (`sitemap/[id]/route.ts`) — a single
 * file caps out at 50k URLs, which a real catalog will exceed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/discover", changeFrequency: "hourly", priority: 0.9 },
    { path: "/snap", changeFrequency: "weekly", priority: 0.9 },
    { path: "/deals", changeFrequency: "hourly", priority: 0.8 },
    { path: "/how-it-works", changeFrequency: "monthly", priority: 0.5 },
  ];

  return staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
