import type { Metadata } from "next";

import { promptSeed, Workspace } from "@/features/workspace";

export const metadata: Metadata = {
  title: "Ask Snapi",
  robots: { index: false, follow: false },
};

/**
 * `/chat` — a new search, optionally pre-filled from `?q=`.
 *
 * This is where the home banner's rotating prompts land. The query travels in the
 * URL rather than in client state so the result is shareable and survives a
 * refresh, which is the whole reason the workspace is a page.
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

  return <Workspace {...promptSeed(q ?? "")} />;
}
