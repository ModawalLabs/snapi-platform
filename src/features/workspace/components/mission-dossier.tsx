import Link from "next/link";
import * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { PRODUCT_CATEGORIES, type MockProduct, type ProductCategory } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";
import type { ImageSource } from "@/types/media";

/**
 * The mission, at the head of its own conversation.
 *
 * ## It is part of the thread, not a header above it
 *
 * This scrolls away. It sits as the first thing in the conversation column and the
 * messages follow it, so a few turns in it is gone — which is right, because it is the
 * *opening* of the conversation rather than a permanent frame around it. Pinned, it
 * would spend a third of the column forever on something the reader has already read.
 *
 * ## The photograph is a mark, not a spread
 *
 * It began as a full-bleed 4:3 band — 336px of picture at the top of a 448px column,
 * about a third of the visible height. It was the most expensive thing on the screen and
 * the least informative: the mission is already named in the workspace header, so the
 * image was confirming something the reader had read a second earlier.
 *
 * At 64px it does the one job worth doing — it is the same photograph as the card on the
 * board, so the column is visibly *this* mission — and it pays for itself twice by
 * sitting beside the collections rather than above them. That is the other half of the
 * change: the pills had a full-width row of their own under the picture, and they now
 * occupy the space the picture stopped taking.
 *
 * The name is *not* on the plate. It is in the workspace header a couple of inches
 * above, and printing it twice made the column open with the same words in two sizes.
 * `name` is still taken, for the section's accessible label — a landmark called
 * "mission overview" with no mission in it is no use to anyone navigating by regions.
 *
 * ## Nothing is invented
 *
 * The collections and the picks appear only once pieces have been filed. On a new
 * mission they are absent, not empty: a "0 collections" line and three blank plates
 * would be the interface describing its own scaffolding. What stands in their place is
 * one sentence beside the same small plate, which is the only useful thing to say at
 * that point.
 */
/** A shortlist, not a summary. Three survives a mission of any breadth. */
const PICK_LIMIT = 3;

export function MissionDossier({
  name,
  image,
  focus,
  added,
  productHref,
  onOpenCollection,
}: {
  name: string;
  image: ImageSource | null;
  focus?: string;
  /** What has been filed into this mission, in the results' ranking order. */
  added: MockProduct[];
  productHref: (slug: string) => string;
  /** Opens one collection in the results pane. Given the category the pill names. */
  onOpenCollection: (category: ProductCategory) => void;
}) {
  const collections = React.useMemo(() => {
    const tally = new Map<ProductCategory, number>();
    for (const product of added) {
      tally.set(product.category, (tally.get(product.category) ?? 0) + 1);
    }

    // Declaration order, so the strip does not reorder itself as pieces arrive.
    return PRODUCT_CATEGORIES.flatMap((category) => {
      const count = tally.get(category);
      return count ? [{ category, count }] : [];
    });
  }, [added]);

  /**
   * The three strongest pieces in the mission, whatever they are.
   *
   * It was one per collection, and that broke as the mission widened: six collections
   * gave six picks, which is not a shortlist — it is the collections strip again with
   * prices on it. Three is a shortlist, and it stays three however many shelves the
   * mission grows.
   *
   * No sort here. `added` arrives in the results' own ranking order, so the first three
   * *are* the top three — which also means the dossier can never rank a set differently
   * from the grid it came from.
   */
  const picks = added.slice(0, PICK_LIMIT);

  return (
    <section aria-label={`${name} — mission overview`} className="pb-5">
      {/* ── Plate and collections, on one row ──────────────────────────────
          `items-start`, not `items-center`: the pills wrap to a second line in a
          narrow column, and centring would then float the photograph half a line
          below the heading it belongs to. */}
      <div className="flex items-start gap-3.5">
        {/* Square, and `cover` with the focal point rather than `fitForTile`. The
            board's art is landscape and the rule would letterbox it — at 64px a
            letterboxed frame is a dark chip with a stamp in it. The `focus` value that
            steers the card's own 3:4 crop steers this one too, which is the point of
            it living on the photograph rather than on the layout. */}
        <MediaFrame
          src={image}
          alt=""
          focus={focus}
          fit="cover"
          scrim={false}
          sizes="64px"
          className="aspect-square w-16 shrink-0 rounded-lg shadow-premium-sm"
        />

        <div className="min-w-0 flex-1">
          {added.length === 0 ? (
            // One sentence rather than a scaffold. See the note on the component.
            <p className="text-[12px] leading-relaxed text-content-subtle">
              Add pieces from the results and Snapi files them by category — the collections and its
              picks appear here as you go.
            </p>
          ) : (
            <>
              {/* Counts rather than contents: the pane on the right holds the pieces,
                  and a second gallery in a 340px column would be the same content
                  twice at a worse size. This row is the *shape* of the mission —
                  three categories, nine pieces — and a way through to the rest. */}
              {/* The heading alone. A gold "See all 14" sat opposite it and has gone,
                  because the pills below are the better door: one control per
                  collection, landing on the collection it names, where "See all" landed
                  on a list of all six and left the reader to find the one they had just
                  been looking at. */}
              <h3 className="text-eyebrow text-content-subtle">Collections</h3>

              {/* No rule between the heading and the pills any more. It was there to
                  separate them from a full-width picture above; beside the plate the
                  row is already its own block, and a hairline inside a 64px-tall cell
                  is one line too many. */}
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {collections.map(({ category, count }) => (
                  <li key={category}>
                    {/* Each pill opens its own collection in the pane on the right —
                        so a count is not just a fact about the mission, it is the way
                        into the thing it counts.

                        The hover treatment is what makes that discoverable: the border
                        takes the accent and the label follows, which is the same
                        gesture every other openable thing in this app makes. A pill
                        that looks identical to a read-only tag is a control nobody
                        presses. */}
                    <button
                      type="button"
                      onClick={() => onOpenCollection(category)}
                      aria-label={`Open the ${category} collection · ${count} ${count === 1 ? "piece" : "pieces"}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1",
                        "text-[11px] whitespace-nowrap text-content",
                        "transition-[background-color,border-color,color] duration-200",
                        "hover:border-gold-border hover:bg-gold-subtle hover:text-content",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      )}
                    >
                      {category}
                      <span className="tabular text-content-subtle">{count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* No brief in here, and it *was* here until the column was read end to end:
          the conversation's own first message is the brief, sent as the user, two
          inches below this. Quoting it above the message that says it had the mission
          state its instruction twice before Snapi had answered once. */}

      {/* ── The picks ───────────────────────────────────────────────────────
          Numbered, ruled rows with a thumbnail — the index register the rest of the
          app uses for a ranked list. Not cards: three cards in this column is a
          scroll, and the reader is meant to take this in on the way past. */}
      {picks.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3 pb-2.5">
            <h3 className="text-eyebrow text-content-subtle">Snapi&rsquo;s picks</h3>
            {/* The count, now that the rule is not the interesting part. It says
                these are three of something larger, which is what stops the block
                reading as the whole mission. */}
            <p className="tabular text-[11px] text-content-subtle">
              Top {picks.length} of {added.length}
            </p>
          </div>

          <ol className="divide-y divide-border border-t border-border">
            {picks.map((product, index) => (
              <li key={product.id}>
                <Link
                  href={productHref(product.slug)}
                  className={cn(
                    "group flex items-center gap-3 py-2.5",
                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  )}
                >
                  <span
                    className="tabular w-4 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-content-subtle"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <PickPlate product={product} />

                  <span className="min-w-0 flex-1">
                    <span className="text-eyebrow block truncate text-content-subtle">
                      {product.brand}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] font-semibold text-content transition-colors duration-200 group-hover:text-gold">
                      {product.name}
                    </span>
                  </span>

                  <span className="tabular shrink-0 text-[12px] font-semibold text-content">
                    {formatPrice(product.price.amount, {
                      currency: product.price.currency,
                      showDecimals: product.price.amount % 100 !== 0,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* Closes the dossier and opens the conversation. The thread that follows is a
          different kind of content, and without a rule the first message reads as a
          fourth pick. */}
      <div className="rule-fade mt-6 h-px" aria-hidden="true" />
    </section>
  );
}

/**
 * A 36px specimen. Small enough to be sharp whatever the merchant uploaded.
 *
 * `cover`, where the grids use `fitForTile` and often land on `contain`. The rule
 * exists to stop a catalogue tile cropping a subject badly, and at 36px it inverts: a
 * letterboxed photograph in a square this small is a dark chip with a stamp in the
 * middle of it, and three of them down a column read as three missing images. `focus`
 * steers the crop where a centre one would cut the subject.
 */
function PickPlate({ product }: { product: MockProduct }) {
  return (
    <MediaFrame
      src={product.image}
      alt=""
      focus={product.focus}
      fit="cover"
      scrim={false}
      sizes="36px"
      className="aspect-square w-9 shrink-0 rounded-md shadow-premium-sm"
    />
  );
}
