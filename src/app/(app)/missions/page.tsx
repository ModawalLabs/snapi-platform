import type { Metadata } from "next";

import { MissionsBoard } from "@/features/missions";

export const metadata: Metadata = {
  title: "Missions",
  description:
    "Standing briefs Snapi works in the background — it keeps watching the market and reports back the moment something fits.",
  // A personal board of what someone is shopping for is theirs alone, and would be
  // empty for every visitor but its owner.
  robots: { index: false, follow: false },
};

/**
 * `/missions` — inside the `(app)` group, so the sidebar stays mounted and the
 * nav item swaps only the main region.
 */
export default function MissionsPage() {
  return <MissionsBoard />;
}
