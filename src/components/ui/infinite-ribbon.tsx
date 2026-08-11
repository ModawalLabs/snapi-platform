import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite scrolling ribbon (adapted from the 21st.dev component).
 *
 * Four changes from the original, each for a concrete reason:
 *
 * 1. **Keyframes live in `globals.css`, not an inline `<style>`.** The original
 *    renders its stylesheet inside the component body, so mounting two ribbons —
 *    exactly what the crossed layout does — injects the same rules twice.
 *    Reuses the existing `marquee` keyframes rather than adding a duplicate pair.
 *
 * 2. **`tone` instead of hardcoded `bg-yellow-400`.** Yellow is not in this
 *    product's palette; `gold` and `ink` are the two fill tokens, already tuned
 *    per theme.
 *
 * 3. **No local `prefers-reduced-motion` block.** `globals.css` already
 *    neutralises every animation globally, so a second rule here is dead weight
 *    that can silently drift out of step with the global one.
 *
 * 4. **Width is caller-controlled.** A rotated full-width bar leaves triangular
 *    gaps at the left and right edges of its container. Callers that rotate must
 *    oversize (e.g. `w-[112%] -left-[6%]`) inside a clipping parent — see
 *    `RibbonDivider`.
 *
 * The `-50%` translate is only seamless because the track holds exactly twice
 * `repeat` copies; changing one without the other makes the loop visibly jump.
 */

export interface InfiniteRibbonProps {
  repeat?: number;
  /** Seconds for one full cycle. Higher is slower — see RibbonDivider for the
   *  px/second reasoning behind the value used in the app. */
  duration?: number;
  reverse?: boolean;
  rotation?: number;
  /**
   * `gold` is the accent fill; `ink` is its dark counterpart.
   *
   * Both are fixed rather than theme-inverting — see the note on `TONE` below.
   */
  tone?: "gold" | "ink";
  /**
   * Hide from assistive tech entirely and skip the screen-reader copy.
   *
   * Set this on every ribbon after the first in a stacked or crossed group: they
   * all carry the same words, so without it each one announces the whole list
   * again.
   */
  decorative?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Tones are deliberately theme-independent — the same reasoning as
 * `.media-placeholder`: a printed ribbon is an object, and an object does not
 * change colour when the viewer switches to light mode.
 *
 * `bg-ink` was the obvious token and it is wrong here, because `ink` inverts by
 * design: on the dark canvas it renders a white bar, which becomes the brightest
 * element on the page and out-shouts the gold it is meant to support. Fixing both
 * tones keeps the lockup reading identically in both themes, with gold leading.
 *
 * The ink fill sits at 20% lightness, not 15%. The dark canvas is 13.5%, so at
 * 15% the bar was within a whisker of the background and read as white text
 * floating in space rather than as a ribbon. 20% is a visible step up while
 * staying unmistakably the darker, receding half of the pair — and it is still
 * plainly near-black against the cream canvas in light mode.
 *
 * The gold hairline does the rest of that separation work.
 */
const TONE = {
  // `--ribbon-*` rather than literals or `--color-gold-*`. The strip is a
  // physical object, so it must not invert with the theme — but it *is* an
  // accent, so it does follow the flavour. Those tokens encode exactly that
  // distinction: fixed per edition, identical in light and dark.
  gold: "bg-[var(--ribbon-face)] text-[var(--ribbon-ink)]",
  ink: "bg-[oklch(20%_0.007_60)] text-[oklch(96%_0.003_85)] ring-1 ring-[var(--ribbon-hairline)] ring-inset",
} as const;

export function InfiniteRibbon({
  repeat = 5,
  duration = 10,
  reverse = false,
  rotation = 0,
  tone = "gold",
  decorative = false,
  children,
  className,
}: InfiniteRibbonProps) {
  const repeatCount = Math.max(1, Math.floor(repeat));

  return (
    <div
      className={cn("w-full max-w-full overflow-hidden py-2.5", TONE[tone], className)}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden={decorative || undefined}
    >
      {/* Announced once, as static text. The visible track is duplicated and
          would otherwise be read out `repeat * 2` times. */}
      {decorative ? null : <span className="sr-only">{children}</span>}

      <div
        aria-hidden="true"
        className="flex w-max whitespace-nowrap"
        style={{
          animationName: reverse ? "marquee-reverse" : "marquee",
          animationDuration: `${Math.max(0.1, duration)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {Array.from({ length: repeatCount * 2 }, (_, index) => (
          <span className="mr-8 inline-block select-none" key={index}>
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}
