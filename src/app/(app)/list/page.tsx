import type { Metadata } from "next";

import { parsePageParam } from "@/components/ui/pagination";
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
 * The page number is read here rather than with `useSearchParams()` in the list
 * itself: that hook would force the whole subtree behind a Suspense boundary, and
 * reading it on the server keeps `?page=2` shareable and the back button honest.
 *
 * `searchParams` is a Promise in Next 15+ — awaiting it is what opts this route
 * into dynamic rendering, which a per-request query param requires anyway.
 */
export default async function SnapiListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  return <SnapiList page={parsePageParam(page)} />;
}
