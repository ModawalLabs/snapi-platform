import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The dotted tile that starts a new mission.
 *
 * It shares the portrait aspect of a real mission card so the grid stays on one
 * rhythm — a shorter "add" tile would leave a hole in the first row.
 *
 * ## A button, and nothing more
 *
 * It used to hold a second state: the tile flipped into a small textarea and you
 * wrote the brief inside the cell. That is gone, and the tile now opens the mission
 * onboarding page instead.
 *
 * The in-place version had the better argument on paper — composing in the grid keeps
 * the existing missions visible while you write, which is what stops people creating
 * the same brief twice. What it lost was the worked examples. Tapping a starter drops
 * its brief into the field and *shows* you the shape of one, and that was reachable
 * only from an empty board — so the only people who ever saw it were people who had
 * never written a mission, and everyone else got a blank rectangle for the rest of
 * time. One composer, with the examples, for everyone.
 *
 * A `<button>` filling the tile, not a `<div onClick>`: it needs to be reachable by
 * keyboard and announced as an action, and a button gets both for free.
 */
export function NewMissionCard({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className={cn(
        "flex aspect-[3/4] min-h-[19rem] flex-col rounded-xl border border-dashed border-border-strong",
        "transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group w-full items-center justify-center gap-4 p-5 text-center",
        "hover:border-gold-border hover:bg-gold-subtle/40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-full border border-dashed border-border-strong text-content-muted",
          "transition-[background-color,border-color,color,scale] duration-500",
          "group-hover:scale-105 group-hover:border-gold-border group-hover:text-gold",
        )}
        aria-hidden="true"
      >
        <Plus className="size-5" />
      </span>

      <span className="block">
        <span className="block font-display text-lg font-normal text-content">New mission</span>
        <span className="mt-1.5 block max-w-[16rem] text-[13px] leading-relaxed text-content-muted">
          Describe what you&rsquo;re hunting for. Snapi keeps looking until it finds it.
        </span>
      </span>
    </button>
  );
}
