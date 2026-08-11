"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Matches the brief field on a real mission; long enough for a sentence. */
const BRIEF_MAX = 180;

/**
 * The dotted tile that starts a new mission.
 *
 * It shares the portrait aspect of a real mission card so the grid stays on one
 * rhythm — a shorter "add" tile would leave a hole in the first row.
 *
 * Two states rather than a route or a dialog. Composing in place keeps the
 * existing missions visible while you write, which is what stops people creating
 * the same brief twice; a full-page form hides exactly the context you need.
 *
 * Idle state is a `<button>` filling the tile, not a `<div onClick>` — it needs to
 * be reachable by keyboard and announced as an action, and a button gets both for
 * free.
 */
export function NewMissionCard({ onCreate }: { onCreate: (brief: string) => void }) {
  const [composing, setComposing] = React.useState(false);
  const [brief, setBrief] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Focus on opening the composer. In an effect rather than via `autoFocus` so it
  // fires on the transition only, and never on mount — a card that grabs focus as
  // the page loads sends a keyboard user somewhere they did not ask to go.
  React.useEffect(() => {
    if (composing) textareaRef.current?.focus();
  }, [composing]);

  const ready = brief.trim().length > 0;

  function submit() {
    if (!ready) return;
    onCreate(brief.trim());
    setBrief("");
    setComposing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setBrief("");
      setComposing(false);
      return;
    }

    // Enter submits, Shift+Enter breaks the line — the convention every composer
    // in this app follows. `isComposing` guards IME candidate selection, where
    // Enter means "accept this character", not "send".
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  const shell = cn(
    "flex aspect-[3/4] min-h-[19rem] flex-col rounded-xl border border-dashed border-border-strong",
    "transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  );

  if (!composing) {
    return (
      <button
        type="button"
        onClick={() => setComposing(true)}
        className={cn(
          shell,
          "group w-full items-center justify-center gap-4 p-5 text-center",
          "hover:border-gold-border hover:bg-gold-subtle/40",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <span
          className={cn(
            "grid size-11 place-items-center rounded-full border border-dashed border-border-strong text-content-muted",
            "transition-[background-color,border-color,color,transform] duration-500",
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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn(shell, "border-gold-border bg-surface p-5 shadow-premium-sm")}
    >
      <label htmlFor="new-mission-brief" className="text-eyebrow shrink-0 text-gold">
        New mission
      </label>

      {/* `flex-1` with the textarea filling it, so the writing area grows with the
          tile instead of being a fixed row count that leaves dead space. */}
      <textarea
        ref={textareaRef}
        id="new-mission-brief"
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={BRIEF_MAX}
        placeholder="A Kelly 25 in Etoupe, sellier stitch, under $16,000"
        className={cn(
          "mt-3 min-h-0 w-full flex-1 resize-none rounded-lg border border-border bg-canvas p-3",
          "text-[13px] leading-relaxed text-content placeholder:text-content-subtle",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      />

      <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setBrief("");
            setComposing(false);
          }}
          className={cn(
            "rounded-sm text-[13px] font-medium text-content-muted transition-colors duration-200 hover:text-content",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
          )}
        >
          Cancel
        </button>

        {/* Genuinely disabled, not just dimmed — an empty brief has nothing for the
            agent to work from, and letting the click through would create a
            nameless mission. */}
        <button
          type="submit"
          disabled={!ready}
          className={cn(
            "rounded-md bg-gold-solid px-3.5 py-2 text-[13px] font-semibold text-gold-content",
            "transition-[background-color,opacity] duration-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            // `gold-solid-hover`, not `gold-hover` — the latter is the *content*
            // gold, tuned for text contrast, and reads muddy as a fill.
            ready ? "hover:bg-gold-solid-hover" : "cursor-not-allowed opacity-40",
          )}
        >
          Start mission
        </button>
      </div>
    </form>
  );
}
