"use client";

import { Check, Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Choosing from a vocabulary, as an index page rather than a menu.
 *
 * Three of the memory sections have a closed set behind them — the aesthetics Snapi
 * understands, the categories it files by, the houses it stocks. This is where you read
 * that set and take from it.
 *
 * ## Why it is a page and not a dropdown
 *
 * It was a 240px panel with a search field and a scrolling list, which is the right
 * control for picking *one* known thing and the wrong one for browsing thirty-seven
 * houses. A list that shows six of them at a time hides the answer to the only question
 * the reader has, which is "what is on offer".
 *
 * So it opens as a modal set like the back of the magazine: eyebrow, a title in the
 * display serif, and the vocabulary as a ruled, numbered, multi-column index — the same
 * register as The Edit's departments. Everything is visible at once and nothing needs
 * to be searched for; the search field is there for the reader who already knows the
 * name, not as the only way in.
 *
 * ## Every tap commits
 *
 * There is no staging and no confirm button. Tapping a line adds it, the line
 * immediately shows as ticked and goes inert, and the pill appears behind the dialog.
 * That is what lets the dialog stay open while several are taken, and it is why nothing
 * here can be cancelled: the dialog only ever adds, and removing is the pill's × on the
 * page. One direction per surface, rather than two half-implemented ones.
 *
 * Already-added lines are shown rather than filtered out. The index is then the whole
 * vocabulary, so a name missing from it means the app does not know that name — where a
 * filtered list leaves "already yours" and "does not exist" looking identical.
 */
export function TagDialog({
  label,
  options,
  selected,
  onAdd,
  onClose,
}: {
  /** The section's name. The dialog's title. */
  label: string;
  /** The whole vocabulary, in the order it should be read. */
  options: readonly string[];
  /** Already-added tags. Shown ticked and inert. */
  selected: readonly string[];
  onAdd: (value: string) => void;
  onClose: () => void;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [query, setQuery] = React.useState("");

  /**
   * Opened imperatively, once, on mount.
   *
   * `showModal()` is what gives the focus trap, the Escape handler, the inert
   * background and the `::backdrop` — all implemented by the browser and all of them
   * things a hand-rolled modal gets subtly wrong. React has no prop for it, and the
   * plain `open` attribute renders a *non-modal* dialog with none of the above.
   *
   * The component is mounted only while it is meant to be open, so this runs once and
   * the browser's own `close` event is what tells the caller to unmount it.
   */
  React.useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const taken = React.useMemo(() => new Set(selected.map((tag) => tag.toLowerCase())), [selected]);

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicking the backdrop closes. The check is on the target being the dialog
      // itself: the backdrop is a pseudo-element and cannot take its own listener, but
      // clicks that land on it report the dialog as the target, while clicks inside the
      // card report a descendant.
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      aria-labelledby="tag-dialog-title"
      className={cn(
        "m-auto w-[min(48rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-content shadow-premium-lg",
        // `open:flex`, never a bare `flex`. The browser hides a closed dialog with
        // `dialog:not([open]) { display: none }`, and a `display` of our own on the
        // element beats it — which renders the whole panel inline in the page.
        "max-h-[min(44rem,calc(100dvh-2rem))] overflow-hidden open:flex open:flex-col",
        "backdrop:bg-black/55 backdrop:backdrop-blur-sm",
        "open:animate-in open:duration-200 open:zoom-in-95 open:fade-in",
      )}
    >
      {/* ── Masthead ────────────────────────────────────────────────────────
          The same ambient wash every page header in the app carries, so this opens
          in the app's own register rather than looking like a system sheet. Outside
          the scroll container: the title and the way out are the two things a panel
          should keep while its body moves. */}
      <header className="ambient-canvas relative shrink-0 border-b border-border px-6 pt-6 pb-5 sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-eyebrow text-gold">Snapi Memory</p>

            <h2
              id="tag-dialog-title"
              className="mt-2.5 font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight font-normal tracking-[-0.01em] text-content"
            >
              {label}
            </h2>

            <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-content-muted">
              Tap anything to add it. A tick means Snapi already has it.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md text-content-subtle",
              "transition-[background-color,color] duration-200 hover:bg-surface-raised hover:text-content",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Search ──────────────────────────────────────────────────────
            A ruled line rather than a boxed field. A bordered input in an editorial
            layout is the one element that looks like it came from a form, and this
            is a page — the rule under the text is the whole affordance, the way a
            magazine sets a caption or a byline. */}
        <div className="relative mt-5 flex items-center gap-2.5 border-b border-border pb-2">
          <Search className="size-4 shrink-0 text-content-subtle" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            aria-label={`Search ${label}`}
            autoComplete="off"
            className={cn(
              "w-full bg-transparent text-[15px] text-content",
              "placeholder:text-content-subtle focus:outline-none",
            )}
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-content-subtle",
                "transition-colors duration-200 hover:bg-surface-raised hover:text-content",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      {/* ── The index ───────────────────────────────────────────────────────
          Numbered, ruled and in columns, which is how the back of a magazine sets a
          list this long: three columns of twelve is read at a glance where one column
          of thirty-seven is scrolled.

          CSS columns rather than a grid, and the difference is the numbering: a grid
          fills across, so 01, 02 and 03 land side by side and the count reads as a
          table. Multicol flows down and then over, which is how a contents page is
          numbered — 01 to 13 down the first column, 14 onward down the second.

          The numbers run over what is *shown*, not over the vocabulary. A filtered
          index numbered 04, 17, 31 is a list telling the reader about its own
          plumbing. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-content-muted">
            Nothing here matches <span className="text-content">{query.trim()}</span>.
          </p>
        ) : (
          <ol className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
            {visible.map((option, index) => {
              const already = taken.has(option.toLowerCase());

              return (
                <li key={option} className="break-inside-avoid">
                  <button
                    type="button"
                    onClick={() => onAdd(option)}
                    // Inert rather than absent, and `aria-disabled` rather than
                    // `disabled`: the line is still worth reading and still worth
                    // reaching by keyboard — it is the record that Snapi has this — so
                    // it keeps its place in the tab order and refuses the press.
                    aria-disabled={already || undefined}
                    aria-label={already ? `${option}, already added` : `Add ${option}`}
                    className={cn(
                      "group flex w-full items-center gap-3 border-t border-border py-3.5 text-left",
                      "transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      already ? "cursor-default" : "hover:border-gold-border",
                    )}
                  >
                    {/* Tabular, so the numerals sit on one axis down each column. */}
                    <span
                      className={cn(
                        "tabular text-[10px] font-semibold tracking-[0.14em]",
                        already ? "text-gold" : "text-content-subtle",
                      )}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[15px] leading-snug font-semibold transition-colors duration-200",
                        already ? "text-content-subtle" : "text-content group-hover:text-gold",
                      )}
                    >
                      {option}
                    </span>

                    {/* The slot is reserved either way, so a line does not shift
                        sideways the moment it is taken. */}
                    <span
                      className={cn(
                        "grid size-[18px] shrink-0 place-items-center rounded-full",
                        already ? "bg-gold-solid text-gold-content" : "opacity-0",
                      )}
                      aria-hidden="true"
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────
          A count and a way out, and no "Add" — every tap has already committed. A
          confirm button here would be a control with nothing left to do, which is
          worse than no control at all. */}
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-border px-6 py-4 sm:px-8">
        <p className="tabular text-[11px] tracking-wide text-content-subtle">
          {selected.length} of {options.length} added
        </p>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className={cn(
            "rounded-md bg-gold-solid px-4 py-2 text-[13px] font-semibold text-gold-content",
            "transition-colors duration-200 hover:bg-gold-solid-hover",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          Done
        </button>
      </footer>
    </dialog>
  );
}
