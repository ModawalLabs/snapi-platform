import type { Metadata } from "next";

import { BrandIndex, parseLetterParam } from "@/features/brands";

export const metadata: Metadata = {
  title: "Designer Worlds",
  description:
    "Every house Snapi carries, from authorised boutiques to vetted resale — the full A–Z register of maisons.",
};

/**
 * `/brands` — the maison register, where "All brands" lands.
 *
 * Inside the `(app)` group, so the sidebar stays mounted and only the main region
 * changes. `/brands/[slug]` lives in `(workspace)` and takes the whole viewport:
 * browsing the register is navigation, opening a house is a session.
 *
 * Indexable, like `/edit` — which houses a retailer carries is public information
 * and identical for every visitor.
 *
 * The letter filter is read here rather than held in client state, so `?letter=B`
 * is shareable, survives a refresh, and leaves the register a Server Component.
 * Awaiting `searchParams` is what opts this route into dynamic rendering, which a
 * per-request query param requires anyway.
 */
export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string }>;
}) {
  const { letter } = await searchParams;

  return <BrandIndex letter={parseLetterParam(letter)} />;
}
