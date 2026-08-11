import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Marquee } from "@/components/ui/marquee";
import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import { imageRatio } from "@/lib/media";
import { mockPromos, type MockPromo } from "@/lib/mock-data";
import { clamp, cn } from "@/lib/utils";

/**
 * Continuously scrolling promotion rail, built for mixed-shape creative.
 *
 * The feed will carry landscape, portrait, square and banner artwork. A marquee
 * scrolls horizontally, so **height is the edge the eye reads** — the top and
 * bottom of the rail have to be dead level or the whole strip looks broken. Width
 * is therefore the free dimension, and the one that absorbs the variety.
 *
 * So: one fixed rail height, and every card is exactly its own aspect ratio. A
 * 3:4 portrait is narrow, a 5:2 banner is wide, and neither is cropped. What holds
 * it together is everything *except* width — a shared height, one corner radius,
 * one scrim, one caption treatment, one gap. That is the contact-sheet principle:
 * variety in the frames, absolute discipline in the mounting.
 *
 * Three things make it hold up against a real feed rather than a tidy fixture:
 *
 *  1. **The ratio is clamped at the extremes.** Not to normalise shapes — inside
 *     the band every image is pixel-exact — but because one 8:1 asset would
 *     otherwise be wider than the viewport and stall the rail on a single card.
 *     Beyond the band the image crops, which is what `focus` is for.
 *  2. **Shapes are interleaved.** A feed returns whatever order it returns, and
 *     three banners in a row reads as a dump rather than a layout.
 *  3. **`sizes` is computed per card.** Rendered width is fully determined here
 *     (ratio × rail height), so each image can request exactly what it will
 *     occupy instead of a viewport-wide guess.
 *
 * Server Component throughout — the marquee is CSS-only and nothing here reacts.
 */

/**
 * Rail height per breakpoint, in px.
 *
 * These must stay in step with the `h-*` classes on the card. Tailwind scans
 * source text and cannot read a constant, so the two cannot be derived from one
 * value — but `sizes` below *is* derived from these, and a mismatch would only
 * cost slightly wrong image candidates, never a broken layout.
 */
const RAIL_HEIGHT = { base: 240, sm: 272, lg: 304 } as const;
const RAIL_HEIGHT_CLASS = "h-[240px] sm:h-[272px] lg:h-[304px]";

/**
 * The widest and narrowest a card may be, as width ÷ height.
 *
 * Wide enough to let a genuine 5:2 banner through at full width — banners are
 * *supposed* to be wide, and clamping them to a landscape defeats the point of
 * accepting the shape at all. It only catches pathological assets.
 */
const MIN_RATIO = 0.6;
const MAX_RATIO = 3.2;

/** Anything at or above this reads as "wide" for interleaving purposes. */
const WIDE_AT = 1.2;

export function ProductMarquee() {
  const promos = interleaveByShape(mockPromos);

  return (
    <section
      aria-labelledby="featured-promos"
      className="border-y border-border bg-surface-sunken py-12 sm:py-16"
    >
      {/* The heading is visually hidden. A silent auto-scrolling strip of links is
          disorienting with a screen reader — there needs to be *something* naming
          the region — but a visible "Featured" title above a marquee adds a fourth
          section heading and makes the page feel like it never ends. */}
      <h2 id="featured-promos" className="sr-only">
        Featured this week
      </h2>

      <div className="container-page mb-7">
        <p className="text-eyebrow text-gold">Featured this week</p>
      </div>

      <Marquee duration="70s">
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </Marquee>
    </section>
  );
}

function PromoCard({ promo }: { promo: MockPromo }) {
  const ratio = cardRatio(promo);

  return (
    <Link
      href={routes.product(promo.slug)}
      // Height from the class, width from the ratio. The height is definite, so
      // `aspect-ratio` resolves the width — the deliberate inverse of the trap
      // where a ratio plus a *min*-height derives width from the clamped height.
      style={{ aspectRatio: ratio }}
      className={cn(
        "group block shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        RAIL_HEIGHT_CLASS,
      )}
    >
      {/* Scrim stays on — unlike The Edit and More For You, the caption sits on
          the photograph here, and that is what keeps it legible over an arbitrary
          image at an arbitrary shape. */}
      <MediaFrame
        src={promo.image}
        alt=""
        focus={promo.focus}
        sizes={cardSizes(ratio)}
        className="h-full w-full rounded-lg shadow-premium-sm"
      >
        {/* `p-4` at the narrow end: a 3:4 portrait is only ~185px wide, and 20px
            of padding either side leaves the hook nowhere to go. */}
        <div className="relative flex h-full flex-col justify-end p-4 sm:p-5">
          <span className="text-eyebrow text-white/60">{promo.brand}</span>

          {/* Clamped, not truncated. A portrait card gives the product name two
              lines; an ellipsis mid-word on a banner card that has room to spare
              would be worse. */}
          <span className="mt-1.5 line-clamp-2 text-base leading-tight font-semibold text-balance text-white sm:text-[17px]">
            {promo.product}
          </span>

          <span className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-gold">
            {promo.hook}
            <ArrowRight
              className="size-3.5 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </MediaFrame>
    </Link>
  );
}

/**
 * The ratio a card renders at: the artwork's own, clamped at the extremes.
 *
 * A static import carries its intrinsic dimensions, so nothing has to be declared
 * for local assets. A remote URL carries none, which is why `MockPromo.ratio`
 * exists — the backend must send dimensions with the image or every card would
 * fall back to the same shape and the whole point of this layout is lost.
 */
function cardRatio(promo: MockPromo): number {
  return clamp(imageRatio(promo.image, promo.ratio) ?? 3 / 2, MIN_RATIO, MAX_RATIO);
}

/**
 * Exactly what this card will occupy, per breakpoint.
 *
 * Worth the arithmetic: a portrait card is ~185px wide, and a blanket
 * `sizes="60vw"` would have every one of them download a 770px image.
 */
function cardSizes(ratio: number): string {
  const w = (height: number) => `${Math.round(ratio * height)}px`;
  return `(min-width: 1024px) ${w(RAIL_HEIGHT.lg)}, (min-width: 640px) ${w(RAIL_HEIGHT.sm)}, ${w(RAIL_HEIGHT.base)}`;
}

/**
 * Alternate wide and tall cards so the rail never runs several banners together.
 *
 * Deterministic — it partitions and zips, it does not shuffle. A `Math.random()`
 * order would render one sequence on the server and another in the browser, which
 * is a hydration mismatch, and a different one on every request.
 *
 * Order within each group is preserved, so whatever priority the feed encodes
 * still survives; only the interleaving is imposed.
 */
function interleaveByShape(promos: MockPromo[]): MockPromo[] {
  const wide: MockPromo[] = [];
  const tall: MockPromo[] = [];

  for (const promo of promos) {
    (cardRatio(promo) >= WIDE_AT ? wide : tall).push(promo);
  }

  const out: MockPromo[] = [];
  for (let i = 0; i < Math.max(wide.length, tall.length); i++) {
    if (wide[i]) out.push(wide[i]!);
    if (tall[i]) out.push(tall[i]!);
  }

  return out;
}
