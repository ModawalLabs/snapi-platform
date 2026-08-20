import { routes } from "@/config/routes";

/**
 * Whether the docked composer belongs on a given route.
 *
 * One predicate, two consumers — `FloatingComposer` (should I render?) and
 * `AskSnapiButton` (do I open the dock, or just ask for the cursor?). Two copies of
 * this would drift into the state where the button summons nothing.
 *
 * The Concierge is the only exception, and it is a real one: that page renders a
 * composer of its own as its whole reason for existing, and a second one sliding up
 * from the bottom edge would be two chat boxes on one screen asking the same
 * question.
 *
 * No `"use client"` — a shared constant declared inside a client module gets
 * replaced by a client-reference proxy when a server module imports it, which fails
 * at runtime in a way that looks nothing like its cause. This project has been
 * bitten by that once already; see `lib/modality.ts`.
 */
export function dockBelongsOn(pathname: string): boolean {
  return pathname !== routes.concierge();
}
