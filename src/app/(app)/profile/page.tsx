import type { Metadata } from "next";

import { Profile } from "@/features/profile";

export const metadata: Metadata = {
  title: "Account",
  description: "Your edition, what Snapi has learned about you, and this session.",
  // One person's account. There is nothing here for an index and nothing a visitor
  // other than its owner could see.
  robots: { index: false, follow: false },
};

/**
 * `/profile` — inside the `(app)` group, so the sidebar stays mounted and the account
 * row opens the page beside the menu rather than replacing the screen.
 *
 * It was a modal until it grew: memory with add and forget is a settings table, and a
 * table inside a capped card is a window inside a window. See the component.
 */
export default function ProfilePage() {
  return <Profile />;
}
