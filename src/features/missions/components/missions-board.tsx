"use client";

import * as React from "react";

import { PageHeader } from "@/components/ui/page-header";
import { MissionCard } from "@/features/missions/components/mission-card";
import { NewMissionCard } from "@/features/missions/components/new-mission-card";
import { usePendingRemoval } from "@/hooks/use-pending-removal";
import { mockMissions, type MockMission } from "@/lib/mock-data";

/** A name should label a mission, not restate it. */
const NAME_FROM_BRIEF_MAX = 34;

/**
 * Your Shopping Missions.
 *
 * ## Why this is a Client Component
 *
 * Creating, renaming and deleting all have to land somewhere, and with no backend
 * that somewhere is state. A Server Component would re-derive from `mockMissions`
 * on every navigation and quietly undo every edit. The live count in the header
 * reads from the same state, so it sits inside the boundary too.
 *
 * When the API arrives this splits the obvious way: the board keeps the layout and
 * the optimistic updates, and the three mutations become server actions.
 *
 * ## Ordering
 *
 * Newest first, so a mission you just created appears immediately below the compose
 * tile rather than at the bottom of a grid you then have to scroll to find.
 */
export function MissionsBoard() {
  const { items, setItems, pendingId, visibleCount, requestRemove, undo } =
    usePendingRemoval<MockMission>(() =>
      [...mockMissions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );

  // IDs for locally created missions. A counter behind `useId` rather than
  // `Math.random()` or a timestamp: React keys must be unique and stable, and both
  // of those can collide or shift across a re-render.
  const idPrefix = React.useId();
  const created = React.useRef(0);

  const handleCreate = React.useCallback(
    (brief: string) => {
      created.current += 1;

      setItems((current) => [
        {
          id: `${idPrefix}-${created.current}`,
          name: nameFromBrief(brief),
          brief,
          // A brand-new mission is queued, not sweeping. Showing "Sweeping" here
          // would be a claim about work that has not started.
          status: "watching",
          budget: null,
          collections: 0,
          // Safe to read the clock: this only ever runs from a click, long after
          // hydration, so there is no server pass to disagree with.
          lastSweptAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          // No cover yet — MediaFrame renders its lit-studio placeholder, which is
          // a designed state rather than a hole. A real backend would attach art
          // from the first candidates the agent finds.
          image: null,
        },
        ...current,
      ]);
    },
    [setItems, idPrefix],
  );

  const handleRename = React.useCallback(
    (id: string, name: string) => {
      setItems((current) =>
        current.map((mission) => (mission.id === id ? { ...mission, name } : mission)),
      );
    },
    [setItems],
  );

  return (
    <>
      <PageHeader
        eyebrow="Missions"
        meta={`${visibleCount} ${visibleCount === 1 ? "mission" : "missions"}`}
        title="Your Shopping Missions"
        description="Tap a mission to keep shopping, plan your next move, or start a brand-new mission. I'll keep track, optimize deals, and remind you when it's the perfect time to buy."
      />

      <div className="container-page py-10 sm:py-12">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* The compose tile leads the grid — the conventional place for "add",
              and it keeps its position as missions come and go. */}
          <li>
            <NewMissionCard onCreate={handleCreate} />
          </li>

          {items.map((mission) => {
            const pending = mission.id === pendingId;

            return (
              <li key={mission.id} className="relative">
                {/* The card stays mounted while pending so the tile holds its cell
                    and the grid does not reflow around a gap that may reappear.
                    `inert` — not just `aria-hidden` — because an aria-hidden
                    subtree keeps its buttons in the tab order. */}
                <div
                  className={
                    pending
                      ? "opacity-25 transition-opacity duration-300"
                      : "transition-opacity duration-300"
                  }
                  inert={pending}
                >
                  <MissionCard
                    mission={mission}
                    onRename={(name) => handleRename(mission.id, name)}
                    onRemove={() => requestRemove(mission.id)}
                  />
                </div>

                {pending ? (
                  <div className="absolute inset-0 grid place-items-center rounded-xl border border-dashed border-gold-border bg-surface/85 p-5 backdrop-blur-sm">
                    {/* `role="status"` announces the deletion without pulling focus
                        out of the grid mid-task. */}
                    <div role="status" className="text-center">
                      <p className="text-sm text-content-muted">
                        Deleted <span className="font-medium text-content">{mission.name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={undo}
                        className="mt-3 rounded-sm text-sm font-semibold text-gold transition-colors duration-200 hover:text-gold-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      >
                        Undo
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

/**
 * A short label derived from the brief, cut at a word boundary.
 *
 * Only used for missions created here, and only as a starting point — the pencil on
 * the card exists precisely because a machine-cut label is a guess. Slicing
 * mid-character would be worse than truncating: `slice` on a string containing an
 * emoji or a combining accent can split a grapheme and render a replacement box.
 */
function nameFromBrief(brief: string): string {
  const flat = brief.replace(/\s+/g, " ").trim();
  if (flat.length <= NAME_FROM_BRIEF_MAX) return flat;

  const cut = flat.slice(0, NAME_FROM_BRIEF_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 12 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}
