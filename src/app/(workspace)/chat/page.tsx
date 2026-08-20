import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { promptSeed, Workspace } from "@/features/workspace";

export const metadata: Metadata = {
  title: "Ask Snapi",
  robots: { index: false, follow: false },
};

/**
 * `/chat?q=…` — a search, full screen.
 *
 * The answered half of the assistant: the 30/70 thread and results, outside the
 * `(app)` group so the sidebar is genuinely absent rather than covered.
 *
 * Nothing asked means nothing to show, so a bare `/chat` redirects to the
 * Concierge, which is the page that exists for that state. It used to render a
 * start page here instead, but the two want opposite chrome — one sits beside the
 * sidebar, the other takes the window — and a layout is fixed per segment.
 *
 * A redirect rather than rendering the Concierge inline: the URL should end up
 * being the one that matches what you are looking at, or the back button and a
 * shared link both lie.
 *
 * `searchParams` is a Promise in Next 15+; awaiting it opts this route into
 * dynamic rendering, which a per-request query param requires anyway.
 */
export default async function ChatWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string }>;
}) {
  const { q, p } = await searchParams;

  // `trim`, not just a presence check: `?q=` and `?q=%20` both arrive as strings
  // and both mean "nothing was asked".
  const prompt = q?.trim() ?? "";
  if (prompt.length === 0) redirect(routes.concierge());

  return <Workspace {...promptSeed(prompt)} productSlug={p?.trim() || undefined} />;
}
