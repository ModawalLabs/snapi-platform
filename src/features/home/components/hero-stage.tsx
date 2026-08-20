"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { routes } from "@/config/routes";
import type { MockHeroPrompt } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Rotating stage behind and beneath the hero copy.
 *
 * Owns the index so the backdrop photograph and the prompt text can never fall
 * out of step — they are one piece of state, not two timers.
 *
 * The hero's static copy is passed as `children`, so it stays a Server Component
 * even though this wrapper is a Client Component. Only the rotation is client
 * work.
 *
 * ## Auto-rotation and WCAG 2.2.2
 *
 * Content that updates itself needs a way to pause, stop, or hide it. Three
 * mechanisms here, in order of how likely they are to be used:
 *
 * - Rotation halts while the pointer is over the stage or focus is inside it, so
 *   nothing moves while you are reading or aiming at the link.
 * - Choosing a prompt from the indicators stops rotation permanently. Taking
 *   manual control is a deliberate act and shouldn't be overridden two seconds
 *   later by a timer.
 * - `prefers-reduced-motion` disables auto-advance outright; the indicators
 *   remain, so the content is still reachable.
 */

const INTERVAL_MS = 7000;

export function HeroStage({
  prompts,
  hasBackdrop,
  children,
  footer,
}: {
  /**
   * The active flavour's prompts, each carrying its own text and backdrop.
   * This component only rotates them; which set arrives is `HeroBanner`'s call.
   */
  prompts: MockHeroPrompt[];
  /** True once any prompt has a photograph — flips the whole banner treatment. */
  hasBackdrop: boolean;
  children: React.ReactNode;
  /**
   * Rendered flush with the stage's bottom edge, inside it — so it sits over the
   * backdrop and the banner ends exactly where it ends. Outside the content
   * container, because it is full-bleed.
   */
  footer?: React.ReactNode;
}) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [tookControl, setTookControl] = React.useState(false);

  const count = prompts.length;
  const active = prompts[index] ?? prompts[0];

  React.useEffect(() => {
    if (count < 2 || paused || tookControl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, paused, tookControl]);

  if (!active) return <>{children}</>;

  return (
    <div
      className={cn(
        // No `overflow-hidden`: the ribbon footer is shifted down past this
        // element's bottom edge on purpose, and clipping here would cut its lower
        // half off. The backdrop images are `fill` (absolute, inset-0), so they
        // have nothing to overflow with.
        "relative isolate flex min-h-[65vh] flex-col",
        // Pins the gold tokens bright in both themes — see `.on-photo`. Without
        // it the foiled headline word renders dark bronze on a dark photo in
        // light mode.
        hasBackdrop && "on-photo",
      )}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Backdrop. All frames stay mounted and cross-fade via opacity — swapping
          `src` on a single <Image> would show a blank frame while the next file
          decodes. Only the first is `priority`; the rest have 7s to arrive. */}
      {hasBackdrop ? (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {prompts.map((prompt, i) =>
            prompt.image ? (
              <Image
                key={prompt.id}
                src={prompt.image}
                alt=""
                fill
                // The banner spans the main region, not the viewport — the
                // sidebar takes 17rem from md up. `100vw` would over-request.
                sizes="(min-width: 768px) calc(100vw - 17rem), 100vw"
                priority={i === 0}
                className={cn(
                  "object-cover transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  i === index ? "opacity-100" : "opacity-0",
                  prompt.focus,
                )}
              />
            ) : null,
          )}

          {/* Scrim. Angled from the upper-left, where the copy sits, and heaviest
              there: the brightest of these sources reads ~124/255 in that corner,
              and white type needs its backdrop under ~46/255 to clear 4.5:1.
              0.88 alpha takes 124 down to ~15. */}
          <div className="absolute inset-0 bg-[linear-gradient(105deg,oklch(8%_0.004_60/0.9)_0%,oklch(8%_0.004_60/0.72)_36%,oklch(8%_0.004_60/0.36)_66%,oklch(8%_0.004_60/0.58)_100%)]" />

          {/* Gold bloom over the scrim. Without it a photographic banner reads as
              generic stock imagery; this ties it back to the palette that runs
              through the rest of the page. Deliberately faint — it is a tint on
              light, not a colour wash. */}
          <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_18%_12%,oklch(80%_0.13_85/0.12),transparent_62%),radial-gradient(60%_80%_at_88%_92%,oklch(60%_0.19_258/0.1),transparent_60%)]" />

          {/* No fade at the bottom edge. The ribbon now straddles that boundary
              and seals it, so a gradient there would only wash out the
              photograph immediately behind the strips. */}
        </div>
      ) : null}

      {/* Copy stays inside the measured column. `pb-6` guarantees separation from
          the prompt below even on a short viewport, where the copy fills `flex-1`
          and the two would otherwise sit flush. */}
      <div className="container-page flex flex-1 flex-col justify-center pt-14 pb-6 sm:pt-16">
        {children}
      </div>

      {/* Prompt, bottom-right — and deliberately NOT in `container-page`. That
          class caps width at `max-w-7xl` and centres it, so on a 1920 screen the
          prompt was sitting ~208px from the right edge with nothing beside it.
          Full-bleed with its own tighter inset puts it near the actual corner.
          Still in flow rather than absolute, so it can never land on the copy.

          The bottom padding is clearance for the ribbon's upper half, which
          overlaps this area by 56 / 59 / 89 / 126px at the mobile, sm, lg and xl
          widths. Each step sits ~10px above its ribbon, which is as low as the
          prompt can go: any further and the strips cross over it. */}
      <div className="flex shrink-0 justify-end px-4 pb-16 sm:px-5 sm:pb-20 lg:px-6 lg:pb-[6.5rem] xl:pb-[8.5rem]">
        <div className="flex flex-col items-end gap-3">
          <Link
            href={routes.newChat(active.text)}
            className={cn(
              "group flex items-center gap-2.5 rounded-full border py-2.5 pr-4 pl-4 focus-visible:outline-ring",
              "backdrop-blur-xl transition-[background-color,border-color,box-shadow,translate] duration-500",
              "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2",
              "sm:min-w-[20rem]",
              hasBackdrop
                ? "border-white/20 bg-white/[0.07] text-white hover:border-gold/70 hover:bg-white/[0.12]"
                : "border-border bg-surface/60 text-content hover:border-gold-border hover:bg-surface hover:shadow-premium-sm",
            )}
          >
            <Sparkles className="size-4 shrink-0 text-gold" aria-hidden="true" />

            {/* Keyed so each prompt re-runs the entry animation on change. */}
            <span
              key={active.id}
              className="flex-1 animate-rise text-left text-sm font-medium tracking-[-0.01em] sm:text-[0.9375rem]"
            >
              {active.text}
            </span>

            <ArrowRight
              className={cn(
                "size-4 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5",
                hasBackdrop ? "text-white/60" : "text-content-subtle",
              )}
              aria-hidden="true"
            />
          </Link>

          {/* Indicators double as the manual control that satisfies 2.2.2. */}
          {count > 1 ? (
            <div className="flex items-center gap-1.5">
              {prompts.map((prompt, i) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setTookControl(true);
                  }}
                  aria-label={`Show prompt ${i + 1} of ${count}: ${prompt.text}`}
                  aria-current={i === index}
                  className={cn(
                    "h-[3px] rounded-full transition-[width,background-color] duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                    i === index ? "w-7 bg-gold" : "w-3",
                    i === index
                      ? ""
                      : hasBackdrop
                        ? "bg-white/30 hover:bg-white/60"
                        : "bg-border-strong hover:bg-content-subtle",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Straddles the stage's bottom edge: anchored there, then pushed down by
          half its own height, so its vertical centre lands exactly on that line.
          Upper half over the photograph, lower half on the canvas below.
          Absolute rather than in flow, so the stage's height is the content's —
          the band hangs outside it instead of extending it. */}
      {footer ? (
        <div className="pointer-events-none absolute bottom-0 left-0 w-full translate-y-1/2">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
