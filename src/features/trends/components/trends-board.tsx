import { TrendCard, TrendTile } from "@/features/trends/components/trend-card";
import { mockTrendItems, type TrendShape } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * `/trends` — Trending Now, as a bento mosaic.
 *
 * ## Why a mosaic here and not the other two answers
 *
 * This is the third mixed-shape problem in the app and it gets a third answer,
 * because the constraints differ. The promo rail fixed *height* and let width run,
 * since a horizontal scroll has width to spare. The workspace results grid fixed
 * the *tile* and cropped into it, because those cards are read across for
 * comparison and alignment mattered more than fidelity. A full page constrains
 * neither axis — so shape variety stops being something to absorb and becomes the
 * composition itself.
 *
 * ## Photographs only go in cells shaped like photographs
 *
 * Merchant product imagery is portrait or square. So only `portrait` and
 * `standard` cells hold a picture; the wide cell exists solely as `band`, which
 * carries type. That constraint is what the whole composition is built around —
 * scale and drama come from the *typographic* cells rather than from blowing a
 * 3:4 product shot up into a 2.7:1 slot, which can only ever crop it to ribbons.
 *
 * ## The grid
 *
 * Six columns and a fixed row unit at `lg`; every card spans a whole number of
 * both. That is what keeps the mosaic locked: rows cannot go ragged because
 * nothing is sized by its own content.
 *
 * There is deliberately **no `grid-auto-flow: dense`**. Dense packing fills holes
 * by pulling later cards forward, which decouples what you see from the DOM order
 * a keyboard and a screen reader follow — the third card visually becomes the
 * seventh in the tab order. Instead the sequence in `mockTrendItems` is authored
 * so each run tiles its rows exactly, and order *is* the layout.
 *
 * ## The header is a cell
 *
 * The title sits in the grid as the first tile rather than in a band above it, so
 * the page opens with type and photography side by side and the mosaic starts at
 * the very top. It is the one cell with no border and no background — which is
 * what makes it read as the page's voice rather than as another card.
 *
 * A Server Component: it is a list of links, and nothing here reacts.
 */

/**
 * The span vocabulary, in one place.
 *
 * Written out per breakpoint rather than composed from a variable, because
 * Tailwind scans source text — `col-span-${n}` is invisible to the compiler and
 * the class is never generated.
 *
 * Below `lg` the shapes stop being literal, and `band` collapses to a normal cell.
 * That is not a cosmetic simplification — it is what keeps the grid closed. At
 * four columns a 4-wide card cannot sit beside anything, so every one of them
 * forces a full-width break and strands whatever was mid-row. Narrow it, and
 * every card is the same width and they pair off cleanly.
 *
 * `portrait` is exactly two `standard`s tall for the same reason: it lets one
 * portrait sit alongside a stack of two, which is the pairing the whole sequence
 * relies on.
 */
const SPAN: Record<TrendShape, string> = {
  portrait: "col-span-1 row-span-4 sm:col-span-2 sm:row-span-4 lg:col-span-2 lg:row-span-4",
  standard: "col-span-1 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2",
  band: "col-span-1 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-4 lg:row-span-2",
};

export function TrendsBoard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="container-page py-8 sm:py-10 lg:py-12">
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6",
          // The row unit. Every span is a multiple of it, so the mosaic's
          // proportions are set here and nowhere else.
          // 7.5rem at `lg` is not arbitrary: it is the value that makes a
          // 2×2 cell land at ~1.39 and a 2×4 at ~0.67 — the two shapes real
          // product photography actually arrives in.
          "auto-rows-[5.5rem] sm:auto-rows-[6.5rem] lg:auto-rows-[7.5rem]",
        )}
      >
        {/* The masthead cell. Same span as a portrait card, so it sits flush
            with the two portraits beside it and the first run closes exactly. */}
        <header
          className={cn(
            "flex flex-col justify-end pr-2 pb-1 sm:pr-4",
            // Only at `lg` does the masthead sit *inside* the opening run — one
            // column of type against two portraits, closing it exactly. Below
            // that it goes full width and the photographs drop underneath: a
            // 171px column cannot hold a display heading, and a half-width
            // masthead would also strand the other half of its row.
            "col-span-2 row-span-2 sm:col-span-4 sm:row-span-2 lg:col-span-2 lg:row-span-4",
          )}
        >
          <p className="text-eyebrow text-gold">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.04] font-normal tracking-[-0.01em] text-balance text-content">
            {title}
          </h1>
          <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-content-muted">
            {description}
          </p>
        </header>

        {mockTrendItems.map((item) => (
          <div key={item.id} className={SPAN[item.shape]}>
            {item.kind === "product" ? <TrendCard product={item} /> : <TrendTile tile={item} />}
          </div>
        ))}
      </div>
    </div>
  );
}
