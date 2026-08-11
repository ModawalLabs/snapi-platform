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
export default async function EditStoryWorkspacePage({ params }: { params: Params }) {
  const { slug } = await params;
  const story = find(slug);

  if (!story) notFound();

  return <Workspace {...storySeed(story)} />;
}
