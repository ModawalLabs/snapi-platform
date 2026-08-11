import Link from "next/link";

import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import { fitForTile, imageRatio } from "@/lib/media";
import type { MockProduct } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

/**
 * The tile every product is rendered into, as width ÷ height.
 *
 * Square, and fixed. The grid's alignment is the thing being protected — see
 * `fitForTile` — so this is the one dimension that never responds to the feed.
 */
const TILE_RATIO = 1;

/**
 * One product Snapi surfaced.
 *
 * The match note is the point of the card, not a caption. A grid of photographs
 * and prices is a search results page; the line explaining *why* this answers the
 * brief is the only thing that makes it an answer. It is given the gold rule and
 * held to two lines so it stays a claim rather than a paragraph.
 *
 * Caption below the image, matching The Edit and More For You — text on the canvas
 * in theme tokens, no scrim darkening the photography for the sake of legibility
 * it no longer needs.
 *
 * The whole card is one link: a product has a single destination, so there is
 * nothing to nest.
 */
export function ProductCard({ product }: { product: MockProduct }) {
  // Decided from the artwork's shape, not declared per product. A merchant feed
  // will not tell us how it wants to be cropped, and it should not have to.
  const fit = fitForTile(imageRatio(product.image, product.ratio), TILE_RATIO);

  return (
    <article className="group">
      <Link
        href={routes.product(product.slug)}
        className="flex h-full flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div className="relative">
          <MediaFrame
            src={product.image}
            alt=""
            focus={product.focus}
            fit={fit}
            scrim={false}
            sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            // Square, not the 3:4 these started at. In a pane that is only 70% of
            // the viewport and already sharing it with a conversation, a portrait
            // tile plus its caption pushed the second row entirely below the fold —
            // so the grid read as a column of one row. A quarter off the height
            // buys back the row without touching the column count.
            className="aspect-square rounded-lg shadow-premium-sm"
          />

          {/* Stays on the image: this is a property of the listing, not of the
              caption, and it has to survive the eye landing on the photo first.
              Fixed white-on-black glass rather than theme tokens — it sits on a
              photograph, which does not change with the theme. */}
          {product.badge ? (
            <span className="absolute top-2.5 right-2.5 rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-white/90 uppercase backdrop-blur-sm">
              {product.badge}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex min-w-0 flex-1 flex-col">
          <p className="text-eyebrow truncate text-content-subtle">{product.brand}</p>

          <h3 className="mt-1.5 text-sm leading-snug font-semibold text-balance text-content transition-colors duration-300 group-hover:text-gold">
            {product.name}
          </h3>

          <p className="tabular mt-1.5 text-sm font-semibold text-content">
            {/* Cents only when there are cents. "$14,850.00" on a Kelly reads like
                a utility bill; "$14,850" reads like a price tag. */}
            {formatPrice(product.price.amount, {
              currency: product.price.currency,
              showDecimals: product.price.amount % 100 !== 0,
            })}
            <span className="ml-2 text-[11px] font-normal text-content-subtle">
              {product.merchant}
            </span>
          </p>

          <p className="mt-2.5 line-clamp-2 border-l-2 border-gold-border pl-2.5 text-[12px] leading-relaxed text-content-muted">
            {product.matchNote}
          </p>
        </div>
      </Link>
    </article>
  );
}
