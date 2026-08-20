import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { missionSeed, Workspace } from "@/features/workspace";
import { mockMissions } from "@/lib/mock-data";

type Params = Promise<{ id: string }>;

function find(id: string) {
  return mockMissions.find((mission) => mission.id === id);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const mission = find(id);

  return {
    title: mission ? mission.name : "Mission",
    robots: { index: false, follow: false },
  };
}

/**
 * `/missions/:id` — a mission opened as a workspace.
 *
 * Lives in `(workspace)`, not `(app)`, so it renders full-screen with no sidebar.
 * The list at `/missions` comes from `(app)/missions/page.tsx`; route groups do not
 * appear in the URL, so the two coexist as `/missions` and `/missions/:id`.
 */
export default async function MissionWorkspacePage({
  params,
  searchParams,
}: {
  params: Params;
  /** `?p=<slug>` opens that product in the results pane. */
  searchParams: Promise<{ p?: string }>;
}) {
  const { id } = await params;
  const mission = find(id);

  // A mission created in-app lives only in client state, so its id is unknown to
  // this server render. `notFound()` is the honest answer — better than an empty
  // workspace that looks like the agent found nothing.
  if (!mission) notFound();

  // Trimmed, so `?p=` and `?p=%20` both mean "no product".
  const productSlug = (await searchParams).p?.trim() || undefined;

  return <Workspace {...missionSeed(mission)} productSlug={productSlug} />;
}
