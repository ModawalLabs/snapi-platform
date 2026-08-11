"use client";

import { Check, Plus, X } from "lucide-react";
import * as React from "react";

import { useFlavour } from "@/components/providers/flavour-provider";
import { Tooltip } from "@/components/ui/tooltip";
import { Avatar } from "@/components/ui/avatar";
import { FLAVOUR_COPY, type Flavour } from "@/config/flavour";
import { mockMemory, mockUser, type MockUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * The account block, and the profile dialog it opens.
 *
 * Trigger and dialog live in one component because the open state belongs to
 * neither on its own — lifting it into `AppSidebar` would put a piece of the
 * dialog's behaviour three files from the dialog.
 *
 * ## Why a native `<dialog>`
 *
 * `showModal()` gives the focus trap, the Escape handler, the inert background
 * and the `::backdrop` element for free, all implemented by the browser and all
 * of them things hand-rolled modals get subtly wrong. The alternative — a
 * positioned div plus a keydown listener plus a focus-restoring effect — is more
 * code that behaves worse.
 *
 * The `<dialog>` is only ever opened imperatively, which is the one awkward part
 * of the element: React has no `open` prop that maps to `showModal()`, and the
 * plain `open` attribute renders a *non-modal* dialog with none of the above. So
 * state drives an effect that calls the imperative API, and the element's own
 * `close` event syncs state back when the browser closes it.
 */
export function ProfileAccount({ collapsed }: { collapsed: boolean }) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);
  const { flavour } = useFlavour();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Guarded both ways: calling `showModal()` on an already-open dialog throws,
    // and `close()` on a closed one fires a spurious `close` event.
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Profile — ${mockUser.name}`}
          className={cn(
            "group relative grid h-10 w-10 place-items-center rounded-md transition-colors",
            "hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <Avatar name={mockUser.name} src={mockUser.avatarUrl} size="sm" />
          <Tooltip label={mockUser.name} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "group flex h-14 w-full items-center gap-3 rounded-md px-2 text-left transition-colors",
            "hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <Avatar name={mockUser.name} src={mockUser.avatarUrl} size="lg" />

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-content">
              {/* `truncate` belongs on the text itself, not the flex row: on the
                  row it does nothing to children, and the tier badge gets squeezed
                  by a long name instead of the name giving way. */}
              <span className="min-w-0 truncate">{mockUser.name}</span>
              <PlanBadge flavour={flavour} />
            </span>
            <span className="block truncate text-xs text-content-subtle">{mockUser.email}</span>
          </span>
        </button>
      )}

      <ProfileDialog ref={dialogRef} user={mockUser} onClose={() => setOpen(false)} />
    </>
  );
}

/* ── Flavours ────────────────────────────────────────────────────────────────
 *
 * A flavour is a whole register, not a tier label: Signature is gold, All Rounder
 * is azure, and picking one repaints the entire app. Because the two identities
 * are the *point* of this control, each card carries its own accent whether or
 * not it is selected — showing both in neutral grey until chosen would hide the
 * only thing the choice is about.
 *
 * ## Signature's card is written in literals, and it has to be
 *
 * These cards are swatches, and a swatch must show its own colour regardless of
 * what is selected. The moment All Rounder is active, every `--color-gold*` token
 * *is* azure — so `text-gold` here would render the Signature card blue and the
 * control would offer a choice between two identical blue cards. The literals are
 * the gold tokens' own values, duplicated per theme, deliberately immune to the
 * switch they are used to make. Same rule as the photo placeholders: a thing that
 * depicts a colour cannot be painted in the variable it depicts.
 *
 * All Rounder needs no such treatment — `--color-azure*` is never repointed.
 */
const FLAVOUR_CARDS = [
  {
    id: "signature",
    name: "Signature",
    line: "Curated luxury, tailored to you.",
    mark: "✦",
    selected: cn(
      "border-[oklch(87%_0.055_82)] bg-[oklch(96.2%_0.028_85)]",
      "dark:border-[oklch(35%_0.06_82)] dark:bg-[oklch(24%_0.042_80)]",
      "shadow-[0_0_0_1px_oklch(87%_0.055_82),0_2px_10px_-3px_oklch(80%_0.12_85/0.25)]",
      "dark:shadow-[0_0_0_1px_oklch(35%_0.06_82),0_2px_10px_-3px_oklch(80%_0.13_85/0.25)]",
    ),
    idle: cn(
      "border-[oklch(87%_0.055_82/0.45)] bg-[oklch(96.2%_0.028_85/0.4)]",
      "dark:border-[oklch(35%_0.06_82/0.45)] dark:bg-[oklch(24%_0.042_80/0.4)]",
    ),
    accent: "text-[oklch(54%_0.1_72)] dark:text-[oklch(82%_0.125_86)]",
    check: cn(
      "bg-[oklch(80%_0.12_85)] text-[oklch(21%_0.025_70)]",
      "dark:bg-[oklch(80%_0.13_85)] dark:text-[oklch(18%_0.025_70)]",
    ),
  },
  {
    id: "all-rounder",
    name: "All Rounder",
    line: "Everything worth having, at every price.",
    mark: "◆",
    selected: cn(
      "border-azure-border bg-azure-subtle",
      "shadow-[0_0_0_1px_var(--color-azure-border),0_2px_10px_-3px_oklch(52%_0.18_255/0.25)]",
    ),
    idle: "border-azure-border/45 bg-azure-subtle/40",
    accent: "text-azure",
    check: "bg-azure-solid text-azure-content",
  },
] as const satisfies ReadonlyArray<{ id: Flavour; [key: string]: string }>;

function ProfileDialog({
  ref,
  user,
  onClose,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
  user: MockUser;
  onClose: () => void;
}) {
  const { flavour, setFlavour } = useFlavour();

  // Derived, not authored. A hand-written total is wrong the first time a section
  // gains a tag, and it is the kind of wrong nobody notices for a release.
  const rememberedCount = mockMemory.reduce((total, section) => total + section.tags.length, 0);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Clicking the backdrop closes. The check is on the target being the
      // dialog itself: the backdrop is a pseudo-element and cannot receive its own
      // listener, but clicks that land on it report the dialog as the target,
      // while clicks inside the card report a descendant.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="profile-dialog-title"
      className={cn(
        // 42rem, up from 32. The memory list reads as a settings table — label,
        // tags, Add — and the width is set by what the middle column needs: at
        // anything narrower the tag rows wrap to two lines and the table goes
        // ragged, which is what made the panel feel cramped rather than the
        // spacing did. Widen the copy before widening this again.
        "m-auto w-[min(42rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-content shadow-premium-lg",
        // The card is taller than a short laptop window once Memory is filled in,
        // so it caps and scrolls internally. `dvh` rather than `vh`: on iOS the
        // latter measures the viewport as if the browser chrome were retracted,
        // which puts the bottom of the dialog under the address bar.
        "max-h-[calc(100dvh-2rem)] overflow-hidden",
        "backdrop:bg-black/55 backdrop:backdrop-blur-sm",
        "open:animate-in open:duration-200 open:zoom-in-95 open:fade-in",
      )}
    >
      {/* Padding lives on the sections rather than on the dialog, so the backdrop
          click test above is not defeated by the dialog's own padding counting as
          "inside the card". This is also the scroll container. */}
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        {/* ── Header ──────────────────────────────────────────────────────────
            A banded header rather than a row of text at the top of a form. The
            same ambient wash every page header carries, so the dialog opens in the
            app's own register instead of looking like a system sheet. */}
        <header className="ambient-canvas relative border-b border-border px-6 py-6 sm:px-7">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatarUrl} size="xl" />

            <div className="min-w-0 flex-1">
              {/* The UI sans, not the display serif. The serif is reserved for
                  editorial and page titles; a signed-in user's own name is a piece
                  of interface, and setting it in Oranienbaum reads as a headline
                  about the person rather than a label. */}
              <h2
                id="profile-dialog-title"
                className="truncate text-lg leading-tight font-semibold"
              >
                {user.name}
              </h2>
              <p className="mt-1 truncate text-[13px] text-content-subtle">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className={cn(
                "-mt-2 -mr-1 grid size-8 shrink-0 place-items-center self-start rounded-md text-content-subtle",
                "transition-[background-color,color] duration-200 hover:bg-surface-raised hover:text-content",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ── Flavour ─────────────────────────────────────────────────────── */}
        <section className="px-6 py-6 sm:px-7">
          <p className="text-eyebrow text-content-subtle">Your Snapi</p>

          {/* `radiogroup` rather than a list of buttons: these are one choice with
              two mutually exclusive answers, and that is what the role tells a
              screen reader before it reads either option. */}
          <div
            role="radiogroup"
            aria-label="Snapi flavour"
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            {FLAVOUR_CARDS.map((card) => {
              const active = card.id === flavour;

              return (
                <button
                  key={card.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFlavour(card.id)}
                  className={cn(
                    "flex h-full flex-col rounded-xl border p-4 text-left",
                    "transition-[background-color,border-color,box-shadow,transform] duration-300",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active ? card.selected : cn(card.idle, "hover:-translate-y-0.5"),
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("text-base leading-none", card.accent)} aria-hidden="true">
                      {card.mark}
                    </span>
                    <span className="text-eyebrow flex-1 truncate text-content">{card.name}</span>

                    {/* The tick, not colour alone. Two cards in two different
                        accents look equally "on" at a glance — the mark is what
                        says which one you actually have. The slot is reserved
                        either way so selecting a card does not shift its title. */}
                    <span
                      className={cn(
                        "grid size-[18px] shrink-0 place-items-center rounded-full",
                        active ? card.check : "opacity-0",
                      )}
                      aria-hidden="true"
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  </span>

                  <span className="mt-2.5 block text-[13px] leading-relaxed text-content-muted">
                    {card.line}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Memory ──────────────────────────────────────────────────────── */}
        <section className="border-t border-border px-6 py-6 sm:px-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            {/* UI sans, like the name above it. The display serif is for editorial
                and page titles; inside a settings card it reads as decoration. */}
            <h3 className="text-base leading-tight font-semibold">Snapi Memory</h3>
            <p className="tabular text-[11px] tracking-wide text-content-subtle">
              {rememberedCount} remembered
            </p>
          </div>

          <p className="mt-2.5 max-w-[52ch] text-[13px] leading-relaxed text-content-muted">
            What Snapi has learned about you — your sizes, the houses you keep coming back to, and
            how you like to be told about a price drop.
          </p>

          {/* A settings table, not five stacked stubs. Label in a fixed column and
              tags in the next, with a hairline between rows: five headings each
              followed by a lone button read as an unfinished form no matter how
              much space sat between them. The label column collapses below `sm`,
              where 10rem of it would leave the tags nowhere to go. */}
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {mockMemory.map((section) => (
              <li
                key={section.id}
                className="grid gap-2 py-4 sm:grid-cols-[10.5rem_1fr_auto] sm:items-start sm:gap-5"
              >
                <p className="text-eyebrow pt-1.5 text-content-subtle">{section.label}</p>

                {/* `flex-wrap` because tags arrive in unknown numbers and lengths,
                    and the row that has to absorb them should be the one that
                    shipped — not a rewrite later. */}
                <div className="flex flex-wrap items-center gap-2">
                  {section.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-[12px] whitespace-nowrap text-content"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Its own column rather than the last pill in the wrap. Inside the
                    flex row it lands wherever the tags happen to end — inline on a
                    short row, alone on a new line on a full one — so the control
                    moved from row to row and the list stopped reading as a table.
                    Pinned right, it is in the same place in every row. */}
                <button
                  type="button"
                  // Naming the section is not optional here: five identical
                  // "Add" buttons on one screen are five identical
                  // announcements, and nothing tells a screen-reader user which
                  // list they are adding to.
                  aria-label={`Add a tag to ${section.label}`}
                  // Inert for now — same call as the flavour switcher. Left as a
                  // real control rather than a disabled one, since the action is
                  // not unavailable to this user, it simply is not built.
                  className={cn(
                    "flex w-fit items-center gap-1 rounded-full border border-dashed border-gold-border px-2.5 py-1",
                    // Dashed and in the accent, so it is legible as the one
                    // control in a row of read-only pills. A solid border here
                    // and it becomes another tag that happens to say "Add".
                    "text-[12px] text-gold transition-colors duration-200 hover:bg-gold-subtle",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  )}
                >
                  Add
                  <Plus className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </dialog>
  );
}

/**
 * The active edition, on the sidebar row.
 *
 * Plain `gold` tokens with no per-flavour branch: those tokens *are* the active
 * accent, so the badge is azure in All Rounder and gold in Signature without a
 * conditional. Branching here would have re-implemented the flavour switch a
 * second time, in a component whose only job is to display its result.
 */
function PlanBadge({ flavour }: { flavour: Flavour }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-1.5 py-px text-[10px] font-semibold tracking-wide",
        "border-gold-border bg-gold-subtle text-gold",
      )}
    >
      {FLAVOUR_COPY[flavour].label.toUpperCase()}
    </span>
  );
}
