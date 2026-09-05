import { Bookmark, Check, Plus } from "lucide-react";
import Link from "next/link";

import { Cart } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import { fitForTile, imageRatio } from "@/lib/media";
import type { MockProduct } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

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
export function ProductCard({
  product,
  href,
  selectable = false,
  selected = false,
  atCapacity = false,
  onToggle,
  addable = false,
  inMission = false,
  onToggleMission,
}: {
  product: MockProduct;
  /**
   * Where the card goes. Defaults to the standalone product route.
   *
   * The workspace overrides it with its own URL plus `?p=<slug>`, so the product
   * opens in the results pane beside the conversation instead of replacing the
   * whole surface. Still a real link either way — which is the point of passing an
   * href rather than a click handler: ⌘-click, middle-click and "copy link" all keep
   * working, and none of them would if this were a button.
   */
  href?: string;
  /**
   * Selecting mode. The card stops being a link and becomes a button — see the
   * note on `Shell` below, because getting this wrong is how a comparison flow
   * navigates away from itself.
   */
  selectable?: boolean;
  selected?: boolean;
  /**
   * The comparison set is full and this card is not in it.
   *
   * Not `disabled`: a disabled button leaves the tab order, and a keyboard user
   * sweeping the grid would find cards silently vanishing as they filled the set.
   * `aria-disabled` says the same thing while keeping the card reachable, and the
   * click is refused upstream — see `togglePick`.
   */
  atCapacity?: boolean;
  onToggle?: () => void;
  /**
   * Whether this card can be filed into the open mission.
   *
   * True only in a mission workspace — a conversation or a brand page has nothing to
   * file into. Suppressed while selecting, because Compare owns the grid in that mode
   * and two different affordances on one tile is a coin toss for the reader.
   */
  addable?: boolean;
  /** Already in the mission. Drives the glyph, the label and `aria-pressed`. */
  inMission?: boolean;
  onToggleMission?: () => void;
}) {
  // Decided from the artwork's shape, not declared per product. A merchant feed
  // will not tell us how it wants to be cropped, and it should not have to.
  const fit = fitForTile(imageRatio(product.image, product.ratio), TILE_RATIO);

  /**
   * One card, two behaviours, and the element changes with them.
   *
   * A link that has been given a click handler which calls `preventDefault` is
   * still a link: it keeps its href in the status bar, opens in a new tab on
   * middle-click or ⌘-click, and announces itself as a destination. In selecting
   * mode none of that is true, so the element itself has to change — an anchor
   * whose job is to toggle a checkbox is a lie in three different ways.
   *
   * `aria-pressed` rather than `aria-checked`: this is a toggle button, not a radio
   * or a checkbox in a group, and it is the role the element actually has.
   */
  const Shell = selectable ? "button" : Link;
  const shellProps = selectable
    ? ({
        type: "button",
        onClick: onToggle,
        "aria-pressed": selected,
        "aria-disabled": atCapacity || undefined,
        // The tooltip is the only place the reason is written on the card itself. The
        // header carries the count; this answers "why did nothing happen" at the point
        // where nothing happened.
        title: atCapacity ? "Remove one to add another" : undefined,
      } as const)
    : ({ href: href ?? routes.product(product.slug) } as const);

  return (
    <article className={cn("group relative", selectable && "cursor-pointer")}>
      <Shell
        {...(shellProps as { href: string })}
        className={cn(
          "flex h-full w-full flex-col rounded-lg text-left",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        )}
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
            className={cn(
              "aspect-square rounded-lg shadow-premium-sm",
              "transition-[box-shadow,opacity] duration-300",
              // Unpicked cards recede while selecting, so the ones you have chosen
              // are legible at a glance from across the grid. Dimming rather than
              // greying: they are still perfectly choosable, just not chosen.
              selectable && !selected && !atCapacity && "opacity-65 group-hover:opacity-100",
              // Further still once the set is full, and this pair does not lift on
              // hover. A card that brightens under the cursor and then refuses the
              // click is worse than one that stays quiet.
              atCapacity && "opacity-35",
            )}
          />

          {/* The ring is on a sibling overlay, not on the frame's own border. A
              border would sit inside the rounded corners and change the box's
              size, nudging the caption down by two pixels as you select — a whole
              grid twitching is a high price for a highlight. */}
          {selected ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-gold-solid ring-offset-2 ring-offset-canvas"
            />
          ) : null}

          {/* Stays on the image: this is a property of the listing, not of the
              caption, and it has to survive the eye landing on the photo first.
              Fixed white-on-black glass rather than theme tokens — it sits on a
              photograph, which does not change with the theme.
              Hidden while selecting: the tick takes this corner, and two markers
              stacked in one corner is a mess. */}
          {product.badge && !selectable ? (
            <span className="absolute top-2.5 right-2.5 rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-white/90 uppercase backdrop-blur-sm">
              {product.badge}
            </span>
          ) : null}

          {/* The tick. Always rendered while selecting, not only when chosen — an
              empty circle is what tells you the card is choosable at all, and a
              marker that only appears once you have acted cannot invite the act. */}
          {selectable ? (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full border backdrop-blur-sm",
                "transition-[background-color,border-color,color] duration-200",
                selected
                  ? "border-gold-solid bg-gold-solid text-gold-content"
                  : // The empty circle fades with the card at capacity: an inviting
                    // target on a card that will not accept the tap is the wrong
                    // promise.
                    atCapacity
                    ? "border-white/20 bg-black/20 text-transparent"
                    : "border-white/40 bg-black/30 text-transparent",
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex min-w-0 flex-1 flex-col">
          <p className="text-eyebrow truncate text-content-subtle">{product.brand}</p>

          <h3
            className={cn(
              "mt-1.5 text-sm leading-snug font-semibold text-balance text-content transition-colors duration-300",
              // No gold-on-hover while selecting: hovering does not open anything
              // there, and a link-coloured title would promise that it does.
              !selectable && "group-hover:text-gold",
            )}
          >
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
      </Shell>

      {/* ── Add to mission ────────────────────────────────────────────────────
          A *sibling* of the shell, never a child. The shell is the whole card and it
          is either a link or a button; an interactive element inside either one is
          invalid markup that browsers resolve however they like. Positioned over the
          photograph instead, which is where it would have sat anyway.

          Top-left, because the top-right corner already belongs to the condition
          badge — and, while selecting, to the tick.

          Revealed on hover, with the three fallbacks this app uses everywhere: focus
          within the card, `focus-visible` on the button itself, and permanently
          visible on touch where there is no hover to give.

          Once the piece is in, the tick stays visible at all times. That is *state*
          rather than an action, and state you can only see by hovering is state you
          cannot see. */}
      {addable && !selectable ? (
        <button
          type="button"
          onClick={onToggleMission}
          aria-pressed={inMission}
          aria-label={
            inMission
              ? `Remove ${product.name} from this mission`
              : `Add ${product.name} to this mission`
          }
          title={inMission ? "In this mission" : "Add to this mission"}
          className={cn(
            "absolute top-2.5 left-2.5 z-10 grid size-7 place-items-center rounded-full border backdrop-blur-sm",
            "transition-[background-color,border-color,color,opacity,scale] duration-200",
            "hover:scale-105",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            inMission
              ? // Fixed gold-on-dark rather than theme tokens: it sits on a
                // photograph, and a photograph does not lighten because the UI did.
                "border-gold-solid bg-gold-solid text-gold-content"
              : cn(
                  "border-white/40 bg-black/35 text-white",
                  "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100",
                  "[@media(hover:none)]:opacity-100",
                ),
          )}
        >
          {inMission ? (
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
        </button>
      ) : null}

      {/* ── Save and buy, from the grid ───────────────────────────────────────
          The two things you do with a piece besides open it. On the product page they
          are a row of glyphs beside Buy; here they are the same two glyphs in the
          corner of the photograph, so the common case — you can already see it is the
          one you want — does not cost a page.

          ⚠️ Not wired. They render, they light up, and they do nothing yet: the cart
          and the list are both fixtures with no writer, and pointing these at local
          state would make a card claim a piece was saved while the page that lists
          saved pieces knew nothing about it. That is worse than a control that
          visibly has not been built. When there is somewhere to write, they take an
          `onSave`/`onAddToCart` and an `aria-pressed`, exactly like the mission
          button above them.

          ## Positioning

          The wrapper exists to give the buttons the *photograph's* bottom edge rather
          than the card's. Everything here is a sibling of the shell — an interactive
          element inside a link or a button is invalid markup — so it is positioned
          against the article, whose height includes the caption. `inset-x-0 top-0`
          with `aspect-square` reproduces the image box exactly, because the image is
          a full-width square at the top of the card, and it does so without a hard-coded
          height that would need editing the day the tile ratio changes.

          `pointer-events-none` on the wrapper and back on for the buttons: a
          transparent square lying over the top half of the card would otherwise
          swallow every click meant for the link underneath it.

          Hidden while selecting, like the mission control. During a comparison the
          card is a single choosable target, and two live buttons inside something you
          are being asked to tap as a whole is a way to mis-tap it. */}
      {!selectable ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-square">
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            <QuickAction
              icon={Bookmark}
              label={`Save ${product.name} to your Snapi List`}
              title="Save to Snapi List"
            />
            <QuickAction
              icon={Cart}
              label={`Add ${product.name} to your cart`}
              title="Add to cart"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

/**
 * One of the two glyph buttons on the photograph.
 *
 * Fixed white-on-glass rather than theme tokens, for the reason the badge and the
 * mission button give: it sits on a photograph, and a photograph does not lighten
 * because the interface did.
 *
 * Revealed on hover with the three fallbacks this app uses everywhere — focus within
 * the card, `focus-visible` on the button itself, and permanently visible where there
 * is no hover to give. A control that only exists under a cursor does not exist on a
 * phone, and cannot be reached by a keyboard.
 */
function QuickAction({
  icon: Icon,
  label,
  title,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** The accessible name. Carries the product, since the button carries no text. */
  label: string;
  /** The hover tooltip. Short, because it repeats every card. */
  title: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      className={cn(
        "pointer-events-auto grid size-7 place-items-center rounded-full border backdrop-blur-sm",
        "border-white/40 bg-black/35 text-white",
        "transition-[background-color,border-color,color,opacity,scale] duration-200",
        "hover:scale-105 hover:bg-black/55",
        "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100",
        "[@media(hover:none)]:opacity-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <Icon className="size-3.5" aria-hidden={true} />
    </button>
  );
}
