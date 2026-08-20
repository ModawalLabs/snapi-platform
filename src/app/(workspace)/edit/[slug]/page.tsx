import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { storySeed, Workspace } from "@/features/workspace";
import { mockEditStories } from "@/lib/mock-data";

type Params = Promise<{ slug: string }>;

function find(slug: string) {
  return mockEditStories.find((story) => story.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const story = find(slug);

  return { title: story ? story.title : "The Edit" };
}

/** `/edit/:slug` — an editorial story, opened as a shoppable workspace. */
export default async function EditStoryWorkspacePage({
  params,
  searchParams,
}: {
  params: Params;
  /** `?p=<slug>` opens that product in the results pane. */
  searchParams: Promise<{ p?: string }>;
}) {
  const { slug } = await params;
  const story = find(slug);

  if (!story) notFound();

  // Trimmed, so `?p=` and `?p=%20` both mean "no product".
  const productSlug = (await searchParams).p?.trim() || undefined;

  return <Workspace {...storySeed(story)} productSlug={productSlug} />;
}
