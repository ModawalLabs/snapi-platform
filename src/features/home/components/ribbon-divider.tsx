import { InfiniteRibbon } from "@/components/ui/infinite-ribbon";
import { getFlavourCopy } from "@/lib/flavour-server";

/**
 * Crossed ribbon pair that closes the hero banner.
 *
 * Composed as the banner's `footer`, not as a sibling section: it is the banner's
 * bottom edge, so the section terminates exactly where these strips do and they
 * lie over the photograph rather than on the canvas below.
 *
 * Content comes from the active flavour, so the strips advertise the edition the
 * page is actually in rather than a fixed set of luxury categories.
 *
 * Three pieces of geometry that are easy to get wrong:
 *
 * 1. **Both bars share one vertical centre.** Two lines through `(cx, y₁)` and
 *    `(cx, y₂)` with slopes `±m` meet at `x = cx + (y₁ − y₂) / 2m` — so they only
 *    cross at the horizontal centre when `y₁ = y₂`. Offsetting one bar downward
 *    (the obvious way to stack them) silently slides the crossing point sideways
 *    and the whole lockup reads as off-centre.
 *
 * 2. **The bars are 112% wide, centred.** Rotating a 100%-wide bar leaves a
 *    triangular wedge of bare canvas at each end. Oversizing inside a clipped
 *    parent is what makes them appear to run past both edges.
 *
 * 3. **Band height tracks width, via `aspect-ratio`.** A bar rotated by θ sweeps
 *    `width·sin θ + height·cos θ` vertically — ~150px at 1150px wide, ~195px at
 *    1630px. A fixed height is therefore correct at exactly one viewport size and
 *    clips the bars' ends at every other, which reads as "the strip doesn't reach
 *    the edge". `aspect-[6.5/1]` keeps the band proportional to that sweep, and
 *    `min-h` covers narrow screens where the ratio alone would be too short.
 *
 * Speed is ~45 px/second — slow enough to read a label as it passes. Duration
 * covers half the track (`repeat` copies), so it must be re-derived if `repeat`
 * or the label set changes; the two are coupled.
 */

const SEPARATOR = "✦";

function ribbonLine(labels: readonly string[], offset: number) {
  // Rotate the second line's starting point so the bars aren't mirror images of
  // each other where they cross.
  const ordered = [...labels.slice(offset), ...labels.slice(0, offset)];
  return ordered.map((label) => `${label}  ${SEPARATOR}  `).join("");
}

const TYPE = "text-[11px] font-semibold tracking-[0.2em] uppercase sm:text-xs";

/**
 * Centring wrapper. The rotation lives in an inline `transform` on the ribbon
 * itself, and an inline style beats a utility class — so `-translate-*` on the
 * ribbon would be silently discarded. Centring has to happen on a parent.
 */
const CENTERED = "absolute top-1/2 left-1/2 w-[112%] -translate-x-1/2 -translate-y-1/2";

export async function RibbonDivider() {
  const { ribbon } = await getFlavourCopy();

  return (
    /**
     * A normal-flow band, flush with the bottom of the banner it sits inside — so
     * the banner's bottom edge and this element's bottom edge are the same line,
     * and the strips lie over the photograph rather than on the canvas below.
     *
     * `w-full` alongside `aspect-ratio` is load-bearing. Leave the width implicit
     * and the ratio resolves the other way — deriving WIDTH from the clamped
     * `min-height` — which made the band 112 × 6.5 = 728px wide on a 390px phone
     * and scrolled the whole page sideways.
     *
     * `pointer-events-none` because nothing in here is interactive, and the bars
     * overhang their container.
     */
    <div
      data-slot="ribbon-divider"
      className="pointer-events-none relative isolate aspect-[6.5/1] max-h-[260px] min-h-[112px] w-full overflow-hidden"
    >
      {/* Behind. `decorative` because the gold bar below already exposes the same
          words to assistive tech — without it the list is announced twice. */}
      <div className={CENTERED}>
        <InfiniteRibbon
          tone="ink"
          reverse
          rotation={-1}
          duration={52}
          repeat={4}
          decorative
          className={TYPE}
        >
          {ribbonLine(ribbon, 2)}
        </InfiniteRibbon>
      </div>

      {/* In front, and the one that carries the accessible copy. These labels are
          no longer anywhere else on the page now the hero cards are gone, so
          hiding both bars would drop them from the accessibility tree entirely. */}
      <div className={CENTERED}>
        <InfiniteRibbon
          tone="gold"
          rotation={3}
          duration={58}
          repeat={4}
          className={`shadow-premium ${TYPE}`}
        >
          {ribbonLine(ribbon, 0)}
        </InfiniteRibbon>
      </div>
    </div>
  );
}
