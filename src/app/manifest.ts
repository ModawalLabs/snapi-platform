import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * PWA manifest. Snapi is camera-first, so installability matters — an installed
 * app gets a better camera surface and no browser chrome eating the viewport.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.themeColor.dark,
    theme_color: siteConfig.themeColor.dark,
    orientation: "portrait-primary",
    categories: ["shopping", "lifestyle", "utilities"],
    /**
     * `purpose: "maskable"` is deliberately absent. Android crops a maskable icon
     * to whatever shape the launcher uses, and this artwork is a bag on
     * transparency with no safe-zone padding built in — declaring it maskable
     * would have the corners of the bag sliced off. It is served as `any`, so the
     * launcher pads it into a plate instead.
     */
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
  };
}
