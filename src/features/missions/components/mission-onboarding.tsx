"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { mockMissionStarters, type MockMissionStarter } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Writing a mission — the whole of it, on its own page.
 *
 * This began as the empty board's onboarding: with nothing created the board showed a
 * dotted compose tile alone, which asks someone who has never written a brief to
 * invent one from a blank rectangle. Most people close the tab instead.
 *
 * It is now the *only* way a mission gets written. The compose tile used to expand
 * into a small textarea in place, so the same act had two interfaces — one with worked
 * examples and one without, and the one without was what everybody past their first
 * mission got. The examples are the part that teaches the shape of a brief, and there
 * is no reading of "for beginners only" that survives the second mission.
 *
 * ## Two audiences, one page
 *
 * `returning` swaps the handful of first-run phrases and nothing else. The art, the
 * field, the starters and the thread between them are identical, because none of that
 * is introductory — it is how you write a brief. What would be wrong is telling
 * someone with four missions that this is their first.
 *
 * `onCancel` is what makes the page escapable, and it is optional for a real reason:
 * on an empty board there is nowhere to go back *to*, and a "Back to missions" link
 * that returns you to the page you are already on is a dead control.
 *
 * ## The field is always open, and the examples fill it
 *
 * That is the whole design. One field under the masthead, three worked examples
 * beneath it, and tapping one drops its brief into the field with the cursor at the
 * end. The user *watches the words land in the box* — which teaches the shape of a
 * brief far faster than any amount of instruction, and leaves them holding something
 * they can edit rather than something they were given.
 *
 * The alternative — a panel that appears on demand — was rejected for the reason
 * empty states usually fail: it hides the destination until after the decision, so
 * the examples read as navigation rather than as ingredients.
 *
 * ## Two things, in this order
 *
 *  1. **Masthead.** What a mission *is*, in one sentence. Occasions, not products.
 *  2. **Field, then starters.** Possibility before instruction — an empty state that
 *     opens with "how it works" is a manual, and nobody reads the manual on a page
 *     they landed on by accident.
 *
 * Nothing else, and it lost a block getting here: a numbered describe → watch →
 * report strip sat ruled off at the foot and came out again. It explained the
 * mechanism accurately and cost a third of the page to say what the masthead and
 * three worked examples already demonstrate. An onboarding is only quick if it
 * stops.
 */

/**
 * Matches the brief field on a real mission; long enough for a sentence.
 *
 * It used to live on the compose tile, which had the other copy of this field. That
 * tile is now a button, so the cap has one home and cannot disagree with itself.
 */
const BRIEF_MAX = 180;

/**
 * How each starter is pinned.
 *
 * A mission *is* a moodboard — a few references gathered for one occasion — and
 * three cards in a tidy row says "options in a list" instead. Rotating them says
 * what the feature is before a word of the copy is read.
 *
 * Authored per position, never random: `Math.random()` would render one angle on the
 * server and another in the browser, and a card that jumps on hydration is worse
 * than a straight one. Angles stay under two degrees, which is the line between
 * "placed by hand" and "the transform is broken" — and every card straightens under
 * the cursor, so the thing you are reading is never on a slant.
 *
 * `sm:` only. Below that the row is a single column, and a stack of tilted cards
 * reads as a rendering fault rather than as a board.
 */
const PINS = [
  { offset: "", angle: "sm:-rotate-2" },
  { offset: "sm:translate-y-5", angle: "sm:rotate-[1.5deg]" },
  { offset: "sm:translate-y-1.5", angle: "sm:-rotate-1" },
  { offset: "sm:translate-y-4", angle: "sm:rotate-1" },
  { offset: "sm:translate-y-1", angle: "sm:-rotate-[1.5deg]" },
] as const;

/**
 * One reveal, four delays.
 *
 * `fill-mode-both` is what makes a staggered entrance work: without it a delayed
 * element sits fully visible through its own delay and then jumps to the start of
 * its animation.
 */
const REVEAL = cn(
  "animate-in fill-mode-both fade-in slide-in-from-bottom-3",
  "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "motion-reduce:animate-none",
);

export function MissionOnboarding({
  onCreate,
  onCancel,
  returning = false,
}: {
  onCreate: (brief: string) => void;
  /**
   * Leaves without creating anything. Omitted on an empty board, where there is no
   * board behind this to go back to — and its absence is what hides the back link.
   */
  onCancel?: () => void;
  /** Whether the board already holds missions. Swaps the first-run copy only. */
  returning?: boolean;
}) {
  const [brief, setBrief] = React.useState("");
  const fieldRef = React.useRef<HTMLTextAreaElement>(null);

  const ready = brief.trim().length > 0;

  function submit() {
    if (!ready) return;
    onCreate(brief.trim());
    setBrief("");
  }

  /**
   * Escape leaves, from anywhere on the page.
   *
   * On `document` rather than on the field, because by the time you decide not to
   * write a mission the cursor is as likely to be on a starter card, or nowhere at
   * all. The field's own handler still runs first for Enter; this only ever sees keys
   * that were not handled there.
   */
  React.useEffect(() => {
    if (!onCancel) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      onCancel?.();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  /**
   * Fill the field, then put the caret at the end of it.
   *
   * `setSelectionRange` in the same handler rather than relying on focus alone:
   * focusing a textarea that already has content lands the caret wherever the
   * browser last left it, which after a second tap is the middle of the previous
   * brief. The user's next keystroke would land there.
   */
  function pick(starter: MockMissionStarter) {
    setBrief(starter.brief);

    const field = fieldRef.current;
    if (!field) return;
    field.focus();
    // Next frame: the value has not been committed to the DOM yet in this one, so
    // the end of the text does not exist to select.
    requestAnimationFrame(() => field.setSelectionRange(field.value.length, field.value.length));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter submits, Shift+Enter breaks the line — the convention every composer in
    // this app follows. `isComposing` guards IME candidate selection, where Enter
    // means "accept this character", not "send".
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  return (
    <div className="ambient-canvas relative">
      {/* Absolute, so the masthead stays optically centred in the column rather than
          being pushed down by a control that is not part of it. It sits above the
          reveal animations and does not participate in them: the way out should be
          there on the first frame, not fade in after the page has finished
          introducing itself. */}
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            // Indented past the mobile navigation trigger, which is `fixed top-3 left-3`
            // and was sitting on the first two characters of this label. It is hidden
            // from `md`, which is where the link returns to the container's own margin.
            "absolute top-8 left-16 z-10 inline-flex items-center gap-2 rounded-md sm:top-10 md:left-6 lg:left-8",
            "text-[13px] font-medium text-content-muted transition-colors duration-200 hover:text-content",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to missions
        </button>
      ) : null}

      {/* `min-h-dvh` with `justify-center` centres the column in the window when it
          fits and lets it grow past it when it does not — a fixed height would either
          clip the starters or strand them below a fold with nothing to indicate they
          are there. */}
      <div className="container-page flex min-h-dvh flex-col justify-center py-16 sm:py-20 lg:py-24">
        {/* ── Masthead ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className={cn("text-eyebrow text-gold", REVEAL)}>Missions</p>

          {/* Two lines either way, the second in muted ink. The shape of the
              masthead is the page's signature — a returning user should recognise
              where they are before they have read a word of it, which they cannot do
              if the heading changes from a couplet to a single line. */}
          <h1
            className={cn(
              "mt-3.5 font-display text-[clamp(1.875rem,3.8vw,3rem)] leading-[1.05] font-normal tracking-[-0.012em] text-balance text-content",
              REVEAL,
              "delay-100",
            )}
          >
            {returning ? "Another standing brief." : "Tell Snapi once."}
            <span className="block text-content-muted">
              {returning ? "Snapi takes it from here." : "It keeps looking."}
            </span>
          </h1>

          <p
            className={cn(
              "mx-auto mt-5 max-w-[52ch] text-[15px] leading-relaxed text-content-muted",
              REVEAL,
              "delay-150",
            )}
          >
            {returning
              ? // No definition of "a mission" second time round. Someone who has one
                // running knows; repeating it is the app explaining itself to a user
                // who has already understood.
                "Describe the next one and Snapi works on it alongside the missions you already have — same as the others, until it finds what fits."
              : "A mission is a standing brief — a wedding, a new flat, two weeks away. Describe it and Snapi works on it in the background until it finds what fits."}
          </p>
        </div>

        {/* ── The field ────────────────────────────────────────────────────── */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className={cn(
            "mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-gold-border bg-surface p-4 shadow-premium-sm sm:p-5",
            REVEAL,
            "delay-200",
          )}
        >
          <label htmlFor="mission-brief" className="text-eyebrow block text-center text-gold">
            {returning ? "Your new mission" : "Your first mission"}
          </label>

          <textarea
            ref={fieldRef}
            id="mission-brief"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={BRIEF_MAX}
            rows={3}
            placeholder="Describe it in a sentence — what it is for, and anything it has to be."
            className={cn(
              "mt-3 w-full resize-none rounded-lg border border-border bg-canvas p-3.5",
              // Centred, like everything else on the page. It is the one control where
              // that has a cost — a caret that moves with every character is harder to
              // track than one anchored to a left margin — and it is a single sentence
              // in a 3-row field, which is the case where the cost is smallest.
              "text-center text-sm leading-relaxed text-content placeholder:text-content-subtle",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          />

          {/* Centred as a pair rather than pushed to opposite ends. The counter reads
              as a note on the button beside it, which is what it is. */}
          <div className="mt-3.5 flex items-center justify-center gap-4">
            {/* Counted from the cap that already exists on the field. A limit the
                user cannot see is a limit they hit mid-sentence. */}
            <p className="tabular text-[11px] text-content-subtle">
              {brief.length}/{BRIEF_MAX}
            </p>

            {/* Genuinely disabled, not just dimmed — an empty brief has nothing for
                the agent to work from, and letting the click through would create a
                nameless mission. */}
            <button
              type="submit"
              disabled={!ready}
              className={cn(
                "rounded-md bg-gold-solid px-4 py-2 text-[13px] font-semibold text-gold-content",
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

        {/* ── Starters ──────────────────────────────────────────────────────
            Five worked examples, wide enough to hold a photograph each. The row is
            `flex-wrap`, not a grid: five items in a three- or four-column grid leave
            a short last row hanging at the left margin, and on a page where every
            other line is centred that reads as a mistake. Wrapping centres what is
            left over.

            The golden thread that used to fan from the field down to the cards is
            gone, along with the whispered caption it carried. The relationship it
            drew is now stated in a heading instead — which says the same thing in
            words, and does not have to be redrawn every time the row rewraps. */}
        <div className={cn("mx-auto mt-14 w-full max-w-6xl", REVEAL, "delay-300")}>
          <h2 className="text-center font-display text-[clamp(1.125rem,1.8vw,1.375rem)] leading-tight font-normal text-content">
            Or start from one of these
          </h2>

          <ul className="mt-7 flex flex-wrap justify-center gap-4 pb-6 sm:gap-5">
            {mockMissionStarters.map((starter, index) => (
              // The stagger sits on the `li` and the pin angle on the button, so the
              // two transforms never fight: hovering straightens and lifts the card
              // without also cancelling the offset that positions it.
              <li
                key={starter.id}
                className={cn("w-full sm:w-[calc(50%-0.625rem)] lg:w-[13rem]", PINS[index]?.offset)}
              >
                <StarterCard
                  starter={starter}
                  angle={PINS[index]?.angle}
                  onPick={() => pick(starter)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StarterCard({
  starter,
  angle,
  onPick,
}: {
  starter: MockMissionStarter;
  /** The pin angle from `PINS`. */
  angle?: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      // Names the brief this card carries. Without it every card in the row announces
      // itself as "Use this brief" and they become indistinguishable by voice.
      aria-label={`Use the ${starter.label} brief`}
      className={cn(
        "group flex h-full w-full flex-col rounded-xl border border-border bg-surface p-2.5 text-center",
        "transition-[background-color,border-color,box-shadow,translate,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        angle,
        // A resting shadow, not just one on hover. A tilted card with no shadow reads
        // as a broken transform; with one it reads as a print lying on a surface, and
        // that difference is the entire effect.
        "shadow-premium-sm",
        // Straighten and lift. `rotate-0` beats the `sm:` pin angle on specificity —
        // a hover variant is the later, more specific rule.
        "hover:-translate-y-1 hover:rotate-0 hover:border-gold-border hover:shadow-premium",
        // The same on keyboard focus, so a card being read is never on a slant.
        "focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      {/* 3:2 — the intrinsic ratio of all five sources, so nothing is cropped. */}
      <MediaFrame
        src={starter.image}
        alt=""
        focus={starter.focus}
        scrim={false}
        sizes="(min-width: 640px) 30vw, 92vw"
        className="aspect-[3/2] w-full rounded-lg"
      />

      <span className="flex flex-1 flex-col px-1 pt-3 pb-1">
        {/* The title is gone. Five cards each headed by a display-serif line read as
            five articles to choose between, which is the wrong thing to say beside a
            field you are meant to be typing in — and at 208px wide the titles wrapped
            to two lines and pushed the cards past the height of the form itself. The
            hint survives because it is the shorter, more useful half: it says what the
            brief is for without naming it. `label` is still the button's accessible
            name, so nothing was lost to a screen reader. */}
        <span className="text-[13px] leading-relaxed text-content-muted">{starter.hint}</span>

        <span className="mt-auto flex items-center justify-center gap-1.5 pt-3 text-[12px] font-semibold text-gold">
          Use this brief
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </span>
    </button>
  );
}
