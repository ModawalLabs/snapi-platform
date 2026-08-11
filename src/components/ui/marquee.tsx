import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee.
 *
 * CSS-only, so this stays a Server Component and the whole home page ships zero
 * client JS. Four details make it correct rather than merely animated:
 *
 *  1. **The track holds exactly two copies** of the children and animates to
 *     `translateX(-50%)`. That is what makes the wrap seamless — with any other
 *     number of copies or any other distance, the loop visibly jumps.
 *  2. **The duplicate copy is `aria-hidden`.** Otherwise every product is
 *     announced twice, and the tab order walks the same links twice.
 *  3. **It pauses on hover and on keyboard focus within.** Text sliding out from
 *     under the pointer while you try to read or click it is hostile.
 *  4. **`prefers-reduced-motion` stops the animation and makes the row a normal
 *     horizontal scroller**, so the content stays reachable rather than frozen
 *     mid-scroll with half of it unreachable.
 *
 * Edge-faded on both sides so items enter and leave rather than being clipped.
 */
export function Marquee({
  children,
  className,
  /** CSS duration, e.g. "60s". Slower reads as more expensive. */
  duration,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: string;
}) {
  return (
    <div
      className={cn(
        "group/marquee relative w-full overflow-hidden",
        // Reduced motion: becomes a plain scrollable row.
        "motion-reduce:overflow-x-auto",
        className,
      )}
      style={{
        // Feather the ends instead of a hard cut at the viewport edge.
        maskImage:
          "linear-gradient(to right, transparent, black 6rem, black calc(100% - 6rem), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6rem, black calc(100% - 6rem), transparent)",
      }}
    >
      <div
        className={cn(
          "flex w-max animate-marquee items-stretch gap-4",
          "group-hover/marquee:[animation-play-state:paused]",
          "group-focus-within/marquee:[animation-play-state:paused]",
          "motion-reduce:animate-none",
        )}
        style={duration ? { animationDuration: duration } : undefined}
      >
        {/* Copy 1 — the real, reachable content. */}
        <div className="flex shrink-0 items-stretch gap-4">{children}</div>
        {/* Copy 2 — visual continuation only.
            `inert` is doing the real work: `aria-hidden` alone hides it from
            screen readers but leaves every link in the tab order, so keyboard
            users would tab through the same products a second time. `inert`
            removes it from focus, AT, and hit-testing together. */}
        <div className="flex shrink-0 items-stretch gap-4" inert aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
