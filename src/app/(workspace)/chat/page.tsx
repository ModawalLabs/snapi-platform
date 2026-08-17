import type { Metadata } from "next";

import { ChatStart, promptSeed, Workspace } from "@/features/workspace";

export const metadata: Metadata = {
  title: "Ask Snapi",
  robots: { index: false, follow: false },
};

/**
 * `/chat` — the assistant, in its two states.
 *
 * Without `?q=` it is the start page: a greeting, the concierge's brief, the
 * composer, and what is already in motion. With a query it is the answered
 * surface — the 30/70 thread and results.
 *
 * One route rather than two, because these are the same thing before and after a
 * question. It also means a shared `/chat` link lands somewhere sensible instead
 * of on a conversation the recipient never had: previously an empty query seeded a
 * whole fake exchange out of nothing, which was the weaker half of this route's
 * behaviour.
 *
 * `searchParams` is a Promise in Next 15+; awaiting it opts this route into
 * dynamic rendering, which a per-request query param requires anyway.
 */
export default async function NewChatWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const prompt = q?.trim() ?? "";

  // `trim`, not just a presence check: `?q=` and `?q=%20` both arrive as strings
  // and both mean "nothing was asked".
  if (prompt.length === 0) return <ChatStart />;

  return <Workspace {...promptSeed(prompt)} />;
}
