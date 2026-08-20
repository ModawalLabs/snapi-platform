import { ArrowLeft, ArrowRight, Repeat2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import { fitForTile, imageRatio } from "@/lib/media";
import type { MockProduct } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Two to five products, column by column, with Snapi's call at the top.
 *
 * ## The verdict leads, and the rows are its working
 *
 * The recommendation is why someone pressed Compare. Putting it under a table makes
 * them do the reading the assistant was supposed to do, so it sits first, set in the
 * display serif at headline size, and everything below it is evidence for a claim
 * already made.
 *
 * ## One grid, `[label | ×n]`
 *
 * That is what makes it a comparison rather than five products near each other: every
 * attribute is on one baseline across all of them, and the eye reads across a row
 * instead of up and down five lists. Separate cards cannot do that at any amount of
 * effort, which is why the columns are tracks of one grid and not components.
 *
 * The track list is built from the count at runtime — `--compare-cols` set inline,
 * consumed by a `lg:` class — because Tailwind cannot author `repeat(4, …)` for a
 * number it does not know at build time. It only applies from `lg`: below that the label column
 * disappears and every row restacks into labelled pairs, since a six-column table in a
 * pane that is 70% of a phone is four characters wide.
 *
 * ## Two things went when the second product became five
 *
 * The `vs` glyph on the spine, which only ever meant "two" — with five columns it
 * would have to appear four times and would be saying nothing each time. And the plate
 * beside its identity: at five columns there is no room for a photograph next to text,
 * so the artwork stacks above the name.
 *
 * ## What it can compare, and what it cannot
 *
 * Price, seller, condition marker and the match note — which is everything
 * `MockProduct` carries. Only the price row is genuinely *comparative*, so it gets the
 * computed gap against the pick and the cheapest column marked.
 *
 * That is thinner than a comparison wants to be, and it is worth naming: condition,
 * size, materials, delivery and returns are the rows a buyer actually decides on, and
 * none of them exist on the product yet. When they do, they belong here as more `Row`s,
 * and the verdict below should read them instead of inferring from price alone.
 */
export function ProductComparison({
  products,
  onBack,
  onChangeSelection,
  onRemove,
}: {
  /** Two to five. The caller enforces the range; this renders whatever it is handed. */
  products: MockProduct[];
  onBack: () => void;
  onChangeSelection: () => void;
  /**
   * Drops one column. The caller decides what happens when that leaves fewer than two
   * — a table of one is not a comparison, and this component does not pretend to know
   * where the reader should go instead.
   */
  onRemove: (id: string) => void;
}) {
  const verdict = buildVerdict(products);

  return (
    <div className="pb-4">
      {/* ── Chrome ──────────────────────────────────────────────────────────
          Back first and on the left, where every back control in the world is.
          "Change selection" is the quieter sibling: it returns you to the grid with
          every pick intact, which is what you want after deciding one of them was
          wrong — going all the way back and starting over is the same journey with
          an extra step. */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-content-muted",
            "transition-colors duration-200 hover:text-content",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to results
        </button>

        <button
          type="button"
          onClick={onChangeSelection}
          className={cn(
            "inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-content-subtle",
            "transition-colors duration-200 hover:text-gold",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <Repeat2 className="size-4" aria-hidden="true" />
          Change selection
        </button>
      </div>

      {/* ── The verdict ─────────────────────────────────────────────────────
          A tinted panel rather than bare type: this is the one block on the page
          that is Snapi speaking rather than the catalogue reporting, and the tint is
          what separates an opinion from a specification.

          Two columns from `sm`: the argument on the left, the piece itself on the
          right. The plate is 240px against the table's 132 — a deliberate gap, and it
          is what makes this a *verdict* rather than a sixth column. A recommendation
          about a photograph you cannot see is a recommendation you have to go and
          check.

          The copy leads and the artwork follows, not the other way round. Putting the
          plate first would push the headline off the panel's left edge and out of
          alignment with the table below it, and that shared left margin is most of why
          the page reads as one document. */}
      <div className="rounded-2xl border border-gold-border bg-gold-subtle/60 p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-eyebrow flex items-center gap-2 text-gold">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Snapi&rsquo;s pick of {products.length}
            </p>

            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.1] font-normal tracking-[-0.01em] text-balance text-content">
              {verdict.headline}
            </h2>

            <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-content-muted">
              {verdict.body}
            </p>

            <p className="mt-2.5 max-w-[62ch] text-[13px] leading-relaxed text-content-subtle">
              {verdict.caveat}
            </p>

            <Link
              href={routes.product(verdict.pick.slug)}
              className={cn(
                "mt-5 inline-flex items-center gap-2 rounded-md bg-gold-solid px-4 py-2.5 text-[13px] font-semibold text-gold-content",
                "transition-colors duration-200 hover:bg-gold-solid-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              {/* Names the piece rather than saying "Buy now". The reader has several
                  products in front of them and a generic label would make them look
                  back up to work out which one this buys. */}
              Buy {withArticle(verdict.pick.brand)}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <PickPlate product={verdict.pick} />
        </div>
      </div>

      {/* ── The table ───────────────────────────────────────────────────────
          No row gap, and padding inside the cells instead. That is what lets the
          column rules exist: a continuous hairline down a column's leading edge needs
          its cells to *touch*, and any `gap-y` breaks the line into dashes. It is also
          how every printed table has ever worked. */}
      <div
        className={cn(
          "mt-10 grid grid-cols-1",
          "lg:grid-cols-[5rem_repeat(var(--compare-cols),minmax(0,1fr))]",
          "xl:grid-cols-[6rem_repeat(var(--compare-cols),minmax(0,1fr))]",
        )}
        style={{ "--compare-cols": products.length } as React.CSSProperties}
      >
        {/* Empty label cell above the plates. Present rather than omitted: the grid
            needs the column to exist for every row below to line up with it. */}
        <div className="hidden lg:block" aria-hidden="true" />

        {products.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              "pb-6 lg:pr-3 xl:pr-4",
              index > 0 && "lg:border-l lg:border-border lg:pl-3 xl:pl-4",
            )}
          >
            <Plate
              product={product}
              isPick={verdict.pick.id === product.id}
              onRemove={() => onRemove(product.id)}
            />
          </div>
        ))}

        <Row
          label="Price"
          differs={varies(products, (p) => `${p.price.currency}${p.price.amount}`)}
        >
          {products.map((product) => (
            <PriceValue
              key={product.id}
              product={product}
              gap={verdict.gapFrom(product)}
              isPick={verdict.pick.id === product.id}
            />
          ))}
        </Row>

        <Row label="Where to buy" differs={varies(products, (p) => p.merchant)}>
          {products.map((product) => (
            <span key={product.id} className="text-sm text-content">
              {product.merchant}
            </span>
          ))}
        </Row>

        <Row label="Condition" differs={varies(products, (p) => p.badge ?? "—")}>
          {products.map((product) => (
            // An em dash, not "None" or an empty cell. A blank reads as data that
            // failed to load; a dash reads as a fact — there is no marker on this
            // listing.
            <span key={product.id} className="text-sm text-content">
              {product.badge ?? "—"}
            </span>
          ))}
        </Row>

        <Row label="Why it fits">
          {products.map((product) => (
            <span
              key={product.id}
              className="block border-l-2 border-gold-border pl-3 text-[13px] leading-relaxed text-content-muted"
            >
              {product.matchNote}
            </span>
          ))}
        </Row>
      </div>
    </div>
  );
}

/**
 * The pick's own plate, in the verdict panel.
 *
 * ## Bigger than the table, and by enough to be deliberate
 *
 * 240px against the table's 132. A plate only slightly larger reads as a mistake in
 * one of the two places; at nearly double it reads as a hierarchy. It is capped rather
 * than fluid, because past ~240px a merchant's own photograph starts upscaling and the
 * one thing worse than a small product shot is a soft large one.
 *
 * Full width on a phone, where there is no second column to sit beside and a 240px
 * square floating in a 390px panel looks stranded.
 *
 * ## Framed, not ringed
 *
 * The table marks the pick with a gold ring, because there it has four neighbours to be
 * distinguished from. Here it is the only product on the panel and the eyebrow already
 * says whose pick it is, so a ring would be the third thing saying one thing. It gets a
 * hairline and a real shadow instead — the panel is tinted, and a photograph laid on a
 * tint with no edge looks like it is sinking into it.
 *
 * ## The price sits on the artwork
 *
 * A glass chip in the corner, in fixed white-on-black: it is on a photograph, and a
 * photograph does not lighten because the UI did. The body copy states the price too,
 * in a sentence — this is the version you can read without reading, and the one that
 * survives the reader skipping straight to the picture.
 *
 * `alt=""`, because the headline beside it names the piece. Describing the photograph
 * as well would have a screen reader announce the same product twice.
 */
function PickPlate({ product }: { product: MockProduct }) {
  return (
    <div className="relative w-full shrink-0 sm:w-52 lg:w-60">
      <MediaFrame
        src={product.image}
        alt=""
        focus={product.focus}
        // `cover`, where the table plates use `fitForTile` and often land on `contain`.
        // The deviation is deliberate and it is about role rather than taste: a
        // catalogue thumbnail may letterbox, because showing the whole frame matters
        // more than filling a 100px box. A hero plate may not — 240px of dark padding
        // around a small photograph becomes the largest block on the panel and reads as
        // a failed image load. `focus` steers the crop where a centre one would cut the
        // subject, which is the same lever the mission cards use.
        fit="cover"
        scrim={false}
        // Declared at the real render width, capped at the widest it ever gets.
        sizes="(min-width: 1024px) 240px, (min-width: 640px) 208px, 90vw"
        className="aspect-square w-full rounded-xl shadow-premium ring-1 ring-gold-border"
      />

      <span
        className={cn(
          "absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1",
          "border border-white/20 bg-black/45 backdrop-blur-sm",
          "tabular text-[12px] font-semibold text-white",
        )}
      >
        {formatPrice(product.price.amount, {
          currency: product.price.currency,
          showDecimals: product.price.amount % 100 !== 0,
        })}
      </span>
    </div>
  );
}

/** Whether a row is worth marking: do these products actually disagree on it? */
function varies(products: MockProduct[], read: (product: MockProduct) => string): boolean {
  return new Set(products.map(read)).size > 1;
}

/**
 * One product's artwork and identity, at the head of its column.
 *
 * ## Stacked, and small
 *
 * The photograph sits above the name rather than beside it, and it is capped at 132px.
 * Three reasons, in ascending order of how much they matter:
 *
 *  - Side by side stopped fitting. At five columns a plate with text next to it leaves
 *    each about 60px, which is not a photograph and not a name.
 *  - It halves what the page asks of the artwork. Merchant imagery arrives at whatever
 *    resolution the seller uploaded, and a 388px plate upscaling a 200px JPEG is soft
 *    in a way no amount of layout fixes. Small is sharp.
 *  - It buys back most of a screen of height, so the verdict and the first rows of the
 *    comparison land together instead of the reader scrolling to find out what the
 *    recommendation was based on.
 *
 * ## Remove is always visible here
 *
 * Elsewhere in the app a destructive control on a card hides until hover — a grid of
 * fourteen saved pieces should be fourteen photographs, not fourteen photographs and
 * fourteen delete buttons. This is the opposite situation: there are at most five
 * columns, and pruning the set is one of the two things this page is *for*. A control
 * you have to discover by hovering is the wrong answer when using it is the point.
 */
function Plate({
  product,
  isPick,
  onRemove,
}: {
  product: MockProduct;
  isPick: boolean;
  onRemove: () => void;
}) {
  const fit = fitForTile(imageRatio(product.image, product.ratio), 1);

  return (
    <div className="min-w-0">
      <div className="relative w-full max-w-[8.25rem]">
        <MediaFrame
          src={product.image}
          alt=""
          focus={product.focus}
          fit={fit}
          scrim={false}
          // Declared honestly at the size it renders. Over-declaring here would fetch
          // a source three times larger than the box for no gain — the whole point of
          // the smaller plate is that it stops asking for pixels that may not exist.
          sizes="132px"
          className="aspect-square w-full rounded-lg shadow-premium-sm"
        />

        {/* The ring marks the recommendation on the artwork, so the verdict above and
            the plate below cannot be read as being about different products. An
            overlay rather than a border — see `ProductCard` for why. */}
        {isPick ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-gold-solid ring-offset-2 ring-offset-canvas"
          />
        ) : null}

        {/* Overhanging the corner rather than sitting inside the frame: inside, it
            covers the very photograph it is attached to. Fixed white-on-black glass
            rather than theme tokens, because it sits on an image and an image does not
            lighten because the UI did. */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${product.name} from the comparison`}
          title="Remove from comparison"
          className={cn(
            "absolute -top-2 -right-2 grid size-6 place-items-center rounded-full",
            "border border-white/25 bg-black/60 text-white/90 backdrop-blur-sm",
            "transition-[background-color,color,scale] duration-200",
            "hover:scale-105 hover:bg-danger hover:text-white",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      </div>

      <div className="min-w-0 pt-3">
        {isPick ? (
          <p className="text-eyebrow mb-1.5 flex items-center gap-1.5 text-gold">
            <Sparkles className="size-3 shrink-0" aria-hidden="true" />
            Snapi&rsquo;s pick
          </p>
        ) : null}

        <p className="text-eyebrow truncate text-content-subtle">{product.brand}</p>

        <h3 className="mt-1.5 font-display text-[13.5px] leading-tight font-normal text-balance text-content xl:text-[15px]">
          <Link
            href={routes.product(product.slug)}
            className="rounded-sm transition-colors duration-300 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
        </h3>
      </div>
    </div>
  );
}

/**
 * One attribute, across every product.
 *
 * `differs` puts a dot beside the label. It is the single most useful mark on a
 * comparison — what a reader is looking for is not the values, it is the places the
 * values disagree — and it costs one glyph. With five columns it earns its keep twice
 * over: it is the difference between reading the table and scanning it.
 *
 * `role="presentation"` is deliberately absent: this is a real grid of related values,
 * and while a `<table>` would be the purest markup, a table cannot restack into
 * labelled pairs on a phone without abandoning its own semantics. The label is repeated
 * per value below `lg` instead, which is what keeps the small layout readable.
 */
function Row({
  label,
  differs = false,
  children,
}: {
  label: string;
  differs?: boolean;
  /** One cell per product, in column order. */
  children: React.ReactNode;
}) {
  const cells = React.Children.toArray(children);

  return (
    <>
      <div className="hidden border-t border-border py-5 lg:block lg:pr-3 xl:pr-4">
        <p className="text-eyebrow flex items-center gap-1.5 text-content-subtle">
          {label}
          {/* `title` and `aria-label` both, because a decoration that carries meaning
              has to carry it to everyone. */}
          {differs ? (
            <span
              className="size-1.5 shrink-0 rounded-full bg-gold-solid"
              title="These differ"
              aria-label="These differ"
            />
          ) : null}
        </p>
      </div>

      {cells.map((cell, index) => (
        <div
          key={index}
          className={cn(
            "min-w-0 border-t border-border py-5 lg:pr-3 xl:pr-4",
            // Every column but the first carries the rule on its leading edge, which
            // is what draws the spines between them.
            index > 0 && "lg:border-l lg:pl-3 xl:pl-4",
          )}
        >
          <p className="text-eyebrow mb-2 text-content-subtle lg:hidden">{label}</p>
          {cell}
        </div>
      ))}
    </>
  );
}

/**
 * Price, in the display serif.
 *
 * The one row the whole comparison turns on, so it gets the editorial face and a size
 * no other value has. `tabular` still: Oranienbaum's proportional figures make a 1
 * narrower than a 7, and prices that do not align on their digits are prices you have
 * to read twice.
 *
 * 20px rather than the 24px it was at two columns. Five columns of 24px display serif
 * is a row of headlines, and the headline on this page is the verdict.
 */
function PriceValue({
  product,
  gap,
  isPick,
}: {
  product: MockProduct;
  /** Formatted difference from the pick, or `null` on the pick itself. */
  gap: string | null;
  isPick: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          "tabular block font-display text-xl leading-none font-normal",
          isPick ? "text-gold" : "text-content",
        )}
      >
        {formatPrice(product.price.amount, {
          currency: product.price.currency,
          showDecimals: product.price.amount % 100 !== 0,
        })}
      </span>

      {/* Three states, and the third one is why this is not a ternary on `gap` alone.
          `gap` is null both on the pick *and* wherever a difference cannot honestly be
          stated — two identical prices, or a set spanning two currencies. Keying
          "Lowest" off a null gap therefore printed it on every column of a mixed-
          currency set, and on both halves of a tie. It keys off `isPick`, which is
          singular by construction. */}
      {gap ? (
        <span className="mt-2 block text-[11px] text-content-subtle">{gap} more</span>
      ) : isPick ? (
        // The cheapest column says so rather than saying nothing. With five prices in a
        // row, "which is lowest" is arithmetic the reader should not have to do.
        <span className="mt-2 block text-[11px] text-gold">Lowest</span>
      ) : null}
    </>
  );
}

/**
 * "the Loro Piana", but "The Row" — never "the The Row".
 *
 * Composing prose from a catalogue means the catalogue's own words arrive in the middle
 * of your sentence, and some of them are already articles. The Row, The Frankie Shop,
 * The Elder Statesman: any template that hardcodes "the" in front of a brand is one
 * house away from reading like a bug.
 */
function withArticle(name: string): string {
  return /^the\s/i.test(name) ? name : `the ${name}`;
}

/** Sentence-initial form of the above. */
function opening(name: string): string {
  const withThe = withArticle(name);
  return withThe.charAt(0).toUpperCase() + withThe.slice(1);
}

/**
 * Snapi's recommendation — a stand-in for a model.
 *
 * Composed from the set rather than written as fixed copy, and that is the point of
 * doing it this way: the reader chooses what is in the table, so static prose would
 * describe products they did not pick. Everything here is derived from fields that
 * exist, so the page never asserts something the data cannot support — the discipline
 * to keep when a real model replaces it, because a confident sentence about the wrong
 * bag is worse than no sentence.
 *
 * The rule is deliberately simple and stated out loud in the copy: cheapest wins, and
 * the caveat names what you give up. With only price to compare on, any cleverer rule
 * would be inventing a judgement — and a recommendation that cannot explain itself is
 * the thing this page exists to replace.
 *
 * `gapFrom` is a function rather than a precomputed map because the caller wants it per
 * column while rendering, and a lookup keyed by id would be a second structure to keep
 * in step with the first.
 */
function buildVerdict(products: MockProduct[]) {
  // Sorted by price, cheapest first. A copy, because reordering the caller's array
  // would reorder the columns underneath it.
  const byPrice = [...products].sort((a, b) => a.price.amount - b.price.amount);
  const pick = byPrice[0]!;
  const runnerUp = byPrice[1] ?? pick;
  const dearest = byPrice[byPrice.length - 1]!;

  // Same-currency only. A gap between two currencies is not a number, and printing one
  // anyway is how a comparison tells its first lie.
  const comparable = products.every((p) => p.price.currency === pick.price.currency);

  const money = (amount: number) =>
    formatPrice(amount, { currency: pick.price.currency, showDecimals: amount % 100 !== 0 });

  const gapFrom = (product: MockProduct): string | null => {
    if (product.id === pick.id) return null;
    if (!comparable) return null;
    const gap = product.price.amount - pick.price.amount;
    return gap > 0 ? money(gap) : null;
  };

  const spread = dearest.price.amount - pick.price.amount;
  // A tenth is the line between "cheaper" and "materially cheaper" — under it, price is
  // not the deciding factor and the copy should not pretend it is.
  const decisive = comparable && spread > 0 && spread / dearest.price.amount >= 0.1;

  const headline = !comparable
    ? `${opening(pick.name)}, on balance.`
    : decisive
      ? `${opening(pick.name)}, comfortably.`
      : `${opening(pick.name)}, but only just.`;

  const body =
    comparable && spread > 0
      ? `The lowest of the ${products.length} at ${money(pick.price.amount)}, ${money(spread)} under ${withArticle(dearest.brand)} at the top of the set, and it comes from ${pick.merchant}. ${pick.matchNote}`
      : `All ${products.length} land at much the same money, so it comes down to the pieces themselves. ${pick.matchNote}`;

  const caveat =
    runnerUp.id === pick.id
      ? `Nothing else here answers the brief as directly, so this one wins by default rather than by margin.`
      : `${opening(runnerUp.name)} is the one to take instead if ${runnerUp.badge ? `“${runnerUp.badge.toLowerCase()}” is worth the difference to you` : `you would rather have ${withArticle(runnerUp.brand)}`} — it answers the brief too, at ${money(runnerUp.price.amount)} from ${runnerUp.merchant}.`;

  return { pick, gapFrom, headline, body, caveat };
}
