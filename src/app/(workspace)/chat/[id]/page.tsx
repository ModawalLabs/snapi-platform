import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { chatSeed, Workspace } from "@/features/workspace";
import { mockRecents } from "@/lib/mock-data";

type Params = Promise<{ id: string }>;

function find(id: string) {
  return mockRecents.find((conversation) => conversation.id === id);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const conversation = find(id);

  return {
    title: conversation ? conversation.title : "Conversation",
    robots: { index: false, follow: false },
  };
}

/** `/chat/:id` — a past conversation, reopened as a workspace. */
export default async function ChatWorkspacePage({
  params,
  searchParams,
}: {
  params: Params;
  /** `?p=<slug>` opens that product in the results pane. */
  searchParams: Promise<{ p?: string }>;
}) {
  const { id } = await params;
  const conversation = find(id);

  if (!conversation) notFound();

  // Trimmed, so `?p=` and `?p=%20` both mean "no product".
  const productSlug = (await searchParams).p?.trim() || undefined;

  return <Workspace {...chatSeed(conversation)} productSlug={productSlug} />;
}
