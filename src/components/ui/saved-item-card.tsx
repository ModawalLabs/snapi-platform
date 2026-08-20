import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import type { MockSavedItem } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";

/**
 * One saved piece, as a tile in the grid.
 *
 * The card itself is **not** a link. Two separate destinations live inside it —
 * the piece's own page and the purchase action — and nesting an anchor inside an
 * anchor is invalid HTML that browsers resolve unpredictably. So the title is the
 * link to the detail page, "Buy now" is its own, and the card is a plain
 * container whose hover state is driven by `group`.
 *
 * ## What a 218px tile can hold
 *
 * Brand, name, price, when it was saved, and the two actions. The specifics line
 * that the wide row carried — colour, material, size — is gone: it is a reference
 * fact for a page you are reading rather than a tile you are scanning, and at this
 * width it was the single biggest driver of card height.
 *
 * `h-full` with the price block on `mt-auto` is what keeps the grid legible. Names
 * run to one or two lines, so without it the prices sit at three different heights
 * across a row and the eye has nowhere to run.
 *
 * Price comes from `formatPrice`, which takes integer minor units. The temptation
 * is to store `2190.00` and print it directly; that is how totals end up a cent
 * out and how the first non-USD market breaks.
 */
export function SavedItemCard({
  item,
  onRemove,
  dateLabel = "Saved",
  subject = "list",
}: {
  item: MockSavedItem;
  onRemove?: () => void;
  /** Prefixes the date. "Saved" on the list, "Added" in the cart. */
  dateLabel?: string;
  /** Names the collection in the remove button's label — "from your cart". */
  subject?: string;
}) {
  return (
    <article
      className={[
        "group flex h-full flex-col rounded-lg border border-border bg-surface p-2.5",
        "transition-[background-color,border-color,box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-gold-border hover:shadow-premium-sm",
      ].join(" ")}
    >
      <div className="relative">
        {/* 4:5, not the row's 3:4. Garments are photographed upright either way,
            but at a fifth of the content width the taller crop adds ~50px of
            height per card and three rows of it is a screenful. */}
        <MediaFrame
          src={item.image}
          alt=""
          focus={item.focus}
          scrim={false}
          sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 30vw, 45vw"
          className="aspect-[4/5] w-full rounded-md"
        />

        {/* On the photograph rather than in a text row: a tile this size has no
            spare line, and the corner of the image is dead space in every product
            grid ever made. Fixed white-on-black glass rather than theme tokens,
            because it sits on a photograph and a photograph does not lighten
            because the UI did.

            ## Revealed on hover, but never only on hover

            Hidden at rest so a page of ten tiles is ten photographs rather than ten
            photographs and ten delete buttons. That is a real gain — but a
            hover-only control does not exist on a touch screen, where there is no
            hover to give, and "remove" is not a power-user extra you can afford to
            lose. So it comes back three ways:

              - `group-hover` — the intended reveal, on a pointer.
              - `group-focus-within` and `focus-visible` — a keyboard user tabbing
                the grid can see what they have landed on. Without these the button
                is reachable and invisible, which is worse than either.
              - `(hover: none)` — permanently visible on touch. This is the one that
                keeps the feature from silently disappearing on a phone.

            Opacity alone, no `pointer-events` guard: reaching it with a pointer
            means hovering the card, which has already revealed it, so there is no
            invisible target to click by accident. */}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from your ${subject}`}
            title={`Remove from ${subject}`}
            className={[
              "absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full",
              "border border-white/20 bg-black/40 text-white/90 backdrop-blur-sm",
              "opacity-0 transition-[background-color,color,opacity] duration-200",
              "group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100",
              "[@media(hover:none)]:opacity-100",
              "hover:bg-danger hover:text-white",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            ].join(" ")}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <p className="text-eyebrow text-content-subtle">{item.brand}</p>

        <h2 className="mt-1.5 text-[13px] leading-snug font-semibold">
          <Link
            href={routes.product(item.slug)}
            // Two lines then clipped. Uncapped, one long name pushes its own
            // price out of line with the rest of the row; one line would truncate
            // most of the register's pieces mid-word.
            className="line-clamp-2 rounded-sm text-content transition-colors duration-300 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {item.name}
          </Link>
        </h2>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="min-w-0">
            <p className="tabular text-sm font-semibold text-content">
              {/* Cents only when there are cents. "$1,050.00" on a luxury piece
                  reads like a utility bill; "$1,050" reads like a price tag. The
                  modulo is the test — nothing is hardcoded, so an odd amount still
                  prints its decimals. */}
              {formatPrice(item.price.amount, {
                currency: item.price.currency,
                showDecimals: item.price.amount % 100 !== 0,
              })}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-content-subtle">
              {/* `<time>` with a machine-readable datetime — the visible string is
                  formatted for people, this is what a parser reads. */}
              {dateLabel} <time dateTime={item.savedAt}>{formatDate(item.savedAt)}</time>
            </p>
          </div>

          <Link
            href={routes.product(item.slug)}
            aria-label={`Buy ${item.name}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-sm pb-0.5 text-[12px] font-semibold whitespace-nowrap text-gold transition-colors duration-300 hover:text-gold-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Buy
            <ArrowRight
              className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
