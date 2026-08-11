import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oranienbaum } from "next/font/google";
import { cookies, headers } from "next/headers";

import { Providers } from "@/components/providers";
import { COOKIES } from "@/config/cookies";
import { parseFlavour } from "@/config/flavour";
import { siteConfig } from "@/config/site";

import "./globals.css";

/**
 * Fonts are self-hosted at build time by next/font — no runtime request to
 * Google, and `display: swap` keeps text visible while they load.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display serif, shared with the marketing site so the two read as one brand.
 *
 * Loaded here (not per-page) because next/font must be called at module scope,
 * but it is only *applied* via `font-display` on editorial surfaces — body copy
 * and all UI chrome stay on Geist. One weight, latin subset: ~15 KB.
 */
const oranienbaum = Oranienbaum({
  variable: "--font-oranienbaum",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Root metadata. `title.template` means each child page declares only its own
 * title and inherits the brand suffix.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Do not lock zoom — pinch-to-zoom is an accessibility requirement.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
};

/**
 * Root layout carries only document-level concerns: fonts, metadata, providers,
 * and the skip link. Application chrome (sidebar) belongs to the `(app)` route
 * group, so future marketing routes can render a completely different shell.
 *
 * Typed as `React.ReactNode` rather than Next's generated `LayoutProps<"/">`:
 * that global only exists after `.next/types` has been generated, so relying on
 * it makes a clean-checkout `tsc --noEmit` fail in CI.
 *
 * Async because the flavour is read from a cookie here. Doing it server-side is
 * what makes the first painted HTML already the right accent — read on the client
 * and every load would paint gold before correcting itself, which across a
 * whole-page accent is a very visible flash. Same reasoning as the sidebar's
 * collapsed state one layer down.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const flavour = parseFlavour(cookieStore.get(COOKIES.flavour)?.value);

  // Set by `proxy.ts` on the request. Providers that emit their own inline
  // script need it, or the CSP reports a violation on every page load.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    // suppressHydrationWarning is required by next-themes: it sets the <html>
    // class before React hydrates. Scoped to this element only.
    <html
      lang="en"
      suppressHydrationWarning
      data-flavour={flavour}
      className={`${geistSans.variable} ${geistMono.variable} ${oranienbaum.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <Providers flavour={flavour} nonce={nonce}>
          {/* First tab stop on every page — lets keyboard users skip the nav. */}
          <a
            href="#main"
            className="sr-only z-100 rounded-md bg-gold-solid px-4 py-2 text-sm font-semibold text-gold-content shadow-premium focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
          >
            Skip to content
          </a>

          {children}
        </Providers>
      </body>
    </html>
  );
}
