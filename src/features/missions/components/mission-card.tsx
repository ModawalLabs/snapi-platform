"use client";

import { ArrowRight, Check, Pencil, Trash2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import type { MockMission } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Renaming is capped so a mission stays a label, not a second brief. */
const NAME_MAX = 60;

/**
 * How the rename and delete controls appear — and every way they come back.
 *
 * Hidden at rest so a board of missions is a wall of photographs rather than a wall
 * of photographs with two buttons stamped on each. That is a real gain on a grid whose
 * whole job is recognition.
 *
 * The cost is that a hover-only control does not exist where there is no hover, so it
 * is bought back three ways — the same three the saved-list tile uses:
 *
 *  - `group-hover` — the intended reveal, on a pointer.
 *  - `group-focus-within` — a keyboard user tabbing the grid can see what they have
 *    landed on. Without it the buttons are reachable and invisible, which is worse
 *    than either state alone.
 *  - `(hover: none)` — permanently visible on touch. This is the one that keeps
 *    rename and delete from silently disappearing on a phone.
 *
 * Opacity only, no `pointer-events` guard: reaching these with a pointer means
 * hovering the card, which has already revealed them, so there is no invisible target
 * to hit by accident.
 */
const REVEAL_CONTROLS = cn(
  "opacity-0 transition-opacity duration-300",
  "group-focus-within:opacity-100 group-hover:opacity-100",
  "[@media(hover:none)]:opacity-100",
);

/**
 * One mission, as a portrait photo card.
 *
 * The photograph is the card, not an illustration inside it. On a grid the job is
 * recognition — you find the mission you meant by its picture long before you read
 * its name — and everything the agent knows about it (brief, budget ceiling, last
 * sweep) belongs on the mission's own page.
 *
 * ## Type over photography
 *
 * Text sits on `.media-scrim`, which is tuned dark enough at the bottom that white
 * type clears contrast over an arbitrary image. Those colours are fixed in both
 * themes on purpose: a photograph does not get lighter because the UI did, so
 * anything sitting *on* one must not either. `.on-photo` re-points the gold tokens
 * to their bright variants for the same reason — the light-theme gold is tuned for
 * contrast against paper and disappears into a dark photograph.
 *
 * The controls sit at the top, where the scrim is deliberately clear, so each gets
 * its own dark glass chip rather than relying on whatever happens to be behind it.
 *
 * ## Structure
 *
 * The card is **not** a link. It holds three interactive elements — rename, delete
 * and "Open" — and nesting them inside an anchor is invalid HTML that browsers
 * resolve however they like.
 *
 * Rename happens in place. A dialog would be heavier than the edit deserves, and
 * an in-place input keeps the name legible in its real context while you change it.
 */
export function MissionCard({
  mission,
  onRename,
  onRemove,
}: {
  mission: MockMission;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(mission.name);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Focus on entering edit mode. Done in an effect rather than with `autoFocus`
  // so it only fires on the transition — `autoFocus` would also steal focus if
  // this card ever re-mounts mid-page, e.g. on a paginated grid.
  React.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function startEditing() {
    setDraft(mission.name);
    setEditing(true);
  }

  function commit() {
    const next = draft.trim();
    // An empty name would leave the card unidentifiable, so a blank submit is
    // treated as a cancel rather than silently wiping the label.
    if (next.length > 0 && next !== mission.name) onRename(next);
    setEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setEditing(false);
    }
  }

  return (
    <article className="group relative">
      <MediaFrame
        src={mission.image}
        // Decorative: the mission's name is right there in the card, so describing
        // the photograph would only make a screen reader read the tile twice.
        alt=""
        focus={mission.focus}
        sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
        className={cn(
          "aspect-[3/4] min-h-[19rem] rounded-xl",
          "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-0.5 group-hover:shadow-premium",
        )}
      >
        {/* The scrim is bottom-weighted, so the top of the frame is bare. This
            reinstates just enough shade for the controls without lifting the
            photograph's midtones — and it fades in with them, because a dark band
            across the top of a photograph with nothing sitting on it is just a
            photograph with a dark band across the top. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent",
            editing ? "opacity-100" : REVEAL_CONTROLS,
          )}
          aria-hidden="true"
        />

        <div className="on-photo absolute inset-0 flex flex-col p-4 sm:p-5">
          {/* Revealed on hover — see `REVEAL_CONTROLS`.

              Pinned visible while renaming, and that exception is the important one:
              the pointer leaves the card the moment you reach for the keyboard, and a
              Save button that vanishes mid-rename would look like the edit had been
              cancelled. `group-focus-within` covers the field itself, but not the
              moment focus sits in the input and the mouse is elsewhere. */}
          <header
            className={cn(
              "flex shrink-0 items-center justify-end gap-1.5",
              editing ? "opacity-100" : REVEAL_CONTROLS,
            )}
          >
            {editing ? (
              <IconButton label="Save name" onClick={commit} icon={Check} tone="confirm" />
            ) : (
              <IconButton
                label={`Rename ${mission.name}`}
                onClick={startEditing}
                icon={Pencil}
                tone="neutral"
              />
            )}
            <IconButton
              label={`Delete ${mission.name}`}
              onClick={onRemove}
              icon={Trash2}
              tone="danger"
            />
          </header>

          {/* `justify-end` — the name hangs off the bottom of the frame, where the
              scrim is darkest and the type is guaranteed legible. */}
          <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden pt-4">
            {editing ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  commit();
                }}
              >
                {/* Committing on blur as well as on submit: users click away far
                    more often than they press Enter, and losing a typed name to a
                    stray click is the kind of small betrayal people remember. */}
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={commit}
                  maxLength={NAME_MAX}
                  aria-label="Mission name"
                  className={cn(
                    "w-full rounded-md border border-white/30 bg-black/60 px-2 py-1 font-display backdrop-blur-md",
                    "text-[1.375rem] leading-[1.15] font-normal text-white",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
                  )}
                />
              </form>
            ) : (
              <h2 className="line-clamp-3 font-display text-[1.5rem] leading-[1.15] font-normal tracking-[-0.005em] text-white">
                {mission.name}
              </h2>
            )}
          </div>

          <div className="mt-4 flex shrink-0 items-end justify-between gap-3 border-t border-white/15 pt-3.5">
            <dl>
              <dt className="text-eyebrow text-white/55">Collections</dt>
              <dd className="tabular mt-1 text-sm font-semibold text-white">
                {mission.collections}
              </dd>
            </dl>

            <Link
              href={routes.mission(mission.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-sm text-[13px] font-semibold whitespace-nowrap text-gold",
                "transition-colors duration-300 hover:text-white",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70",
              )}
            >
              Open
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </MediaFrame>
    </article>
  );
}

/**
 * Hover fills are fixed values, not theme tokens.
 *
 * `--color-danger` flips to a pale red in dark mode, which over a photograph is
 * simply the wrong colour — the photo did not change. These sit on an image, so
 * they are pinned like the type is.
 */
const TONES = {
  neutral: "hover:bg-black/65 hover:text-white",
  confirm: "hover:bg-[oklch(80%_0.13_85)] hover:text-[oklch(20%_0.025_70)]",
  danger: "hover:bg-[oklch(53%_0.2_25)] hover:text-white",
} as const;

function IconButton({
  label,
  onClick,
  icon: Icon,
  tone,
}: {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  tone: keyof typeof TONES;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // `onMouseDown` preventDefault keeps a click on Save from firing the
      // input's blur first, which would commit and unmount this button
      // mid-gesture so the click never lands.
      onMouseDown={(event) => event.preventDefault()}
      className={cn(
        "grid size-8 place-items-center rounded-md text-white/85 ring-1 ring-white/15 ring-inset",
        "bg-black/35 backdrop-blur-md",
        "transition-[background-color,color] duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
        TONES[tone],
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
