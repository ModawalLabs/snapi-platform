"use client";

import { useComposerPrompt } from "@/components/layout/composer-provider";
import { FilterToolbar } from "@/components/ui/filter-toolbar";
import { PageHeader } from "@/components/ui/page-header";
import { SavedItemCard } from "@/components/ui/saved-item-card";
import { usePendingRemoval } from "@/hooks/use-pending-removal";
import { type MockSavedItem } from "@/lib/mock-data";
import { formatCompact } from "@/lib/utils";

/**
 * A page of pieces you have set aside: a heading, a pinned toolbar, and a grid.
 *
 * Two pages are this page — the Snapi List and the Cart — so it lives in
 * `src/components` rather than in either slice. That is the rule in
 * `src/features/README.md`, and the reason for it is the removal behaviour below: a
 * copy of this in a `cart` slice would be a second implementation of a soft delete
 * with a timer, an Undo overlay and an `inert` guard, and the two would drift on the
 * first change to either. The pages differ by five strings, which is what the props
 * are.
 *
 * ## Why this is a Client Component
 *
 * Removal has no backend to talk to, so the page must own its items in state — a
 * Server Component would re-derive them from the fixture on every navigation and
 * quietly resurrect anything removed. The live count in the header depends on that
 * same state, which is why the header is inside this boundary too.
 *
 * ## One scroll, and the toolbar rides up with it
 *
 * There is no pagination. It was ten tiles a page over a list that will not usually
 * run past a few dozen, which meant a control to click before you could see the rest
 * of something you already own — and these pages are scanned, so breaking them into
 * pages hides exactly the piece you half-remember on page two.
 *
 * The scroll is the window's, not an inner pane's. The `(app)` shell gives `<main>` no
 * height and no overflow, so the document scrolls the way it does on every other page
 * here, and `position: sticky` on the toolbar resolves against the viewport. That is
 * the whole mechanism — the heading scrolls away, the toolbar stops at the top edge
 * and the grid keeps going under it. An inner scroll container would have produced a
 * second scrollbar, an unreachable last row when the mobile URL bar moves, and one
 * page in the app that scrolls unlike the rest.
 *
 * The pinned row is full-bleed rather than aligned to the grid: it is a direct child
 * of `<main>`, with `container-page` inside it doing the aligning. If the background
 * stopped at the tiles' own margin, tiles would slide past in the gap either side of
 * it, which is the tell that gives away a bar that is meant to read as chrome.
 */
export function CollectionPage({
  eyebrow,
  title,
  description,
  items: seed,
  subject,
  dateLabel,
  emptyMessage,
  emptyPrompt,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** The fixture. Sorted newest-first here, then owned in state. */
  items: MockSavedItem[];
  /** The collection's noun: "list", "cart". Fills the search field and the remove label. */
  subject: string;
  /** Prefixes each tile's date. "Saved", "Added". */
  dateLabel: string;
  emptyMessage: string;
  /**
   * What the composer should say while this collection is empty, if anything.
   *
   * Supplying it opts the page into summoning the dock — an empty collection has one
   * useful action and no way to perform it on the page itself, so the thing that *can*
   * perform it comes to the reader rather than waiting behind a button in the sidebar.
   *
   * Optional because it is not right for every collection that shares this component.
   * The Cart passes none: an empty cart is not something you fill by describing a piece
   * to an assistant, you fill it from a product page, and a composer sliding up to
   * offer the wrong verb is worse than no composer at all.
   */
  emptyPrompt?: string;
}) {
  // Soft removal lives in a shared hook — the Missions board runs the same Undo
  // window, and the timer semantics are subtle enough that two copies would drift.
  //
  // The factory runs once, on mount, so sorting inside it is not a per-render cost;
  // and the sort belongs here rather than in the fixture because newest-first is how
  // *this page* reads a collection, not a fact about the data.
  const { items, pendingId, visibleCount, requestRemove, undo } = usePendingRemoval<MockSavedItem>(
    () => [...seed].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()),
  );

  // Only while there is genuinely nothing here. `items` still holds a piece that is
  // mid-removal — the Undo overlay is drawn over it — so this cannot fire in the
  // second between removing the last one and the timer committing it, which would pop
  // the composer open underneath a control the reader may be about to press.
  useComposerPrompt(items.length === 0 ? (emptyPrompt ?? null) : null);

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        meta={`${formatCompact(visibleCount)} ${visibleCount === 1 ? "piece" : "pieces"}`}
        title={title}
        description={description}
      />

      {items.length === 0 ? (
        <div className="container-page py-10 sm:py-12">
          <p className="py-16 text-center text-sm text-content-muted">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* ── The pinned row ────────────────────────────────────────────────
              Only in the non-empty branch: there is nothing to search or filter on
              an empty collection, and a toolbar above "Nothing saved yet" would be
              two controls describing an absence.

              Translucent with a blur rather than opaque, so a tile passing beneath
              is softened rather than clipped — you can see that the grid is still
              moving under the bar, which is what tells you the bar is pinned rather
              than that the page has stopped.

              `top-16` below `md`, because the mobile navigation trigger is
              `fixed top-3 left-3` and pinning at the very top edge would park that
              button on top of the search field's own icon. Above `md` the trigger is
              hidden and the bar takes the edge.

              `z-20` matches the brand index's pinned alphabet — the same kind of
              object, so the same layer. It stays under the composer (z-40) and the
              mobile drawer (z-50), both of which are meant to cover it. */}
          <div className="sticky top-16 z-20 border-b border-border bg-canvas/85 backdrop-blur-xl md:top-0">
            <div className="container-page py-4">
              <FilterToolbar subject={subject} />
            </div>
          </div>

          <div className="container-page pt-8 pb-16 sm:pt-10">
            {/* `<ol>` because the order carries meaning — newest first — so
                "item 3 of 10" tells a screen-reader user something true. A grid
                does not change that; only the visual arrangement is two-
                dimensional, and the reading order is still the saving order.

                No `grid-auto-flow: dense`: every tile is one cell, so there are no
                holes for it to fill and it would only ever decouple what you see
                from the order a keyboard follows. */}
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => {
                const pending = item.id === pendingId;

                return (
                  <li key={item.id} className="relative">
                    {/* The tile stays in the layout while pending, dimmed. Removing
                        it and reserving a matching height instead would mean
                        hardcoding a pixel value that drifts the moment the card's
                        content changes — and in a grid it would also reflow every
                        tile after it, twice. */}
                    {/* `inert`, not just `aria-hidden` — an aria-hidden subtree
                        still holds its links in the tab order, so a keyboard user
                        would tab into a card that has visibly been removed. */}
                    <div
                      className={
                        pending
                          ? "h-full opacity-30 transition-opacity duration-300"
                          : "h-full transition-opacity duration-300"
                      }
                      inert={pending}
                    >
                      <SavedItemCard
                        item={item}
                        onRemove={() => requestRemove(item.id)}
                        dateLabel={dateLabel}
                        subject={subject}
                      />
                    </div>

                    {pending ? (
                      <div className="absolute inset-0 grid place-items-center rounded-lg border border-dashed border-gold-border bg-surface/80 backdrop-blur-sm">
                        {/* Stacked, not the row's side-by-side pair: at ~218px the
                            piece's name and an Undo button on one line leave three
                            characters each.
                            `role="status"` so the removal is announced without
                            stealing focus mid-task. */}
                        <div
                          role="status"
                          className="flex flex-col items-center gap-2 px-3 text-center"
                        >
                          <span className="text-[13px] leading-snug text-content-muted">
                            Removed{" "}
                            <span className="line-clamp-2 font-medium text-content">
                              {item.name}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={undo}
                            className="rounded-sm text-sm font-semibold text-gold transition-colors duration-200 hover:text-gold-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      )}
    </>
  );
}
