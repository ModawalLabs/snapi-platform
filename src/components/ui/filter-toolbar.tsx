"use client";

import { MoreHorizontal, Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Search and category filter for a collection page.
 *
 * ## Both are inert, and that is visible rather than hidden
 *
 * Nothing here filters anything yet. The field accepts text and the grid does not
 * change; the pills are real buttons that do nothing. That is the same call the
 * composer's category pills and the profile dialog's "Add tag" already make, for the
 * same reason: the action is not unavailable to this user, it simply is not built.
 *
 * What it explicitly does *not* do is move the selected pill on click. A highlight
 * that travels while the grid stays put reads as a bug — the user concludes the
 * filter is broken. A control that visibly does nothing reads as unfinished, which
 * is the truth. So "All" is rendered selected and stays selected, and the day the
 * filtering lands the state moves in with it.
 *
 * The clear button is the one thing that genuinely works, because emptying a text
 * field is not search logic.
 *
 * ## Four pills, then a menu
 *
 * On a saved list the set of things you *could* filter by is itself useful — it tells
 * you what kind of collection you have built — so the categories are pills rather than
 * a dropdown that hides all of them behind a click. But the row is now pinned to the
 * top of the window while the grid scrolls under it, and a bar that grows a second line
 * of pills spends a permanent band of the screen on chrome.
 *
 * So the first four are pills and anything past that goes behind a `…` trigger. Four
 * because that is what fits on one line at phone width with the trigger beside it, and
 * the same rule then holds at every width rather than the row rearranging itself twice
 * on the way up. Under five categories the trigger is not rendered at all.
 *
 * Everything in the menu is still a `role="radio"` inside the one `radiogroup` — the
 * popup is a descendant of it, so moving four options out of sight does not split the
 * choice into two groups as far as a screen reader is concerned.
 *
 * ## The labels are authored, not derived
 *
 * `MockSavedItem` carries no category, so these are a fixed list chosen to describe
 * what is actually in the fixture. That is a real caveat: the labels and the grid can
 * drift apart the moment either changes, and nothing here would notice. When the
 * field arrives, derive this from the data and count it — the same way The Edit's
 * contents index does — and the drift becomes impossible rather than merely unlikely.
 */
const CATEGORIES = ["All", "Outerwear", "Bags", "Shoes", "Jewellery", "Accessories"] as const;

/**
 * How many stay on the row. Everything past this moves into the `…` menu.
 *
 * Counting "All" is deliberate: it is one of the choices, not a label for the set, so
 * excluding it would make the row five pills wide and put the trigger's own width past
 * what a 430px screen has.
 */
const VISIBLE_LIMIT = 4;

export function FilterToolbar({ subject }: { subject: string }) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const visible = CATEGORIES.slice(0, VISIBLE_LIMIT);
  const overflow = CATEGORIES.slice(VISIBLE_LIMIT);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
      {/* ── Search ──────────────────────────────────────────────────────────
          A rounded field rather than a squared one, so it belongs to the pill row
          beside it rather than to the cards below. `w-full` until `sm`, where it
          settles at a measure long enough for a brand and a piece name. */}
      <div
        className={cn(
          "group relative w-full sm:w-[19rem]",
          // The border lifts on focus from the wrapper, not the input, so the icon
          // and the clear button are inside the highlighted shape rather than
          // sitting next to a ring drawn around the text box alone.
          "rounded-full border border-border bg-surface",
          "transition-[background-color,border-color,box-shadow] duration-300",
          "focus-within:border-gold-border focus-within:shadow-premium-sm",
        )}
      >
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-content-subtle"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search your ${subject}`}
          // A label, not just a placeholder: a placeholder disappears the moment
          // anyone types, taking the field's only description with it.
          aria-label={`Search your ${subject}`}
          autoComplete="off"
          className={cn(
            "h-10 w-full rounded-full bg-transparent pr-10 pl-10",
            "text-[13px] text-content placeholder:text-content-subtle",
            // The ring lives on the wrapper — see above — and the browser's own
            // outline here would draw a second shape inside the first.
            "focus:outline-none",
            // Safari paints its own clear button on `type=search`, which would sit
            // beside ours.
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />

        {/* Mounted only when there is something to clear. Unlike the pills this is
            real behaviour: emptying a field is not search logic. Focus returns to
            the input, since a control that vanishes under the cursor otherwise
            leaves focus on the document body. */}
        {query.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className={cn(
              "absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-full",
              "text-content-subtle transition-colors duration-200 hover:bg-surface-raised hover:text-content",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* ── Categories ──────────────────────────────────────────────────────
          `radiogroup`, not a list of buttons: this is one choice with six mutually
          exclusive answers, and the role is what tells a screen reader that before
          it reads any of them.

          Four pills and a `…` menu, so the row holds one line at every width — see the
          note on the file. It used to scroll sideways below `sm` to avoid wrapping;
          that is gone, and it had to be: an `overflow-x` container clips its children
          on *both* axes, so the menu panel would have been cut off at the row's own
          bottom edge. */}
      <div role="radiogroup" aria-label="Filter by category" className="flex items-center gap-2">
        {visible.map((label) => {
          const selected = label === "All";

          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap",
                "transition-[background-color,border-color,color] duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? // Tinted rather than solid. A filled accent pill would be the
                    // loudest thing on a page whose subject is photography, and
                    // "All" is the resting state, not an action taken.
                    "border-gold-border bg-gold-subtle font-medium text-content"
                  : "border-border text-content-muted hover:border-border-strong hover:text-content",
              )}
            >
              {label}
            </button>
          );
        })}

        {/* Rendered only when something is actually hidden. A `…` that opens an empty
            panel is worse than four pills and no trigger. */}
        {overflow.length > 0 ? <OverflowMenu labels={overflow} /> : null}
      </div>
    </div>
  );
}

/**
 * The `…` pill and the panel it opens.
 *
 * Its own component because it is the only stateful thing in the toolbar — and keeping
 * `open` down here means typing in the search field does not re-render the menu, and
 * opening the menu does not re-render the field.
 *
 * ## Choosing one of these does nothing, on purpose
 *
 * The panel closes and the row does not change, because the pills do not filter yet —
 * the same call the visible pills already make, for the reason given at the top of the
 * file: a highlight that moves while the grid stays put reads as a bug. What the menu
 * demonstrates is the *disclosure*, which is the part that has to be right before there
 * is anything to disclose.
 *
 * ## The parts that are real
 *
 * Escape closes and returns focus to the trigger, a pointer press outside closes, and
 * the options are radios of the same group as the pills. Those are not filter logic,
 * they are what makes a popup a popup, and a popup you cannot dismiss by keyboard is
 * a trap rather than an unfinished feature.
 */
function OverflowMenu({ labels }: { labels: readonly string[] }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    // `pointerdown`, not `click`: a press that starts outside should dismiss before it
    // completes, so a press that lands on a tile does not both close the menu and open
    // the piece. `mousedown` alone would miss touch.
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Focus goes back to what opened the panel. Without this it lands on <body> and
      // the next Tab starts the page over from the top.
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    // `self-stretch` belongs here, on the flex child, not on the button inside it:
    // stretching an item that is not itself a flex child does nothing, which is how the
    // trigger ended up an 18px circle on the first attempt.
    <div ref={wrapRef} className="relative self-stretch">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        // The count is in the label because the glyph cannot carry it: "…" read aloud
        // is nothing at all.
        aria-label={`More categories (${labels.length})`}
        className={cn(
          // Height from the row — which is to say from a pill, via the stretched
          // wrapper — and width from the aspect ratio. A hardcoded 30px was 3.5px
          // shorter than the pills beside it, which is exactly the kind of difference
          // you cannot name but can see.
          "grid aspect-square h-full place-items-center rounded-full border",
          "transition-[background-color,border-color,color] duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          // Held in the hover treatment while the panel is open, so the trigger reads
          // as the thing the panel belongs to rather than as a pill you left behind.
          open
            ? "border-border-strong bg-surface-raised text-content"
            : "border-border text-content-muted hover:border-border-strong hover:text-content",
        )}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>

      {open ? (
        // `right-0`: the trigger is the last thing on a right-aligned row, so a panel
        // growing leftwards stays on screen where one growing rightwards would not.
        //
        // Opaque rather than blurred glass. Tiles pass directly beneath this row, and a
        // translucent panel over a photograph is a menu you have to squint at.
        <div
          className={cn(
            "absolute top-full right-0 z-30 mt-2 min-w-[11rem] p-1.5",
            "rounded-xl border border-border bg-surface-raised shadow-premium-lg",
            "animate-in duration-150 fade-in slide-in-from-top-1",
          )}
        >
          {labels.map((label) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={false}
              onClick={() => setOpen(false)}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-[13px] whitespace-nowrap",
                "text-content-muted transition-colors duration-200",
                "hover:bg-gold-subtle hover:text-content",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
