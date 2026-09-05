import { ArrowLeft, ArrowRight, FolderPlus, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { fitForTile, imageRatio } from "@/lib/media";
import { PRODUCT_CATEGORIES, type MockProduct, type ProductCategory } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

/**
 * How many pieces a collection shows before it offers a screen of its own.
 *
 * Four, which is one row at the width this pane gives it. The cap is a *row* rather
 * than a number: a collection that spills onto a second row makes the page a scroll
 * through one category, and the point of the overview is that you can see every
 * category at once. Change the grid below and this has to change with it.
 */
const PREVIEW_LIMIT = 4;

/**
 * What has been added to a mission, filed by category.
 *
 * ## The collections are derived, never stored
 *
 * A collection is not a thing the user makes — it is what a category *becomes* once
 * something is in it. So there is no create, rename, reorder or delete: add a coat and
 * Outerwear exists, remove the last coat and it stops existing. That is the whole
 * promise of "filed automatically", and the moment collections become editable objects
 * the promise breaks, because then the user is maintaining two organisation schemes
 * that can disagree.
 *
 * Grouped in `PRODUCT_CATEGORIES` order rather than by when things were added, so the
 * page does not rearrange itself under the reader as they add. Empty categories are
 * dropped rather than shown as empty shelves — a wall of "Watches · 0" is a list of
 * things you have not done.
 *
 * ## Two views, one component
 *
 * The overview shows every collection with at most `PREVIEW_LIMIT` pieces each; opening
 * one replaces the pane with that collection in full. Both live here because the state
 * that decides between them is *nothing but* which category is open — there is no data
 * to fetch and no URL to own, so lifting it into the workspace would be handing a
 * parent a variable only this file reads.
 *
 * It is a view rather than a route for a harder reason too: what has been added lives in
 * the workspace's own state, so a real page would render on the server knowing nothing
 * about it and arrive empty. The pattern matches the product page and the comparison,
 * which take over the same pane for the same reason.
 *
 * ## Why this is not the results grid
 *
 * Same pane, deliberately different rhythm. Results are a flat grid of candidates you
 * are judging; this is a set of shelves you are filling, so it reads as sections with
 * ruled headings and smaller plates. If the two looked alike, the tab strip would be
 * the only thing telling you which one you were on.
 */
export function MissionCollections({
  products,
  missionName,
  onRemove,
  productHref,
  onFindMore,
  openCategory,
  onOpenCategory,
}: {
  /** Everything added, in the order the results grid shows it. */
  products: MockProduct[];
  missionName: string;
  onRemove: (id: string) => void;
  productHref: (slug: string) => string;
  /** Sends the reader back to the results — the only place things can be added. */
  onFindMore: () => void;
  /**
   * Which collection is open in full, or `null` for the overview.
   *
   * Controlled from the workspace rather than held here, and the reason is the dossier:
   * its collection pills open a *named* collection from the other side of the split, so
   * the value has to live somewhere both can reach. It was internal state until then.
   */
  openCategory: ProductCategory | null;
  onOpenCategory: (category: ProductCategory | null) => void;
}) {
  const groups = React.useMemo(() => {
    const byCategory = new Map<ProductCategory, MockProduct[]>();
    for (const product of products) {
      const bucket = byCategory.get(product.category);
      if (bucket) bucket.push(product);
      else byCategory.set(product.category, [product]);
    }

    // Declaration order, not insertion order — see the note above.
    return PRODUCT_CATEGORIES.flatMap((category) => {
      const items = byCategory.get(category);
      return items ? [{ category, items }] : [];
    });
  }, [products]);

  /**
   * The open collection, or nothing.
   *
   * Resolved from `groups` at render rather than held as its own array, so removing the
   * last piece of an open collection falls back to the overview on the same render. An
   * effect watching for that would show one frame of a collection with nothing in it,
   * and React's own lint rule is right to reject the `setState` it would need.
   */
  const open = openCategory ? groups.find((group) => group.category === openCategory) : undefined;

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <span
          aria-hidden="true"
          className="mx-auto grid size-12 place-items-center rounded-full border border-dashed border-gold-border text-gold"
        >
          <FolderPlus className="size-5" />
        </span>

        <p className="mt-5 font-display text-xl leading-tight font-normal text-content">
          Nothing in this mission yet.
        </p>

        {/* States the mechanism rather than the rule. "Add anything and Snapi files it"
            is a promise the next tap keeps; "collections are generated automatically
            from product category" is documentation. */}
        <p className="mx-auto mt-2.5 max-w-[46ch] text-sm leading-relaxed text-content-muted">
          Add anything from the results and Snapi files it by category — the collections build
          themselves as you go.
        </p>

        <button
          type="button"
          onClick={onFindMore}
          className={cn(
            "mt-6 rounded-md bg-gold-solid px-4 py-2.5 text-[13px] font-semibold text-gold-content",
            "transition-colors duration-200 hover:bg-gold-solid-hover",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          Browse the results
        </button>
      </div>
    );
  }

  /* ── One collection, in full ─────────────────────────────────────────────── */
  if (open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onOpenCategory(null)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-content-muted",
            "transition-colors duration-200 hover:text-content",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All collections
        </button>

        {/* The category in the display serif, at heading size. On the overview it is a
            small-caps eyebrow because it labels a shelf among others; here it is the
            subject of the whole pane, and the same treatment would leave the screen
            looking like a section that had lost its page. */}
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-4">
          <h3 className="font-display text-[clamp(1.375rem,2.4vw,1.875rem)] leading-tight font-normal text-content">
            {open.category}
          </h3>
          <p className="tabular text-[12px] text-content-subtle">
            {open.items.length} {open.items.length === 1 ? "piece" : "pieces"} in {missionName}
          </p>
        </div>

        <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
          {open.items.map((product) => (
            <li key={product.id}>
              <CollectionTile
                product={product}
                href={productHref(product.slug)}
                onRemove={() => onRemove(product.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ── Every collection, four pieces each ──────────────────────────────────── */
  return (
    <div>
      {/* The mission is named once, here, rather than on every section. */}
      <p className="text-[13px] leading-relaxed text-content-muted">
        {products.length} {products.length === 1 ? "piece" : "pieces"} in{" "}
        <span className="font-medium text-content">{missionName}</span>, filed into {groups.length}{" "}
        {groups.length === 1 ? "collection" : "collections"}.
      </p>

      <div className="mt-8 space-y-10">
        {groups.map(({ category, items }) => {
          const overflow = items.length - PREVIEW_LIMIT;

          return (
            <section key={category} aria-label={category}>
              {/* Name and count on the left, the way into the collection on the right.
                  The count sits beside the name rather than opposite it so that the
                  right-hand slot belongs to one thing — an action — and a section with
                  nothing to open does not look like it is missing a control. */}
              <div className="flex items-baseline justify-between gap-4 pb-3">
                <h3 className="text-eyebrow flex items-baseline gap-2.5 text-content-subtle">
                  {category}
                  <span className="tabular text-[11px] font-normal">
                    {items.length} {items.length === 1 ? "piece" : "pieces"}
                  </span>
                </h3>

                {/* Only when something is actually hidden, and it says how much: "View
                    all 6" against "6 pieces" two words to its left tells the reader what
                    is missing without doing arithmetic at them. A bare "View all" asks
                    them to trust that there is more.

                    One control per section, at the top. A second note under the row
                    saying "2 more in bags" was here and came out — it was a paragraph
                    competing with a button for the same job, and the heading's own count
                    already carries the fact. */}
                {overflow > 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenCategory(category)}
                    className={cn(
                      "group/all inline-flex shrink-0 items-center gap-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap text-gold",
                      "transition-colors duration-200 hover:text-gold-hover",
                      "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                    )}
                  >
                    View all {items.length}
                    <ArrowRight
                      className="size-3.5 transition-transform duration-300 group-hover/all:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>

              <div className="rule-fade mb-5 h-px" aria-hidden="true" />

              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
                {items.slice(0, PREVIEW_LIMIT).map((product) => (
                  <li key={product.id}>
                    <CollectionTile
                      product={product}
                      href={productHref(product.slug)}
                      onRemove={() => onRemove(product.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One filed piece.
 *
 * The tile is a link and the remove button is its *sibling*, not its child: an
 * interactive element inside an anchor is invalid markup that browsers resolve however
 * they like. So the photograph and the name are the link, and the × sits over it.
 *
 * Remove is revealed on hover, with the keyboard and touch fallbacks the saved-list
 * tile established and for the same reason — a shelf of filed pieces should read as
 * photographs, not as photographs with a delete button on each.
 */
function CollectionTile({
  product,
  href,
  onRemove,
}: {
  product: MockProduct;
  href: string;
  onRemove: () => void;
}) {
  const fit = fitForTile(imageRatio(product.image, product.ratio), 1);

  return (
    <div className="group relative">
      <Link
        href={href}
        className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <MediaFrame
          src={product.image}
          alt=""
          focus={product.focus}
          fit={fit}
          scrim={false}
          sizes="(min-width: 1280px) 14vw, (min-width: 640px) 20vw, 44vw"
          className={cn(
            "aspect-square w-full rounded-lg shadow-premium-sm",
            "transition-[box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:-translate-y-1 group-hover:shadow-premium",
          )}
        />

        <p className="text-eyebrow mt-3 truncate text-content-subtle">{product.brand}</p>

        <p className="mt-1.5 line-clamp-2 min-h-[2.7em] text-[13px] leading-[1.35] font-semibold text-content transition-colors duration-300 group-hover:text-gold">
          {product.name}
        </p>

        <p className="tabular mt-1 text-[13px] font-semibold text-content">
          {formatPrice(product.price.amount, {
            currency: product.price.currency,
            showDecimals: product.price.amount % 100 !== 0,
          })}
        </p>
      </Link>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.name} from this mission`}
        title="Remove from mission"
        className={cn(
          "absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full",
          // Fixed white-on-black glass: it sits on a photograph, and a photograph does
          // not lighten because the UI did.
          "border border-white/20 bg-black/40 text-white/90 backdrop-blur-sm",
          "opacity-0 transition-[background-color,color,opacity] duration-200",
          "group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100",
          "[@media(hover:none)]:opacity-100",
          "hover:bg-danger hover:text-white",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
