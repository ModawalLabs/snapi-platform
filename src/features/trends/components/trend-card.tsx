import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import { fitForTile, imageRatio } from "@/lib/media";
import type { MockTrendProduct, MockTrendTile, TrendImageShape } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Roughly what each image shape resolves to at `lg`, as width ÷ height.
 *
 * Only the two shapes that can hold a photograph appear here — a `band` never
 * does, which is why it has no entry and no way to acquire one.
 *
 * Used solely to decide crop-vs-contain; the grid itself sizes the cards.
 * Approximate on purpose: what matters is which side of the crop band a
 * photograph falls on, and that does not change over a few percent of column
 * width.
 */
const SHAPE_RATIO: Record<TrendImageShape, number> = {
  standard: 1.39,
  portrait: 0.67,
};

/**
 * A product in the mosaic.
 *
 * Caption over the photograph rather than beneath it, unlike The Edit. A bento
 * only reads as a mosaic if every cell is one clean rectangle — put captions
 * below and each card becomes an image plus a ragged text block, the spans stop
 * meeting, and the whole grid unravels. That is why the scrim is on here and off
 * everywhere else.
 *
 * The whole card is one link: a product has a single destination.
 */
export function TrendCard({ product }: { product: MockTrendProduct }) {
  // Same rule as the workspace grid: crop what is close to the cell's shape,
  // letterbox what is too far off to crop honestly.
  const fit = fitForTile(imageRatio(product.image), SHAPE_RATIO[product.shape]);
  const isPortrait = product.shape === "portrait";

  return (
    <Link
      href={routes.product(product.slug)}
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <MediaFrame
        src={product.image}
        alt=""
        focus={product.focus}
        fit={fit}
        sizes="(min-width: 1024px) 45vw, (min-width: 640px) 60vw, 92vw"
        className={cn(
          "h-full w-full rounded-xl shadow-premium-sm",
          "transition-[box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1 group-hover:shadow-premium",
        )}
      >
        {product.badge ? (
          // Fixed white-on-black glass, not theme tokens: it sits on a photograph,
          // and a photograph does not lighten because the UI did.
          <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white/90 uppercase backdrop-blur-sm">
            {product.badge}
          </span>
        ) : null}

        <div className="on-photo absolute inset-x-0 bottom-0 flex flex-col p-4 sm:p-5">
          <span className="text-eyebrow text-white/60">{product.brand}</span>

          <span
            className={cn(
              "mt-1.5 line-clamp-2 leading-tight font-semibold text-balance text-white",
              isPortrait ? "text-base sm:text-[17px]" : "text-[15px] sm:text-base",
            )}
          >
            {product.name}
          </span>

          {/* Seller count, no price. A trending board answers "what is moving",
              and a figure on the tile turns that into a comparison the reader has
              to run on every card. The number stays on the data for the listing
              itself, which is where a price can be shown next to what it buys. */}
          <span className="tabular mt-2 text-[11px] text-white/60">
            {product.sellers} {product.sellers === 1 ? "seller" : "sellers"}
          </span>
        </div>
      </MediaFrame>
    </Link>
  );
}

/**
 * A typographic tile — the page's punctuation.
 *
 * No photograph and no `MediaFrame`, so it reads as a different kind of object
 * rather than a card whose image failed to load. It leads into the composer with
 * the query pre-filled, which is the point: a marketplace's categories are just
 * saved searches wearing a nicer coat.
 *
 * `.tint-panel` gives it the light and shadow the photographs beside it get for
 * free — see the note on that class. Nothing here names a colour: the tile is
 * built entirely from the gold tokens, which the All Rounder edition repoints at
 * azure, so this renders blue there and warm in Signature without a branch.
 */
export function TrendTile({ tile }: { tile: MockTrendTile }) {
  return (
    <Link
      href={routes.newChat(tile.query)}
      className={cn(
        "tint-panel group flex h-full flex-col justify-between rounded-xl border border-gold-border p-5",
        "transition-[background-color,border-color,box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
      )}
    >
      {/* Where a piece count used to sit. The count described the destination;
          this says what happens when you tap — every one of these opens the
          assistant with the query already written, and that is worth marking on
          the tile rather than leaving as a surprise. A chip rather than a bare
          eyebrow because the same words repeat on all five: as a label it reads
          as a heading that forgot to change, as a mark it reads as a signature. */}
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gold-border bg-canvas/60 px-2.5 py-1">
        <Sparkles className="size-3 text-gold" aria-hidden="true" />
        <span className="text-eyebrow text-gold">Snapi AI</span>
      </span>

      <span className="mt-6">
        <span className="flex items-start gap-2 font-display text-2xl leading-[1.1] font-normal text-balance text-content sm:text-[1.75rem]">
          {tile.label}
          <ArrowUpRight
            className="mt-1.5 size-5 shrink-0 text-gold transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
        <span className="mt-2.5 block max-w-[34ch] text-[13px] leading-relaxed text-content-muted">
          {tile.caption}
        </span>
      </span>
    </Link>
  );
}
