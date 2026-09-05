import type { Metadata } from "next";

import { Notifications } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Price drops, mission finds, and changes to anything you have set aside.",
  // One person's alerts. Nothing here for an index, and nothing a visitor other than
  // its owner could see.
  robots: { index: false, follow: false },
};

/**
 * `/notifications` — inside the `(app)` group, so the sidebar stays mounted and its
 * badge sits beside the page it belongs to.
 *
 * The sidebar has linked here since the rail was built; this is the page arriving.
 */
export default function NotificationsPage() {
  return <Notifications />;
}
