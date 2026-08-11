import { clientEnv } from "@/lib/env";

/**
 * Single source of truth for product-level strings and navigation.
 *
 * Anything that appears in more than one place — the product name, the tagline,
 * the nav — lives here so a copy change is one edit, not a grep.
 */
export const siteConfig = {
  name: "Snapi",
  shortName: "Snapi",
  // Kept in step with the home hero headline — this string feeds every page
  // title and the PWA manifest, so a mismatch shows up in search results and on
  // the installed app's splash screen.
  tagline: "Found, not searched.",
  description:
    "Snapi is an AI-assisted personal shopper. Snap it, say it, or simply describe it — Snapi searches every maison and vetted reseller, compares the real price, and tells you when to buy.",
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  ogImage: "/opengraph-image",
  locale: "en-US",
  // Browser chrome / PWA splash. Must track --color-canvas in globals.css.
  themeColor: {
    light: "#faf8f4",
    dark: "#0d0c0a",
  },
  links: {
    twitter: "https://twitter.com/snapi",
    github: "https://github.com/snapi",
    support: "mailto:support@snapi.app",
  },
  keywords: [
    "AI shopping assistant",
    "visual search",
    "price comparison",
    "shopping app",
    "snap to shop",
  ],
} as const;
