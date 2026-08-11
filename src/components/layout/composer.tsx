"use client";

import { X } from "lucide-react";
import * as React from "react";

import {
  autoGrow,
  BETWEEN_MS,
  BLOOM,
  BLOOM_FOCUS,
  BLOOM_HOVER,
  DELETE_MS,
  HOLD_MS,
  PANEL,
  PILL,
  SEND_BUTTON,
  TYPE_MS,
} from "@/components/layout/composer-styles";
import { cn } from "@/lib/utils";

/**
 * The app's composer, matched to the marketing hero's chat card.
 *
 * Rendered once per app page by `FloatingComposer`, which owns where it sits.
 * This component owns only what it *is* — the material, the typewriter, the
 * keyboard behaviour — so the two can be reasoned about separately.
 *
 * Same construction as the hero, layer for layer:
 *
 *  - 1.5px outer padding over a rotating conic-gradient layer, which is what
 *    reveals the sweeping gold edge as a border (7s, linear).
 *  - 20px outer radius, 18.5px inner — the 1.5px difference keeps the inner
 *    panel's corners concentric with the ring's.
 *  - Glass panel at 28px blur / 180% saturation, with a lit top edge and a
 *    shaded bottom edge.
 *  - Outer bloom at two radii, stepping up on hover and again on focus.
 *  - The gap between the prompt row and the pills, tightened from the hero's 40px
 *    — see the note at the panel.
 *  - Scale 1.015 on hover, 1.04 on focus.
 *  - Typewriter prompt with a gold ✦ and a hard-blinking gold caret, swapped for
 *    the live input once focused.
 *
 * ## Two glass materials, not one recoloured
 *
 * The hero's card is white-alpha over a dark video. Those exact values on a light
 * sidebar are an invisible box with invisible text, so this has a genuine light
 * variant — and the two differ in kind, not merely in value:
 *
 *  - **Dark** uses the hero's numbers verbatim: a white film for the fill, white
 *    inset edges top *and* bottom, a deep black drop shadow.
 *  - **Light** inverts part of that logic. The fill becomes a white frost and the
 *    top edge stays a white specular highlight, but the bottom inset flips to
 *    *black*. On a pale panel a white bottom edge is invisible, and the illusion
 *    of thickness depends entirely on that lower shade. The bloom also runs at
 *    roughly 1.5× alpha, because gold spreading onto cream carries far less than
 *    the same gold on near-black.
 *
 * Light is the unprefixed base and `dark:` carries the hero's values, so the
 * faithful reproduction is the one that reads as authored rather than as an
 * override.
 *
 * ## Deliberate departures from the hero
 *
 *  - Type sizes are fixed, not `clamp(…, 2.1vw, …)`. The hero scales with the
 *    window because it *is* the window; this card is capped at 36rem and stops
 *    growing, so a viewport-based clamp would keep enlarging type inside a
 *    container that had already stopped.
 *  - No click-to-focus backdrop. On the landing that dims the page so the card
 *    can take over; dimming the app to type into its own composer would be
 *    absurd, so the field is always live.
 *
 * Submitting and the pills are inert — there is no assistant to receive a message
 * yet.
 */

const PROMPTS = [
  "A budget wedding dress",
  "Deals on Gucci bags",
  "A watch under $2,000",
  "Designer sneakers, trending",
  "Affordable Chanel dupes",
] as const;

const CATEGORIES = ["Clothing", "Shoes"] as const;

const HEADING_ID = "app-composer-heading";

export function Composer({
  active = true,
  onRequestOpen,
  onDismiss,
}: {
  /**
   * Whether the card is on screen. Drives autofocus and nothing else — the
   * showing and hiding is `FloatingComposer`'s job, since it owns the geometry.
   */
  active?: boolean;
  /** Called when `/` is pressed while the card is hidden. */
  onRequestOpen?: () => void;
  /** Renders the dismiss control when provided. */
  onDismiss?: () => void;
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [promptIndex, setPromptIndex] = React.useState(0);
  const [typedLength, setTypedLength] = React.useState(0);
  const [phase, setPhase] = React.useState<"typing" | "deleting">("typing");

  // The decorative line shows only while the field is untouched — exactly the
  // hero's swap, which stops the demo text competing with real input.
  const showDemo = !focused && value.length === 0;
  const canSend = value.trim().length > 0;

  React.useEffect(() => {
    if (!showDemo) return;

    const current = PROMPTS[promptIndex] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      timer =
        typedLength < current.length
          ? setTimeout(() => setTypedLength((l) => l + 1), TYPE_MS)
          : setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else {
      timer =
        typedLength > 0
          ? setTimeout(() => setTypedLength((l) => l - 1), DELETE_MS)
          : setTimeout(() => {
              setPromptIndex((i) => (i + 1) % PROMPTS.length);
              setPhase("typing");
            }, BETWEEN_MS);
    }

    return () => clearTimeout(timer);
  }, [showDemo, phase, typedLength, promptIndex]);

  /**
   * Focus follows the card on screen.
   *
   * On the *transition* into active, not on every render where it happens to be
   * active — otherwise any unrelated re-render would yank the cursor back here
   * from wherever the reader had put it. The card stays mounted while hidden (so
   * it can animate both ways), so a mount-time `autoFocus` would fire at the
   * wrong moment entirely.
   */
  const wasActive = React.useRef(active);

  React.useEffect(() => {
    if (active && !wasActive.current) inputRef.current?.focus();
    wasActive.current = active;
  }, [active]);

  /**
   * `/` summons the composer and focuses it, the convention in every tool that
   * has a primary search field.
   *
   * The chip in the header advertises this, which is the reason it is wired
   * rather than decorative: a badge promising a shortcut that does nothing is
   * worse than no badge, because it teaches the user the UI lies.
   *
   * The typing guard is what makes `/` usable as a shortcut at all — without it
   * the key never reaches any input on the page, including this one.
   *
   * While hidden the card is `inert`, so focusing it directly would silently do
   * nothing. It asks to be opened instead and lets the effect above move focus
   * once it actually is.
   */
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();

      if (!active) {
        onRequestOpen?.();
        return;
      }

      inputRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onRequestOpen]);

  /**
   * Enter sends, Shift+Enter inserts a line break.
   *
   * `isComposing` is the important guard: while an IME candidate window is open
   * (Japanese, Chinese, Korean), Enter commits the candidate. Submitting on it
   * would send a half-finished word and clear the field mid-composition.
   *
   * Routed through `requestSubmit()` rather than calling the handler directly, so
   * it goes through the form's real submit path and will do the right thing the
   * moment there is an assistant behind it.
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (value.trim().length === 0) return;
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Wire to the assistant once it exists.
      }}
      onClick={() => inputRef.current?.focus()}
      className={cn(
        // 1.5px of padding is what reveals the rotating layer beneath as a border.
        "group/composer relative w-full cursor-text overflow-hidden rounded-[20px] p-[1.5px]",
        BLOOM,
        BLOOM_HOVER,
        BLOOM_FOCUS,
        "transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
        "focus-within:scale-[1.04] hover:scale-[1.015]",
      )}
    >
      {/* Rotating gold sweep. 220% with the negative offsets keeps the gradient's
          centre on the panel's centre as it turns, so the highlight tracks the
          whole perimeter instead of clipping at a corner. The gradient itself is a
          token — the bright gold that works on dark vanishes on a white panel. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -mt-[110%] -ml-[110%] h-[220%] w-[220%] animate-ring-sweep-burst motion-reduce:animate-none"
        style={{ background: "var(--ring-sweep-gradient)" }}
      />

      {/* 28px between the prompt row and the pills, not the hero's 40. That gap
          is proportional to a card that is nearly square; on a 576px-wide dock
          the same value leaves a visible band of nothing across the middle, and
          the card reads as hollow rather than as generous. */}
      <div className={cn("relative flex w-full flex-col gap-7 rounded-[18.5px] p-4", PANEL)}>
        <div className="w-full">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p
              id={HEADING_ID}
              className="text-[11px] leading-4 text-content-muted dark:text-white/60"
            >
              Your personal shopper
            </p>

            {/* A visible keyboard affordance is what makes a field read as a
                primary control rather than as ornament. `aria-hidden` because the
                shortcut is a visual hint — the textarea already has its own
                accessible name, and a stray "slash" announced mid-label is noise.
                Hidden once the field is in use: it has done its job by then, and
                a hint sitting over live text is clutter. */}
            <span className="flex shrink-0 items-center gap-1.5">
              {showDemo ? (
                <kbd
                  aria-hidden="true"
                  className={cn(
                    "grid size-[18px] shrink-0 place-items-center rounded border font-sans text-[10px] font-semibold",
                    "border-[oklch(0%_0_0/0.12)] bg-[oklch(0%_0_0/0.04)] text-content-subtle",
                    "dark:border-white/15 dark:bg-white/[0.07] dark:text-white/55",
                  )}
                >
                  /
                </kbd>
              ) : null}

              {/* `stopPropagation` because the whole card focuses the field on
                  click — without it, dismissing would put the cursor in a field
                  that is on its way off screen. */}
              {onDismiss ? (
                <button
                  type="button"
                  aria-label="Hide the composer"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDismiss();
                  }}
                  className={cn(
                    "grid size-[18px] shrink-0 place-items-center rounded text-content-subtle",
                    "transition-colors duration-200 hover:text-content dark:text-white/55 dark:hover:text-white",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  )}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </span>
          </div>

          <div className="relative w-full">
            {showDemo ? (
              <p
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 flex items-center text-[13px] leading-5 tracking-[0.01em] text-content-muted dark:text-white/85"
              >
                <span className="mr-1.5 text-gold">✦</span>
                <span className="truncate">
                  {(PROMPTS[promptIndex] ?? "").slice(0, typedLength)}
                </span>
                <span className="ml-0.5 inline-block h-[0.95em] w-[2px] shrink-0 animate-caret-blink bg-gold motion-reduce:animate-none" />
              </p>
            ) : null}

            {/* A textarea, not an input: an input cannot wrap, so a long sentence
                scrolls sideways inside it and the tail of what you typed goes
                invisible. `resize-none` drops the native drag handle, since height
                is driven by content instead.
                Sizing is `autoGrow` alone rather than CSS `field-sizing: content`
                — mixing them means an explicit inline height silently overriding
                the intrinsic one, i.e. two mechanisms where only one ever wins. */}
            <textarea
              ref={inputRef}
              rows={1}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                autoGrow(event.currentTarget);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={showDemo ? undefined : "Ask Snapi anything…"}
              aria-label="Ask Snapi anything"
              aria-describedby={HEADING_ID}
              autoComplete="off"
              className={cn(
                "w-full resize-none bg-transparent text-content dark:text-white/95",
                "text-[13px] leading-5 tracking-[0.01em]",
                "caret-gold placeholder:text-content-subtle focus:outline-none dark:placeholder:text-white/45",
                // Grows with content, then scrolls internally. The `28vh` term is
                // a guard, not decoration: this card is anchored to the bottom of
                // the window, so an uncapped field grows *upward* across the page
                // and a long paste would cover the content it was written about.
                "max-h-[min(11rem,28vh)] overflow-y-auto",
                // Thin, unobtrusive scrollbar once capped — the default chrome is
                // far too heavy for a field this shallow.
                "[scrollbar-width:thin] [scrollbar-color:oklch(60%_0.01_60/0.35)_transparent]",
              )}
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-[5px]">
            {CATEGORIES.map((label) => (
              <button
                key={label}
                type="button"
                onClick={(event) => event.stopPropagation()}
                className={PILL}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Kept mounted and faded rather than conditionally rendered — mounting
              it on the first keystroke would shift the pill row sideways. */}
          <button
            type="submit"
            aria-label="Send"
            disabled={!canSend}
            tabIndex={canSend ? 0 : -1}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              SEND_BUTTON,
              "size-[34px]",
              canSend ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
            )}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="oklch(20% 0.02 70)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
