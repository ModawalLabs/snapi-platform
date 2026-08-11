import type { Metadata } from "next";

import { FLAVOUR_COPY } from "@/config/flavour";
import { TrendsBoard } from "@/features/trends";

export const metadata: Metadata = {
  title: "Trending Now",
  description:
    "What people are actually buying right now on Snapi — across every category, every seller and every price.",
};

/**
 * `/trends` — All Rounder's counterpart to `/edit`, reached from "All trends".
 *
 * Inside the `(app)` group, so the sidebar stays mounted and only the main region
 * changes.
 *
 * A route of its own rather than a flavour-aware `/edit`. The two are different
 * content, not the same content renamed: one is an editorial archive with authors
 * and standfirsts, the other is a live ranking of what is selling. Sharing a URL
 * would make the destination depend on a cookie, which breaks the link the moment
 * it is shared or opened in a new tab.
 *
 * The copy is read from All Rounder's set unconditionally rather than from the
 * active flavour. This page *is* the All Rounder edition — a Signature reader
 * reaching it by direct link should still see the page as designed, not the
 * boutique's wording over a marketplace grid.
 *
 * Indexable, like `/edit` — what is popular is public and identical for everyone.
 */
export default function TrendsPage() {
  const copy = FLAVOUR_COPY["all-rounder"];

  return (
    <TrendsBoard
      eyebrow={copy.theEditEyebrow}
      title={copy.theEdit}
      description="Ranked by what is selling fastest across every seller Snapi checks — updated through the day."
    />
  );
}
