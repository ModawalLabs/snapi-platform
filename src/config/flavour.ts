/**
 * Flavours — the two editions of Snapi.
 *
 * Not a pricing tier with a badge: a flavour changes the product's *register*.
 * Signature is the gold, editorial one — "Curated luxury, tailored to you", with
 * section headings to match. All Rounder is the same product aimed wider —
 * "Everything worth having, at every price" — so it wears azure and speaks in
 * plainer commerce language.
 *
 * That is why the copy lives here beside the token switch rather than in the
 * components: the accent and the wording are one decision, and splitting them
 * across two files is how they drift.
 *
 * No `"use client"`. This is imported by both the server (reading the cookie in
 * the root layout, choosing headings during render) and the client (the profile
 * dialog that switches it). A constant imported from a client module into a
 * Server Component arrives as a client-reference proxy rather than its value —
 * the same trap `config/cookies.ts` documents.
 */

export const FLAVOURS = ["signature", "all-rounder"] as const;

export type Flavour = (typeof FLAVOURS)[number];

export const DEFAULT_FLAVOUR: Flavour = "signature";

/** Narrow an untrusted cookie value. Anything unrecognised falls back. */
export function parseFlavour(raw: string | undefined): Flavour {
  return FLAVOURS.includes(raw as Flavour) ? (raw as Flavour) : DEFAULT_FLAVOUR;
}

/**
 * Home page copy, per flavour.
 *
 * The two editions are aimed at different shoppers and have to sound like it.
 * Signature is a boutique: maisons, vetted resale, a curated few. All Rounder is
 * a marketplace — everything, from everyone, at every price — so it counts
 * sellers rather than curating them, and promises breadth where Signature
 * promises judgement.
 *
 * The eyebrows switch too, not just the headings. "Maisons on Snapi" sitting
 * above "Top Brands" would read as a rename somebody abandoned halfway.
 *
 * "Featured this week" is deliberately absent — it names a cadence rather than a
 * register, so it is true in both editions and changing it would be change for
 * its own sake.
 */
export const FLAVOUR_COPY = {
  signature: {
    label: "Signature",

    heroEyebrow: "AI-assisted personal shopping",
    /** Split so the first phrase can carry the foil. */
    heroTitleLead: "Found,",
    heroTitleRest: "not searched.",
    heroSupport:
      "Snap it, say it, or simply describe it. Snapi searches every maison and vetted reseller, compares the real price, and tells you when to buy.",

    /**
     * The words on the crossed ribbons under the hero.
     *
     * Kept short and set in caps, so anything past ~20 characters stops being
     * readable as it travels. Four to six is the working range: fewer and the
     * loop repeats visibly within one screen width.
     */
    ribbon: ["Investment Pieces", "Archive Finds", "Quiet Luxury", "Seasonal Highlights"],

    theEdit: "The Edit",
    theEditEyebrow: "Curated weekly",
    theEditDescription:
      "Considered writing on what to buy, what to keep, and what to leave behind.",
    theEditAction: "All stories",

    brands: "Explore Designer Worlds",
    brandsEyebrow: "Maisons on Snapi",
    brandsDescription:
      "Browse by house. Snapi aggregates authorised boutiques and vetted resale for each.",

    picks: "More For You",
    picksEyebrow: "Selected for you",
    picksDescription: "Built from what you've saved, searched, and asked Snapi to watch.",
  },

  "all-rounder": {
    label: "All Rounder",

    heroEyebrow: "AI-assisted shopping, everywhere",
    heroTitleLead: "One Platform.",
    heroTitleRest: "Infinite Choices",
    heroSupport:
      "Snap it, say it, or simply describe it. Snapi searches thousands of sellers at once, compares every price and delivery date, and tells you which listing is actually worth buying.",

    ribbon: ["Best Sellers", "Today's Deals", "New Arrivals", "Under $50", "Fast Delivery"],

    theEdit: "Trending Now",
    theEditEyebrow: "Moving fastest today",
    theEditDescription:
      "What people are actually buying right now, across every category and every price.",
    theEditAction: "All trends",

    brands: "Top Brands",
    brandsEyebrow: "Thousands of sellers",
    brandsDescription:
      "From household names to the small sellers worth knowing — Snapi checks stock and price at all of them.",

    picks: "Snapi Picks",
    picksEyebrow: "Chosen for you",
    picksDescription:
      "Pulled from everything on offer and narrowed to what fits what you actually buy.",
  },
} as const satisfies Record<Flavour, Record<string, string | readonly string[]>>;
