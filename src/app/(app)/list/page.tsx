import type { Metadata } from "next";

import { SnapiList } from "@/features/list";

export const metadata: Metadata = {
  title: "Snapi List",
  description: "The pieces you've set aside — kept in view until the moment is right.",
  // A personal saved-items list has nothing to offer a search index, and would be
  // empty for every visitor but its owner.
  robots: { index: false, follow: false },
};

/**
 * `/list` — inside the `(app)` group, so the sidebar stays mounted and clicking
 * "Snapi List" swaps only the main region.
 *
 * Synchronous again. It used to `await searchParams` to read `?page=`; the list now
 * shows every saved piece on one scroll, so there is no page number to read and
 * nothing on this page that varies per request.
 *
 * Still rendered on demand rather than prerendered, and that is not this file's
 * doing — the `(app)` layout reads the sidebar's collapsed state from a cookie, which
 * makes every route in the group dynamic.
 */
export default function SnapiListPage() {
  return <SnapiList />;
}
