import type { Metadata } from "next";

import { parsePageParam } from "@/components/ui/pagination";
import { ChatHistory } from "@/features/chats";

export const metadata: Metadata = {
  title: "Chat History",
  description: "Everything you've asked Snapi, newest first.",
  // Someone's conversation history is theirs alone, and would be empty for every
  // visitor but its owner.
  robots: { index: false, follow: false },
};

/**
 * `/chats` — inside the `(app)` group, so the sidebar stays mounted and "View all"
 * swaps only the main region.
 *
 * The page number is read here rather than with `useSearchParams()`, which would
 * force this subtree behind a Suspense boundary and drag the whole list into the
 * browser. Reading it on the server keeps `?page=2` shareable, the back button
 * honest, and the history list a Server Component.
 *
 * `searchParams` is a Promise in Next 15+; awaiting it opts this route into
 * dynamic rendering, which a per-request query param requires anyway.
 */
export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  return <ChatHistory page={parsePageParam(page)} />;
}
