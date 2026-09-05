"use client";

import { ArrowLeft, ArrowUpRight, Bookmark, Check, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Cart } from "@/components/ui/icons";
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
 * The vendor URL was printed as text under the actions and has been removed: the
 * merchant is named under the price and Buy goes there, so the line restated a
 * destination the page already gave. Buy itself no longer prints the merchant either —
 * it is one word — but its accessible name still does. `product.vendorUrl` is what it
 * points at; the address did not go away, only the second copy of it.
 */
/**
 * The width of Buy, and therefore of the mission control under it.
 *
 * A constant rather than the same utility typed twice, because "the same width as Buy"
 * is a requirement of the layout and not a coincidence of two class lists. Written
 * twice, the two drift the first time one of them is adjusted.
 */
const ACTION_WIDTH = "w-[13.5rem]";

export function ProductDetail({
  product,
  backHref,
  related,
  relatedHref,
  inMissionWorkspace = false,
  inMission = false,
  onToggleMission,
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
  /**
   * Whether this product was reached from inside a mission, which is what renders the
   * filing control.
   *
   * A boolean rather than the mission's name, which is what it used to be. The name was
   * here because the button printed it, and the button no longer does — see the control
   * itself. Keeping the name for a test that only asks "is there one" would be a prop
   * that lies about what the component needs.
   */
  inMissionWorkspace?: boolean;
  /** Whether this piece is already filed into that mission. */
  inMission?: boolean;
  onToggleMission?: () => void;
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
      {/* ── The lot line ─────────────────────────────────────────────────────
          Ruled underneath only, the way an auction catalogue heads an entry. It is the
          single cheapest thing that changes the register of the whole page: the same
          product under a lot line reads as a piece with provenance rather than as a
          row in a database.

          The rule above it has gone. This row is the first thing in the pane, so that
          hairline had nothing above it to divide — it drew a line across the top of the
          scroll container and read as a border on the panel rather than as part of the
          entry. One rule, underneath, is what actually does the work: it closes the
          identifying strip and opens the lot.

          Everything in it is set to the left, and "Back to results" has come down off
          its own line to join it. That is worth two notes.

          The first is that the lot number and the house used to sit at opposite ends,
          which is the printed convention — but a catalogue page is a fixed measure and
          this pane is not. At the widths this actually renders at, the two ends were
          far enough apart to read as two unrelated captions rather than one line.
          Grouped, they read as what they are: a single identifying strip taken in with
          one movement of the eye. Grouped *left* they also start where everything below
          them starts — the piece's name, the photograph, the specification table all
          share that edge — so the entry has one margin instead of a header that hangs
          off the opposite side from its own content.

          The second is that the back link belongs in it, and that it leads. It is the
          only control in the row — the other two are labels — and on a left-set row it
          is the first thing read as well as the first thing reached for.

          The badge stays beside the lot number, because "Archive" or "Verified" is
          exactly the sort of note a catalogue carries there rather than as a sticker
          on the photograph.

          Hairlines between the three, not bullets: a bullet is punctuation inside a
          sentence, and these are three separate statements that happen to share a
          line. They are hidden below `sm`, where the row wraps and a rule ends up
          orphaned at the start of a line. */}
      <div className="border-b border-border py-3">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
          {/* Set in the rail's own register rather than as body copy. It was 13px
              medium, which next to two lines of tracked small caps read as a stray
              sentence that had wandered in. The arrow keeps it unmistakably a way
              back — the direction of travel is the one thing the type cannot say.

              Not `cn`, deliberately, and this is worth knowing about: `text-eyebrow`
              is a custom utility that sets a font *size*, so tailwind-merge reads it as
              a `text-` class in the same group as `text-content-subtle` and drops the
              earlier of the two. Through `cn` this link silently lost its small caps
              and rendered as sentence case beside two lines that were not. A plain
              string has no merge step to lose it to — which is also why the two
              siblings below are written the same way. */}
          <Link
            href={backHref}
            className="text-eyebrow inline-flex shrink-0 items-center gap-1.5 rounded-md text-content-subtle transition-colors duration-200 hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to results
          </Link>

          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />

          <p className="text-eyebrow tabular flex items-center gap-2.5 text-content-subtle">
            Lot {lotNumber}
            {product.badge ? (
              <>
                <span className="h-px w-4 bg-border-strong" aria-hidden="true" />
                <span className="text-gold">{product.badge}</span>
              </>
            ) : null}
          </p>

          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />

          <p className="text-eyebrow text-content-muted">{product.brand}</p>
        </div>
      </div>

      {/* The name under the lot line, not inside it. A catalogue gives the house one
          line and the piece the next, at a different size — that hierarchy is the
          format, and collapsing it into one row loses it. */}
      <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.1] font-normal tracking-[-0.01em] text-balance text-content">
        {product.name}
      </h2>

      {/* Two fifths photograph, three fifths words.

          `2fr_3fr` rather than `40%_60%`, and the difference is the gutter: two
          percentage tracks plus a gap add up to more than the container and the row
          overflows. Fractional tracks divide what is *left* after the gap, so the
          split stays 40/60 of the usable measure at every width, which is what the
          ratio was asked for.

          The plate used to be a fixed 288 → 384px in an `auto` track, sized to itself
          so the gutter could be pinned at exactly 64px. It is proportional now, so it
          grows with the pane instead of stranding a small square in a wide column —
          and the gutter comes down to 48px, because a fixed gap that was set against a
          384px plate reads as a canyon beside one half again as wide. */}
      <div className="mt-7 grid gap-y-8 lg:grid-cols-[2fr_3fr] lg:gap-x-12">
        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        <div className="min-w-0">
          <MediaFrame
            src={mainImage}
            alt=""
            focus={mainImage ? product.focus : undefined}
            fit={mainImage ? fitForTile(imageRatio(mainImage, product.ratio), 1) : "cover"}
            scrim={false}
            priority
            // A share of the viewport now that the plate is a share of the pane.
            // The results column is roughly two thirds of the window at `lg` and up
            // and the plate is two fifths of that, which lands near 26vw.
            sizes="(min-width: 1024px) 26vw, 92vw"
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
              One row: Buy at a fixed width, the other three are icons at the end of
              it. They were three labelled buttons stacked underneath, which gave four
              full-width controls in a column — and four things the same size have no
              primary. Reduced to glyphs they read as what they are: the handful of
              things you can do *besides* buy it.

              Buy is one word now and no longer grows to fill the row. It read "Buy at
              Fashionphile" across up to 450px, which made the loudest element on the
              page also the widest — and the merchant is already named two lines above
              under "Sold by". The link still says where it goes, in its accessible
              name, so nothing was lost to anyone who cannot see that line.

              `flex-wrap`, so on a narrow pane the icons drop to their own line rather
              than compressing the button. */}
          <div className="mt-8 flex flex-wrap items-stretch gap-2.5">
            <a
              href={product.vendorUrl}
              // `noreferrer` alongside `noopener`: this leaves for a third party, and
              // the referrer would tell them which search led here.
              target="_blank"
              rel="noopener noreferrer"
              // Names the destination for anyone who cannot see "Sold by" above.
              // The visible word is "Buy"; the link's purpose is the whole sentence.
              aria-label={`Buy at ${product.merchant}`}
              className={cn(
                ACTION_WIDTH,
                "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-solid px-5 py-3",
                "text-sm font-semibold text-gold-content",
                "shadow-[var(--shadow-edge),var(--shadow-premium-sm)]",
                "transition-[background-color,box-shadow,transform] duration-200",
                "hover:bg-gold-solid-hover active:scale-[0.99]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              Buy
              {/* Marks the exit. A primary button that silently leaves the site is the
                  one interaction people describe as "it closed my page". */}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>

            {/* Cart and Save are toggles and say so by filling in and holding a gold
                tint; Share is a one-shot action, so it takes no `active` and gets no
                `aria-pressed` — a button that announces itself as pressed when it does
                not stay pressed is a lie to a screen reader.

                The labels did not disappear, they moved: each is the button's
                accessible name and its native tooltip, so the meaning is one hover or
                one screen-reader stop away rather than printed three times.

                Neither toggle swaps to a tick, which was the first attempt: two ticks
                side by side are indistinguishable, and the one thing an icon-only
                button cannot afford to lose is which thing it is. Each glyph keeps its
                own shape and fills. The cart is drawn rather than Lucide's, whose
                wheels are solid where everything around them is outlined — see where it
                is drawn. */}
            <div className="flex shrink-0 items-stretch gap-2.5">
              <SecondaryAction
                icon={Cart}
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

          {/* ── Filing into the mission ────────────────────────────────────────
              Directly under Buy and exactly as wide, which is the point of
              `ACTION_WIDTH` existing: these two are the column of decisions, and a
              second button half a centimetre out of line with the first is the kind of
              thing you cannot un-see once you have seen it.

              Rendered only when the reader arrived from a mission. It is a *labelled*
              button rather than a fourth icon: adding to a mission is the action this
              whole surface exists to support when you are inside one, and a glyph
              among three others is not where you put the thing the page is for.

              Outlined rather than filled, because Buy is the filled one. Two solid
              gold buttons stacked would be two primaries, which is none.

              The label does not name the mission. It carried it — "Add to A winter
              coat that isn't black" — and a button whose label is a whole sentence
              stops reading as a button; it also had to be truncated, so the long
              briefs it was there to show were the ones it cut off. The mission is
              named in the header of the workspace you are standing in, so the button
              only has to say what it does. */}
          {inMissionWorkspace ? (
            <button
              type="button"
              onClick={onToggleMission}
              aria-pressed={inMission}
              className={cn(
                ACTION_WIDTH,
                "mt-3 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5",
                "text-[13px] font-semibold",
                "transition-[background-color,border-color,color] duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                inMission
                  ? "border-gold-border bg-gold-subtle text-gold"
                  : "border-border-strong text-content hover:border-gold-border hover:bg-gold-subtle/50",
              )}
            >
              {inMission ? (
                <Check className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <Plus className="size-4 shrink-0" aria-hidden="true" />
              )}
              {inMission ? "Added to mission" : "Add to mission"}
            </button>
          ) : null}

          {/* ── Description ───────────────────────────────────────────────────
              Catalogue prose. The facts that used to follow it here are now the
              specification table under both columns — same order, prose then facts,
              just no longer crammed into the narrower half of the page.

              The rule and its spacing were on the vendor line that used to sit here.
              They belong to the *break* between buying and reading rather than to any
              one block, so they moved down with it rather than being deleted with it. */}
          <div className="mt-8 border-t border-border pt-7">
            <p className="text-eyebrow text-content-subtle">Description</p>

            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-content-muted">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Specification ─────────────────────────────────────────────────────
          Full width under both columns, where it used to be a single column of rows
          stacked under the description.

          Two reasons it moved. The list is now eight facts rather than four, and eight
          rows in the narrower of two columns is a ladder that pushes the vendor rail a
          screen further down. And it is *reference* rather than argument — the prose
          above is what makes you want the piece, this is what you check before you buy
          it — so it belongs where the entry stops being a pitch, across the whole
          measure, like the specification block at the foot of a catalogue entry.

          Four rows of two, filled across. The order is the fixture's and it is not
          arbitrary: the four facts the entry has always carried take the top two rows,
          the four added with this table take the bottom two. So the upper half is the
          object — what it is made of, how big, what state, what comes with it — and the
          lower half is its history: colour and origin, year and who stands behind it.
          A reader who only wants to know whether it is real reads the last line.

          Still a `<dl>` rather than a `<table>`. These are names bound to values, which
          is what a definition list is for; a real table would announce four columns
          because that is what the markup would contain, and a screen reader would read
          the grid instead of the pairs. `<dl>` gives the pairing to the reader and the
          two columns to the eye, which is the correct division of labour. */}
      {product.details.length > 0 ? (
        <section aria-label="Specification" className="mt-16">
          <h3 className="text-eyebrow pb-4 text-content-subtle">Specification</h3>

          {/* The rules make the table, so they have to be complete and they have to not
              double up. Every cell draws its own bottom hairline; only the cells in the
              left column draw the vertical one, and `odd` is what selects them because
              a two-column row-major grid puts children 1, 3, 5, 7 on the left.

              Below `sm` the grid is one column, so the vertical rule is dropped with
              it — a divider down the side of a single stack is a border, not a table.
              The padding goes with it for the same reason. */}
          <dl className="grid grid-cols-1 border-t border-border sm:grid-cols-2">
            {product.details.map((detail) => (
              <div
                key={detail.label}
                className={cn(
                  "grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-5 border-b border-border py-3.5",
                  "sm:odd:border-r sm:odd:border-border sm:odd:pr-8 sm:even:pl-8",
                )}
              >
                <dt className="text-eyebrow pt-0.5 text-content-subtle">{detail.label}</dt>
                <dd className="text-[13px] leading-relaxed text-content">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

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
