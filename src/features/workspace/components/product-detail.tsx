"use client";

import { ArrowLeft, ArrowUpRight, Bookmark, Share2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { fitForTile, imageRatio } from "@/lib/media";
import type { MockProduct } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";
import type { ImageSource } from "@/types/media";

/**
 * One product, in the results pane.
 *
 * Reached by `?p=<slug>` on whatever workspace URL you were on, so an opened product
 * is a real location — shareable, refreshable, and dismissed by the browser's back
 * button as much as by the control at the top. That is why "Back to results" is a
 * `<Link>` and not a state reset: it goes somewhere, and it should behave like it.
 *
 * ## The gallery is one photograph and three empty frames
 *
 * Deliberate, and it is the honest state of the data: `MockProduct` carries a single
 * image. The remaining thumbnails render `MediaFrame`'s studio placeholder, which is
 * a designed surface rather than a gap — so the row demonstrates the interaction
 * without pretending to inventory that does not exist. Selecting an empty frame shows
 * an empty main plate, which is exactly what a listing with one photograph looks like.
 *
 * When the feed supplies a real gallery, the only change here is where `frames` comes
 * from; `active` and the thumbnail row already do the rest.
 *
 * ## Three actions, three weights
 *
 * Buy leads and leaves the site, because the merchant is where the transaction
 * actually happens today — it *is* the vendor link rather than a separate control, and
 * it carries the external mark to say so.
 *
 * Cart, Save and Share sit *beside* it as three glyphs, not beneath it as three
 * labelled buttons. Stacked and labelled they made a column of four controls of equal
 * size, and a page with four equal calls to action has none. Reduced to icons on Buy's
 * own line, the hierarchy states itself: one thing to do, three things you may also do.
 *
 * The vendor URL was printed as text under the actions and has been removed: Buy names
 * the merchant and goes there, so the line restated a destination the button already
 * gave. `product.vendorUrl` is still what Buy points at — the address did not go away,
 * only the second copy of it.
 */
export function ProductDetail({
  product,
  backHref,
  related,
  relatedHref,
}: {
  product: MockProduct;
  /** The workspace URL without `?p=` — where "Back to results" goes. */
  backHref: string;
  /**
   * ⚠️ What fills "More from this vendor" — and it is *not* filtered by vendor.
   *
   * These are the other products in the current results, whatever house or seller they
   * came from, so the merchant printed on each card will usually disagree with the
   * merchant named in the heading. That is a deliberate placeholder and a visible one:
   * there is no per-vendor inventory in the fixture to draw from, and inventing nine
   * more products to make the heading true would be more mock data to throw away.
   *
   * The fix when real data lands is one filter at the call site — nothing in this
   * component assumes the list is unrelated.
   */
  related: MockProduct[];
  /** Builds the `?p=` URL for a related product. */
  relatedHref: (slug: string) => string;
}) {
  /**
   * Four frames: the real photograph, then three placeholders.
   *
   * Built here rather than in the data because it is a *presentation* decision about
   * missing content, not a fact about the product. The day `product.gallery` exists,
   * this becomes that array and nothing else moves.
   */
  const frames: Array<ImageSource | null> = React.useMemo(
    () => [product.image, null, null, null],
    [product.image],
  );

  /**
   * All three pieces of state are per-product, and none of them is reset here.
   *
   * The caller keys this component on the product's id, so moving from one product to
   * another remounts it and every state below starts fresh — the selected thumbnail,
   * whether it is saved, whether it is in the cart. Syncing them in an effect instead
   * would be three `setState` calls that React's own lint rule rejects, and it would
   * get the cart wrong: carrying "in your cart" across to a different product is not
   * a stale index, it is a false statement.
   */
  const [active, setActive] = React.useState(0);
  // Inert, like the pills and the composer: the action is not unavailable to this
  // user, it simply is not built. Kept as local state rather than a dead click so the
  // button confirms it heard you, which is the part that makes a prototype legible.
  const [saved, setSaved] = React.useState(false);
  const [inCart, setInCart] = React.useState(false);

  const mainImage = frames[active] ?? null;
  const price = formatPrice(product.price.amount, {
    currency: product.price.currency,
    showDecimals: product.price.amount % 100 !== 0,
  });

  /**
   * The lot number, taken from the product's id.
   *
   * Derived rather than stored, because a lot number is a *catalogue* artefact and the
   * catalogue is this page — the product does not carry one any more than it carries a
   * page number. Stable per product either way, which is the only property that
   * matters: a number that changed between visits would be worse than none.
   *
   * Falls back to the raw id if it holds no digits, so an id scheme change degrades to
   * something odd rather than to "Lot NaN".
   */
  const lotNumber = (product.id.match(/\d+/)?.[0] ?? product.id).padStart(2, "0");

  return (
    <div className="pb-4">
      <Link
        href={backHref}
        className={cn(
          "inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-content-muted",
          "transition-colors duration-200 hover:text-content",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to results
      </Link>

      {/* ── The lot line ─────────────────────────────────────────────────────
          Ruled top and bottom, with the lot number and the house at opposite ends —
          the way an auction catalogue heads an entry. It is the single cheapest thing
          that changes the register of the whole page: the same product under a lot
          line reads as a piece with provenance rather than as a row in a database.

          The badge sits inside it, because "Archive" or "Verified" is exactly the sort
          of note a catalogue carries beside a lot number rather than as a sticker on
          the photograph. */}
      <div className="mt-6 border-y border-border py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-eyebrow tabular flex items-center gap-2.5 text-content-subtle">
            Lot {lotNumber}
            {product.badge ? (
              <>
                <span className="h-px w-4 bg-border-strong" aria-hidden="true" />
                <span className="text-gold">{product.badge}</span>
              </>
            ) : null}
          </p>

          <p className="text-eyebrow truncate text-content-muted">{product.brand}</p>
        </div>
      </div>

      {/* The name under the lot line, not inside it. A catalogue gives the house one
          line and the piece the next, at a different size — that hierarchy is the
          format, and collapsing it into one row loses it. */}
      <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.1] font-normal tracking-[-0.01em] text-balance text-content">
        {product.name}
      </h2>

      {/* Exactly 64px between the plate and the detail, and getting that meant
          changing how the columns are sized rather than the gap alone.

          Fractional tracks with a capped image inside them cannot give a fixed gutter:
          the track was 434px wide holding a 384px plate, so 50px of slack sat between
          them and the *visible* gap was 98px however the gap property was set. An
          `auto` track sizes to the plate itself, which puts the whole gutter in one
          place where it can be set and measured.

          The plate steps 288 → 384px at `xl`. A fixed 384 across all of `lg` would
          leave the detail column at 171px on a 1024 laptop, where the chat panel has
          already taken 340 of the width — a two-column layout that only works on a
          large monitor is a one-column layout with a bug. */}
      <div className="mt-7 grid gap-y-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-16">
        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        <div className="min-w-0 lg:w-72 xl:w-96">
          <MediaFrame
            src={mainImage}
            alt=""
            focus={mainImage ? product.focus : undefined}
            fit={mainImage ? fitForTile(imageRatio(mainImage, product.ratio), 1) : "cover"}
            scrim={false}
            priority
            // Declared at the widths it actually renders at, not at a share of the
            // viewport. Over-declaring fetches a source larger than the box for no
            // gain, which is the opposite of the point of shrinking it.
            sizes="(min-width: 1280px) 384px, (min-width: 1024px) 288px, 92vw"
            className="aspect-square w-full rounded-xl shadow-premium"
          />

          {/* `role="tablist"` is the honest role: these switch which panel of the same
              object you are looking at, and that is what a tab is. Buttons alone would
              announce four unrelated controls with no sense that one is current. */}
          <div role="tablist" aria-label="Product images" className="mt-4 grid grid-cols-4 gap-3">
            {frames.map((frame, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={frame ? `Image ${index + 1}` : `Image ${index + 1} — not yet supplied`}
                onClick={() => setActive(index)}
                className={cn(
                  "relative rounded-lg",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <MediaFrame
                  src={frame}
                  alt=""
                  focus={frame ? product.focus : undefined}
                  fit={frame ? fitForTile(imageRatio(frame, product.ratio), 1) : "cover"}
                  scrim={false}
                  sizes="120px"
                  className={cn(
                    "aspect-square w-full rounded-lg transition-opacity duration-200",
                    index === active ? "opacity-100" : "opacity-60 hover:opacity-100",
                  )}
                />

                {/* Ring on an overlay, not a border: a border would sit inside the
                    rounded corner and resize the box, shifting the whole row by two
                    pixels every time you change thumbnail. */}
                {index === active ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-gold-solid ring-offset-2 ring-offset-canvas"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* ── Detail ──────────────────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* "Asking", not a bare number. A catalogue labels its figure, and on resale
              the label is honest in a way a price tag is not — this is what one seller
              wants for one piece, not a list price. */}
          <p className="text-eyebrow text-content-subtle">Asking</p>

          <p className="tabular mt-2 font-display text-[2.5rem] leading-none font-normal text-content">
            {price}
          </p>

          <p className="mt-3 text-[13px] text-content-subtle">
            Sold by <span className="text-content-muted">{product.merchant}</span>
          </p>

          {/* The match note keeps its gold rule from the card — it is the same claim,
              and changing its treatment between the grid and the page would make the
              reader wonder whether it is the same thing. */}
          <p className="mt-6 border-l-2 border-gold-border pl-3.5 text-sm leading-relaxed text-content-muted">
            {product.matchNote}
          </p>

          {/* ── Actions ─────────────────────────────────────────────────────
              One row: Buy takes the width it needs, the other three are icons at the
              end of it. They were three labelled buttons stacked underneath, which
              gave four full-width controls in a column — and four things the same size
              have no primary. Reduced to glyphs they read as what they are: the
              handful of things you can do *besides* buy it.

              `flex-wrap` with a floor on Buy's width, so on a narrow pane the icons
              drop to their own line rather than squeezing "Buy at Fashionphile" to two
              characters. */}
          <div className="mt-8 flex flex-wrap items-stretch gap-2.5">
            <a
              href={product.vendorUrl}
              // `noreferrer` alongside `noopener`: this leaves for a third party, and
              // the referrer would tell them which search led here.
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                // Grows to fill the row, but stops at 450px. Past that the label floats
                // in the middle of a very wide slab with the icons stranded far to the
                // right, and the pane is wider than that at `xl` and up.
                "inline-flex max-w-[450px] min-w-[13rem] flex-1 items-center justify-center gap-2 rounded-lg bg-gold-solid px-5 py-3",
                "text-sm font-semibold text-gold-content",
                "shadow-[var(--shadow-edge),var(--shadow-premium-sm)]",
                "transition-[background-color,box-shadow,transform] duration-200",
                "hover:bg-gold-solid-hover active:scale-[0.99]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              Buy at {product.merchant}
              {/* Marks the exit. A primary button that silently leaves the site is the
                  one interaction people describe as "it closed my page". */}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>

            {/* Cart and Save are toggles and say so by swapping to a tick and holding
                a gold tint; Share is a one-shot action, so it takes no `active` and
                gets no `aria-pressed` — a button that announces itself as pressed when
                it does not stay pressed is a lie to a screen reader.

                The labels did not disappear, they moved: each is the button's
                accessible name and its native tooltip, so the meaning is one hover or
                one screen-reader stop away rather than printed three times.

                Neither toggle swaps to a tick, which was the first attempt: two ticks
                side by side are indistinguishable, and the one thing an icon-only
                button cannot afford to lose is which thing it is. The bag stays a bag
                and fills in. */}
            <div className="flex shrink-0 items-stretch gap-2.5">
              <SecondaryAction
                icon={ShoppingBag}
                label={inCart ? "In cart" : "Add to cart"}
                active={inCart}
                onClick={() => setInCart((current) => !current)}
              />
              <SecondaryAction
                icon={Bookmark}
                label={saved ? "In list" : "Save"}
                active={saved}
                onClick={() => setSaved((current) => !current)}
              />
              {/* Inert for now, like the pills and the composer. */}
              <SecondaryAction icon={Share2} label="Share" />
            </div>
          </div>

          {/* ── Description ───────────────────────────────────────────────────
              Catalogue prose, then the facts. In that order because the prose is what
              makes you want it and the list is what makes you sure — reversing them
              opens the entry on a spec sheet.

              The rule and its spacing were on the vendor line that used to sit here.
              They belong to the *break* between buying and reading rather than to any
              one block, so they moved down with it rather than being deleted with it. */}
          <div className="mt-8 border-t border-border pt-7">
            <p className="text-eyebrow text-content-subtle">Description</p>

            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-content-muted">
              {product.description}
            </p>

            {/* A definition list, because that is what it is: labels bound to values.
                `<dl>` announces the pairing, where a grid of `<p>`s announces eight
                unrelated fragments.

                No row gap and hairlines between, so the labels read as a continuous
                column — the same discipline as the comparison table, and for the same
                reason: a gap turns one rule into a row of dashes. */}
            {product.details.length > 0 ? (
              <dl className="mt-6">
                {product.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="grid grid-cols-1 gap-x-6 border-t border-border py-3 sm:grid-cols-[8rem_1fr]"
                  >
                    <dt className="text-eyebrow pt-0.5 text-content-subtle">{detail.label}</dt>
                    <dd className="text-[13px] leading-relaxed text-content">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── More from this vendor ─────────────────────────────────────────────
          Full width, under both columns. The detail column runs out of content well
          before the plate does at this width, and the answer to a tall empty right-hand
          side is not to stretch what is there but to put something below it that the
          reader might actually want next.

          Five cards, and the current lot is never one of them — offering you the thing
          you are already looking at is the classic version of this section done badly.

          Each one navigates by `?p=`, so browsing the vendor swaps the lot in place
          rather than reloading the workspace.

          128px of space above it, and the size is the point: this is a *departure* from
          the lot, not the next paragraph of it. At the 56px it started with, the rail sat
          close enough to the details list to read as more of the same entry. The gap is
          what says the lot has finished, and at this size it does the job a page break
          would in print.

          96px on a narrow window, where the two columns have already stacked and the full
          gap is just scrolling. */}
      {related.length > 0 ? (
        <section aria-label={`More from ${product.merchant}`} className="mt-24 lg:mt-32">
          <div className="flex items-baseline justify-between gap-4 pb-4">
            <h3 className="text-eyebrow text-content-subtle">More from {product.merchant}</h3>
            <p className="tabular text-[11px] text-content-subtle">
              {related.length} {related.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          <div className="rule-fade mb-6 h-px" aria-hidden="true" />

          {/* Five across only at `xl`. Below that the pane is ~620px wide and five cards
              would be 108px each — narrower than the price they have to carry.

              There is deliberately no four-column step between `sm:3` and `xl:5`. Five
              pieces in four columns strands the fifth alone on a second row, which reads
              as a loading failure rather than a layout; three columns gives 3 + 2, which
              reads as the end of a catalogue row. It also keeps the card about 190px at
              `lg` — near the 184px it gets at `xl`, so the thumbnail does not grow as
              the window shrinks.

              `max-w-[90%]` is where the 10% comes from — the rail is narrowed rather
              than each card being given a fixed cap. One number, applied at every
              breakpoint, and the cards stay proportional to the pane instead of
              freezing at one size and then looking oversized on a narrow window and
              lost on a wide one. The gaps are fixed, so the cards actually take a
              little more than 10% of the cut: 184px → 164px at 1512. */}
          <ul className="grid max-w-[90%] grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-5">
            {related.map((item) => (
              <li key={item.id}>
                <VendorCard product={item} href={relatedHref(item.slug)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/**
 * A smaller product card, for the vendor rail.
 *
 * Deliberately not `ProductCard`. That one carries the match note behind a gold rule —
 * Snapi's argument for why it answers *your* brief — and repeating that argument for
 * five pieces the reader did not ask about would drown the lot they are actually
 * reading. This is a catalogue thumbnail: photograph, house, name, price, seller.
 *
 * The whole card is one link, because a product has one destination.
 */
function VendorCard({ product, href }: { product: MockProduct; href: string }) {
  const fit = fitForTile(imageRatio(product.image, product.ratio), 1);

  return (
    <Link
      href={href}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <MediaFrame
        src={product.image}
        alt=""
        focus={product.focus}
        fit={fit}
        scrim={false}
        sizes="(min-width: 1280px) 11vw, (min-width: 640px) 20vw, 42vw"
        className={cn(
          "aspect-square w-full rounded-lg shadow-premium-sm",
          "transition-[box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1 group-hover:shadow-premium",
        )}
      />

      <p className="text-eyebrow mt-3 truncate text-content-subtle">{product.brand}</p>

      {/* Two lines' worth of height whether the name needs them or not. Names run from
          "Tank Louis, 1978" to "Cashmere Storm System Coat", and letting the box collapse
          to one line pulls that card's price and seller up out of line with its
          neighbours — five cards, five different baselines, and a row that looks
          mis-set rather than varied.

          `2.7em` is exactly two lines at this `leading`, and both are stated here so
          changing one without the other is visibly wrong rather than quietly off. */}
      <p className="mt-1.5 line-clamp-2 min-h-[2.7em] text-[13px] leading-[1.35] font-semibold text-content transition-colors duration-300 group-hover:text-gold">
        {product.name}
      </p>

      <p className="tabular mt-1.5 text-[13px] font-semibold text-content">
        {formatPrice(product.price.amount, {
          currency: product.price.currency,
          showDecimals: product.price.amount % 100 !== 0,
        })}
      </p>

      <p className="mt-0.5 truncate text-[11px] text-content-subtle">{product.merchant}</p>
    </Link>
  );
}

/**
 * Cart, save and share — a glyph each, beside Buy rather than beneath it.
 *
 * ## Icon-only, and what has to hold instead of a label
 *
 * Three of these carrying words made a column of four equal buttons under a heading
 * that is trying to sell one thing. As glyphs they sit on Buy's own line and stop
 * competing with it. What a label was doing still has to be done, though, and it is
 * done three ways:
 *
 *  - `aria-label` is the accessible name, so a screen reader reads "Add to cart", not
 *    "button".
 *  - `title` gives a pointer user the same string on hover. That is a genuine tooltip
 *    rather than a decorative one — it is the only place the word exists on screen.
 *  - The glyph *fills* when the toggle is on, and the well takes a gold tint. Without
 *    some such change a toggled icon-only button looks identical to an untoggled one,
 *    which is the failure mode of every icon row ever shipped.
 *
 * What it explicitly does not do is swap the glyph for a tick. That was the first cut,
 * and with cart and save both on it produced two identical ticks in a row of three —
 * confirming that *something* had happened while destroying the only thing telling you
 * which button was which.
 *
 * `self-stretch aspect-square` takes the height from the row — which is to say from
 * the Buy button beside it — and the width from that. Nothing here states a size, so
 * the squares cannot drift out of alignment when Buy's padding changes.
 *
 * The toggles confirm in place rather than firing a toast. A toast for "saved" is a
 * second surface to dismiss for something the button itself can say, and the state is
 * the useful part: you can see it is already in your list next time you land here.
 *
 * `active` is optional, and its absence is what distinguishes a toggle from an action.
 * Share does something once and does not stay done, so it takes no `active` and
 * therefore no `aria-pressed` — omitting the attribute is the difference between "this
 * is a switch that is off" and "this is not a switch".
 */
function SecondaryAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** The accessible name and the tooltip. Not printed. */
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid aspect-square min-h-[2.75rem] place-items-center self-stretch rounded-lg border",
        "transition-[background-color,border-color,color] duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-gold-border bg-gold-subtle text-gold"
          : "border-border text-content-muted hover:border-border-strong hover:bg-surface hover:text-content",
      )}
    >
      {/* `fill-current` on a Lucide glyph fills the shape it outlines — a solid bag,
          a solid bookmark. Share never gets it: a one-shot action has no "on". */}
      <Icon
        className={cn("size-[18px] shrink-0", active ? "fill-current" : "")}
        aria-hidden={true}
      />
    </button>
  );
}
