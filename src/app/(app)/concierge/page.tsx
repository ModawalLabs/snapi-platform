import type { Metadata } from "next";

import { ChatStart } from "@/features/workspace";

export const metadata: Metadata = {
  title: "Concierge",
  description: "Your briefing, and somewhere to begin.",
  // A personal briefing has nothing to offer a search index and would be empty
  // for every visitor but its owner.
  robots: { index: false, follow: false },
};

/**
 * `/concierge` — where a session begins.
 *
 * Inside the `(app)` group, so the sidebar stays mounted and only the main region
 * changes. It used to be `/chat` with no query and therefore full screen, which was
 * the wrong shape for it: a briefing is somewhere you *are*, and taking the whole
 * window to show it meant leaving the app to look at your own missions.
 *
 * The answered view stays full screen at `/chat?q=…`. Submitting the composer here
 * is what moves you from one to the other.
 */
export default function ConciergePage() {
  return <ChatStart />;
}
