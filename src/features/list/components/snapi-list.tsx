"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { routes } from "@/config/routes";
import { SavedItemCard } from "@/features/list/components/saved-item-card";
import { usePendingRemoval } from "@/hooks/use-pending-removal";
import { mockSavedItems, type MockSavedItem } from "@/lib/mock-data";
import { formatCompact } from "@/lib/utils";

/**
 * Snapi List — saved pieces, with pagination and removal.
 *
 * A grid of small tiles, five to a row at `xl`. A saved list is scanned before it
 * is read: you are looking for the coat, and you recognise it by the photograph,
 * not by its name. One wide row per piece spent the width on fields that answer
 * questions you only ask after you have already found the thing.
 *
 * Five columns puts the tiles at ~218px, which is what forced the card down to
 * brand, name, price and date — see `SavedItemCard`. That is the trade and it is
 * the right way round: a tile you can take in at a glance, and the specifics on
 * the page behind it.
 *
 * ## Why this is a Client Component
 *
 * Removal has no backend to talk to, so the list must own its items in state — a
 * Server Component would re-derive them from `mockSavedItems` on every navigation
 * and quietly resurrect anything removed. The live count in the header depends on
 * that same state, which is why the header is inside this boundary too.
 *
 * ## Page state lives in the URL, not here
 *
 * `page` arrives as a prop, read from `?page=` on the server. That keeps the page
 * shareable and the back button working, and it avoids `useSearchParams()` — which
 * would put this subtree behind a Suspense boundary. Paging is client-side
 * navigation on the same route, so this component never unmounts and removals
 * survive changing pages.
 *
 * The page is clamped at render rather than corrected in an effect: remove enough
 * items and page 3 stops existing, and an effect that pushed a new URL would cost
 * an extra round trip to show what can simply be computed.
 */

/** Two full rows at `xl`. A ragged last row is what a half-filled page looks like. */
const PAGE_SIZE = 10;

export function SnapiList({ page }: { page: number }) {
  // Soft removal lives in a shared hook — the Missions board runs the same Undo
  // window, and the timer semantics are subtle enough that two copies would drift.
  const { items, pendingId, visibleCount, requestRemove, undo } = usePendingRemoval<MockSavedItem>(
    () =>
      [...mockSavedItems].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      ),
  );

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  return (
    <>
      <PageHeader
        eyebrow="Saved"
        meta={`${formatCompact(visibleCount)} ${visibleCount === 1 ? "piece" : "pieces"}`}
        title="Snapi List"
        description="The pieces you've set aside — kept in view until the moment is right."
      />

      <div className="container-page py-10 sm:py-12">
        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-content-muted">
            Nothing saved yet. Snap or describe something and add it here.
          </p>
        ) : (
          <>
            {/* `<ol>` because the order carries meaning — newest saved first — so
                "item 3 of 10" tells a screen-reader user something true. A grid
                does not change that; only the visual arrangement is two-
                dimensional, and the reading order is still the saving order.

                No `grid-auto-flow: dense`: every tile is one cell, so there are no
                holes for it to fill and it would only ever decouple what you see
                from the order a keyboard follows. */}
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {pageItems.map((item) => {
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
                      <SavedItemCard item={item} onRemove={() => requestRemove(item.id)} />
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

            <Pagination
              page={safePage}
              totalPages={totalPages}
              buildHref={(next) =>
                next === 1 ? routes.snapiList() : `${routes.snapiList()}?page=${next}`
              }
              className="mt-10"
            />
          </>
        )}
      </div>
    </>
  );
}
