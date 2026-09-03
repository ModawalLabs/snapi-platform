"use client";

import { Check, LogOut, Plus, X } from "lucide-react";
import * as React from "react";

import { useFlavour } from "@/components/providers/flavour-provider";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { FLAVOUR_COPY, type Flavour } from "@/config/flavour";
import { TagDialog } from "@/features/profile/components/tag-dialog";
import { mockBrands, mockMemory, mockUser, PRODUCT_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * The account page: edition, memory, and the way out.
 *
 * ## It was a dialog, and a page is the better answer
 *
 * Everything here used to live in a modal over the sidebar. Two things went wrong with
 * that. Memory grows — a tag list with add and forget is a settings table, and a table
 * in a 672px card capped at 768px tall is a table you scroll in a window inside a
 * window. And the account row was the one row in the menu that did not navigate, so the
 * sidebar had two kinds of rows that looked identical.
 *
 * As a page in the `(app)` group it opens to the right of the sidebar with the menu
 * still there, which is what the reader expects of a menu row: the chrome stays, the
 * panel changes.
 *
 * ## Identity, then two blocks
 *
 *  1. **Identity.** Face, address, and Log out — the control belongs with the account
 *     it ends rather than at the foot of the page, where it was a thing you scrolled
 *     to find. No heading and no card around it: one button is not a section.
 *  2. **Edition.** The one setting that repaints the entire app.
 *  3. **Memory.** The reason anyone comes here twice — what Snapi thinks it knows, and
 *     the ability to correct it.
 */
export function Profile() {
  const { flavour, setFlavour } = useFlavour();

  /**
   * Memory, as state rather than the fixture read directly.
   *
   * Adding and forgetting have to land somewhere and there is no backend, so they land
   * here. The fixture is never mutated: every change maps to new section objects, so
   * `mockMemory` stays what it says it is — a starting point — and a navigation away
   * and back does not find it quietly edited.
   *
   * Session-lived, like everything else without an endpoint behind it. A tag added here
   * is gone on reload, and that is the honest state of the feature rather than a bug.
   */
  const [sections, setSections] = React.useState(mockMemory);

  /**
   * Which section's vocabulary is open, as a modal.
   *
   * The id rather than the section, so the dialog always reads the *current* tags: it
   * commits on every tap and marks what is taken, which means it has to see its own
   * effects. Holding the section object would freeze it at the moment it opened.
   */
  const [browsingId, setBrowsingId] = React.useState<string | null>(null);

  /** Which section is taking a new tag by hand, and what has been typed into it. */
  const [composingId, setComposingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Set for the length of one pointer gesture, when a press on Add closed the field
   * that Add had opened.
   *
   * Without it the toggle cannot close. A press runs `mousedown` and then `click`, and
   * the `mousedown` handler is what has to do the closing — by `click` the field would
   * already have blurred and committed. That leaves `click` looking at a section with
   * no composer open and dutifully opening one, so the field shuts and reopens inside a
   * single press. The ref is how the second half of the gesture knows what the first
   * half did.
   */
  const closedByPress = React.useRef(false);

  // Focus on opening the field, and on the transition only — never on mount, which
  // would put the cursor in a settings row the moment the page appeared.
  React.useEffect(() => {
    if (composingId) inputRef.current?.focus();
  }, [composingId]);

  /**
   * Add the typed tag to the head of its section.
   *
   * The head, not the tail, and that is the whole behaviour: what you just told Snapi
   * is the most specific thing it knows, and a new pill appended after four others is a
   * pill you have to go looking for to confirm it landed.
   *
   * Silently ignores a blank, and ignores a duplicate rather than refusing it out loud.
   * "Quiet luxury" typed twice is a user who wants it remembered, not an error — and an
   * error message for a tag that is already there would be the app arguing with someone
   * who agrees with it.
   *
   * The field stays open with the value cleared, because a section takes *types* plural
   * and the second one should not cost another click.
   */
  function addTag(sectionId: string) {
    const value = draft.trim();
    setDraft("");
    if (value.length === 0) return;

    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;
        const exists = section.tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
        return exists ? section : { ...section, tags: [value, ...section.tags] };
      }),
    );
  }

  /**
   * Add a value chosen from a section's vocabulary.
   *
   * Separate from `addTag` because there is nothing to parse: the value came from a
   * fixed list, so there is no trimming, no blank to guard and no case to normalise.
   * The duplicate check stays — the picker filters taken options out of its list, and
   * this is the guarantee rather than the display of one.
   */
  function addChosenTag(sectionId: string, value: string) {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;
        const exists = section.tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
        return exists ? section : { ...section, tags: [value, ...section.tags] };
      }),
    );
  }

  /**
   * Drop a tag from its section.
   *
   * No confirmation and no undo window, and both are deliberate. This is not a delete —
   * nothing is destroyed and nothing is lost downstream. It is Snapi forgetting a
   * preference it inferred, which is a thing the user is *entitled* to be casual about,
   * and a dialog in front of it would make correcting the assistant feel like an
   * administrative act. Retyping costs one click and the field is right there.
   */
  function forgetTag(sectionId: string, tag: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, tags: section.tags.filter((existing) => existing !== tag) }
          : section,
      ),
    );
  }

  function closeComposer() {
    setComposingId(null);
    setDraft("");
  }

  // Derived, not authored. A hand-written total is wrong the first time a section gains
  // a tag, and it is the kind of wrong nobody notices for a release.
  const rememberedCount = sections.reduce((total, section) => total + section.tags.length, 0);

  // Resolved at render rather than stored, so the dialog sees every tag it adds.
  const browsing = browsingId ? sections.find((section) => section.id === browsingId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        meta={FLAVOUR_COPY[flavour].label}
        title={mockUser.name}
        description="Your edition, and what Snapi has learned about you."
      />

      <div className="container-page py-10 sm:py-12">
        {/* ── Identity ──────────────────────────────────────────────────────
            The face, the address, and the way out — one block, in that order. Not the
            name: the page is titled with it, and a row restating the heading two
            lines under the heading is the page introducing itself twice.

            Log out sits here rather than at the foot of the page. It was last, on the
            argument that an irreversible control should not be passed on the way to
            anything else — but at the bottom of a settings table it is also the thing
            you scroll to *find*, and what it acts on is the account named directly
            above it. Beside the address it is signed out *as*, it needs no heading and
            no explanation.

            Outlined rather than filled, and the danger tone arrives on hover, when the
            pointer has already committed to the shape — a permanently red button in a
            settings page is an alarm going off about a thing nobody has done. */}
        <div className="flex items-center gap-4 border-b border-border pb-8">
          <Avatar name={mockUser.name} src={mockUser.avatarUrl} size="xl" />

          <div className="min-w-0">
            <p className="truncate text-[13px] text-content-subtle">{mockUser.email}</p>

            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5",
                "text-[12px] font-semibold text-content-muted",
                "transition-[background-color,border-color,color] duration-200",
                "hover:border-danger hover:bg-danger-subtle hover:text-danger",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>

        {/* ── Edition ───────────────────────────────────────────────────────── */}
        <section className="pt-8">
          <p className="text-eyebrow text-content-subtle">Your Snapi</p>

          {/* `radiogroup` rather than a list of buttons: these are one choice with two
              mutually exclusive answers, and that is what the role tells a screen
              reader before it reads either option. */}
          <div
            role="radiogroup"
            aria-label="Snapi edition"
            className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2"
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
                    "transition-[background-color,border-color,box-shadow,translate] duration-300",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active ? card.selected : cn(card.idle, "hover:-translate-y-0.5"),
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("text-base leading-none", card.accent)} aria-hidden="true">
                      {card.mark}
                    </span>
                    <span className="text-eyebrow flex-1 truncate text-content">{card.name}</span>

                    {/* The tick, not colour alone. Two cards in two different accents
                        look equally "on" at a glance — the mark is what says which one
                        you actually have. The slot is reserved either way, so selecting
                        a card does not shift its title. */}
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

        {/* ── Memory ────────────────────────────────────────────────────────── */}
        <section className="pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base leading-tight font-semibold">Snapi Memory</h2>
            <p className="tabular text-[11px] tracking-wide text-content-subtle">
              {rememberedCount} remembered
            </p>
          </div>

          <p className="mt-2.5 max-w-[52ch] text-[13px] leading-relaxed text-content-muted">
            What Snapi has learned about you — your sizes, the houses you keep coming back to, and
            how you like to be told about a price drop.
          </p>

          {/* A settings table, not five stacked stubs. Label in a fixed column and tags
              in the next, and the hairlines between them are what made it a table.
              The columns are gone: the label now sits on its own line with the tags
              under it, which is the shape the content actually has — a heading and the
              things filed under it. Side by side, a section with six pills pushed its
              own label to the top of a three-line cell and the eye had to travel back
              up and left to find out what it was reading.

              The control leads the tag row rather than sitting on the heading's line.
              It was pinned right of the label, on the argument that it must be in the
              same place in every row — which the head of the row also gives it, and the
              head has something the heading line does not: it is where the tag lands. A
              new pill is added at the front, so the button that adds it, the field you
              type into and the result all occupy the same spot. */}
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {sections.map((section) => {
              const vocabulary = VOCABULARIES[section.id];

              return (
                <li key={section.id} className="py-5">
                  <p className="text-eyebrow text-content-subtle">{section.label}</p>

                  {/* `flex-wrap` because tags arrive in unknown numbers and lengths, and
                    the row that has to absorb them should be the one that shipped — not
                    a rewrite later. */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* Two ways to add, and which one a section gets is a fact about its
                        vocabulary rather than a preference. A closed set gets the
                        searchable list; an open one keeps the text field. See
                        `VOCABULARIES`. */}
                    {vocabulary ? (
                      <button
                        type="button"
                        onClick={() => setBrowsingId(section.id)}
                        aria-haspopup="dialog"
                        aria-label={`Add a tag to ${section.label}`}
                        className={cn(
                          "flex w-fit shrink-0 items-center gap-1 rounded-full border border-dashed border-gold-border px-2.5 py-1",
                          "text-[12px] text-gold transition-colors duration-200 hover:bg-gold-subtle",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        )}
                      >
                        Add
                        <Plus className="size-3" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        // Naming the section is not optional here: five identical "Add"
                        // buttons on one screen are five identical announcements, and
                        // nothing tells a screen-reader user which list they are adding
                        // to.
                        aria-label={`Add a tag to ${section.label}`}
                        aria-expanded={composingId === section.id}
                        onMouseDown={(event) => {
                          if (composingId !== section.id) return;
                          // `preventDefault` keeps focus where it is, so the field's own
                          // blur does not fight this for control of the same state.
                          event.preventDefault();
                          closedByPress.current = true;
                          closeComposer();
                        }}
                        onClick={() => {
                          if (closedByPress.current) {
                            closedByPress.current = false;
                            return;
                          }
                          // Reached by keyboard, where there is no `mousedown` to have
                          // done the closing already.
                          if (composingId === section.id) {
                            closeComposer();
                            return;
                          }
                          setDraft("");
                          setComposingId(section.id);
                        }}
                        className={cn(
                          "flex w-fit shrink-0 items-center gap-1 rounded-full border border-dashed border-gold-border px-2.5 py-1",
                          // Dashed and in the accent, so it is legible as the one control
                          // in a row of read-only pills. A solid border here and it
                          // becomes another tag that happens to say "Add".
                          "text-[12px] text-gold transition-colors duration-200 hover:bg-gold-subtle",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        )}
                      >
                        Add
                        <Plus className="size-3" aria-hidden="true" />
                      </button>
                    )}

                    {/* The field sits at the head of the row, where the tag it is about to
                      make will appear. Putting it at the end — beside the Add button
                      that opened it — would have the pill jump to the other side of the
                      row on submit, which reads as the wrong thing happening even
                      though it is the right one. */}
                    {composingId === section.id ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          addTag(section.id);
                        }}
                      >
                        <input
                          ref={inputRef}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Escape") return;
                            event.preventDefault();
                            closeComposer();
                          }}
                          // Committing on blur as well as on submit: people click away far
                          // more often than they press Enter, and losing a typed tag to a
                          // stray click is the kind of small betrayal people remember. The
                          // field closes with it, because a blurred field left open is a
                          // control with no cursor in it.
                          onBlur={() => {
                            addTag(section.id);
                            setComposingId(null);
                          }}
                          // Two or three words, like the pills beside it. The cap is what
                          // stops a sentence being typed into a row of labels.
                          maxLength={24}
                          placeholder="Add a type…"
                          aria-label={`New tag for ${section.label}`}
                          className={cn(
                            "w-[9.5rem] rounded-full border border-gold-border bg-surface px-2.5 py-1",
                            "text-[12px] text-content placeholder:text-content-subtle",
                            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                          )}
                        />
                      </form>
                    ) : null}

                    {section.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "group/tag flex items-center gap-1 rounded-full border border-border bg-surface-raised py-1 pr-1 pl-2.5",
                          "text-[12px] whitespace-nowrap text-content",
                          "transition-[border-color] duration-200 hover:border-border-strong",
                        )}
                      >
                        {tag}

                        {/* ── Forget this ──────────────────────────────────────
                          A button inside a `<span>`, which is legal — the pill is not
                          itself interactive, so nothing is nested in anything.

                          The space is *reserved* rather than made on hover. These pills
                          wrap, and a control that appears on hover changes the pill's
                          width, which reflows the row and can move the pill out from
                          under the cursor mid-reach. Opacity costs nothing in layout.

                          Revealed the usual three ways — pointer, focus within the
                          pill, and permanently on touch, where there is no hover to
                          give and forgetting a tag would otherwise be impossible. */}
                        <button
                          type="button"
                          onClick={() => forgetTag(section.id, tag)}
                          aria-label={`Forget ${tag}, from ${section.label}`}
                          title="Forget this"
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-full",
                            "text-content-subtle opacity-0 transition-[background-color,color,opacity] duration-200",
                            "group-focus-within/tag:opacity-100 group-hover/tag:opacity-100 focus-visible:opacity-100",
                            "[@media(hover:none)]:opacity-100",
                            "hover:bg-danger hover:text-white",
                            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                          )}
                        >
                          <X className="size-2.5" strokeWidth={3} aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* One dialog for the page rather than one per section: only ever one is open,
          and mounting it on demand is what lets it call `showModal()` once on mount
          instead of reconciling an imperative API against a prop. */}
      {browsing ? (
        <TagDialog
          label={browsing.label}
          options={VOCABULARIES[browsing.id] ?? []}
          selected={browsing.tags}
          onAdd={(value) => addChosenTag(browsing.id, value)}
          onClose={() => setBrowsingId(null)}
        />
      ) : null}
    </>
  );
}

function handleLogout() {
  // Intentionally inert in the UI-only build. It moved here from the sidebar with the
  // control it belongs to, rather than being left behind as an orphan handler.
}

/**
 * Which memory sections have a closed vocabulary, and what it is.
 *
 * Keyed by section id, and the absence of a key is meaningful: "Tags" and "Values" are
 * open sets — "no exotic leathers" is not on any list anyone could have written in
 * advance — so they keep the free-text field. Offering a picker there would be a
 * control that refuses valid input.
 *
 * Categories and brands are drawn from the app's own data rather than retyped here.
 * `PRODUCT_CATEGORIES` is the taxonomy the mission collections file by, so a preference
 * expressed in it is a preference the rest of the app can act on; `mockBrands` is the
 * register the brand pages are built from. A hand-written copy of either would be a
 * second list to keep in step, and the first divergence would be silent.
 *
 * Aesthetics are authored, because nothing in the app enumerates them yet. When
 * something does, this entry goes the same way as the other two.
 */
const VOCABULARIES: Record<string, readonly string[] | undefined> = {
  mem1: [
    "Quiet luxury",
    "Minimal tailoring",
    "Heritage",
    "Old money",
    "Japanese workwear",
    "Archive",
    "Utilitarian",
    "Resort",
    "Monochrome",
    "Sculptural",
    "Preppy",
    "Avant-garde",
  ],
  mem2: PRODUCT_CATEGORIES,
  mem3: mockBrands.map((brand) => brand.name),
};

/* ── Editions ────────────────────────────────────────────────────────────────
 *
 * An edition is a whole register, not a tier label: Signature is gold, All Rounder is
 * azure, and picking one repaints the entire app. Because the two identities are the
 * *point* of this control, each card carries its own accent whether or not it is
 * selected — showing both in neutral grey until chosen would hide the only thing the
 * choice is about.
 *
 * ## Signature's card is written in literals, and it has to be
 *
 * These cards are swatches, and a swatch must show its own colour regardless of what is
 * selected. The moment All Rounder is active, every `--color-gold*` token *is* azure —
 * so `text-gold` here would render the Signature card blue and the control would offer
 * a choice between two identical blue cards. The literals are the gold tokens' own
 * values, duplicated per theme, deliberately immune to the switch they are used to
 * make. Same rule as the photo placeholders: a thing that depicts a colour cannot be
 * painted in the variable it depicts.
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
