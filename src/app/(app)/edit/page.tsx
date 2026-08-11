import type { Metadata } from "next";

import { EditIndex } from "@/features/edit";

export const metadata: Metadata = {
  title: "The Edit",
  description:
    "Considered writing on what to buy, what to keep, and what to leave behind — from the people who handle the pieces.",
};

/**
 * `/edit` — the editorial index, where "All stories" lands.
 *
 * Inside the `(app)` group, so the sidebar stays mounted and only the main region
 * changes. That is the distinction from `/edit/[slug]`, which lives in
 * `(workspace)` and takes over the whole viewport: reading the index is browsing,
 * opening a story is a session.
 *
 * Indexable, unlike the other interior routes: editorial is the one surface here
 * that is genuinely public and the same for everyone.
 */
export default function EditIndexPage() {
  return <EditIndex />;
}
