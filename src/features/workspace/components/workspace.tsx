"use client";

import { ChevronDown, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Logo } from "@/components/layout/logo";
import { ProductCard } from "@/features/workspace/components/product-card";
import { WorkspaceComposer } from "@/features/workspace/components/workspace-composer";
import { WorkspaceThread } from "@/features/workspace/components/workspace-thread";
import type { MockMessage, MockProduct } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * The full-screen workspace: conversation on the left, what it found on the right.
 *
 * ## Why it is a page, not a modal
 *
 * Every entry point into this surface already had a real URL — a mission, a past
 * conversation, an editorial story, a hero prompt. Rendering it as an overlay
 * would throw that away: no deep link, no refresh, no shareable result, and the
 * back button doing something other than what it looks like it does. It lives
 * outside the `(app)` route group, so the sidebar is genuinely absent rather than
 * covered up.
 *
 * ## The split
 *
 * 30/70 from `lg` up, bounded on both sides. A percentage alone puts the composer
 * in a 240px column on a laptop and a 700px one on a studio display; the min and
 * max keep the chat readable at both without the products pane ever feeling
 * cramped.
 *
 * ## On a phone
 *
 * The split does not survive — 30% of 390px is nothing. Products become the page
 * and the chat docks to the bottom edge, expanding into a sheet when tapped. That
 * ordering is deliberate: on a phone people browse first and ask second, so the
 * buyable half gets the screen and the conversation is one tap away.
 *
 * The chat panel is `fixed` below `lg` and `static` from `lg` up — one element in
 * one place in the DOM, repositioned. A fixed element is out of flow, so the
 * products pane fills the row on mobile without needing to know the sheet exists.
 */
export function Workspace({
  eyebrow,
  title,
  closeHref,
  closeLabel,
  messages,
  products,
  resultsNote,
}: {
  eyebrow: string;
  title: string;
  /**
   * Where the close button goes. An explicit href rather than `router.back()`:
   * back does nothing useful when the URL was opened directly, shared, or
   * refreshed, and a close button that sometimes leaves the site is worse than one
   * that always returns to where the thing lives.
   */
  closeHref: string;
  closeLabel: string;
  messages: MockMessage[];
  products: MockProduct[];
  /** Optional one-liner above the grid on what these results are. */
  resultsNote?: string;
}) {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Escape closes the sheet. Bound to the window rather than the panel because the
  // user may well be scrolling the products behind it when they want it gone.
  React.useEffect(() => {
    if (!sheetOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSheetOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sheetOpen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <header className="relative z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-3 backdrop-blur-xl sm:h-16 sm:gap-4 sm:px-5">
        <Logo compact />

        <div className="min-w-0 flex-1">
          <p className="text-eyebrow truncate text-gold">{eyebrow}</p>
          {/* The `<h1>` is the thing you opened, not "Workspace" — it is what the
              page is about, and what a screen reader should announce on arrival. */}
          <h1 className="truncate font-display text-base leading-tight font-normal text-content sm:text-lg">
            {title}
          </h1>
        </div>

        <Link
          href={closeHref}
          aria-label={closeLabel}
          title={closeLabel}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-md border border-border text-content-muted",
            "transition-[background-color,border-color,color] duration-200",
            "hover:border-gold-border hover:bg-surface-raised hover:text-content",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* ── Chat: left column from lg, bottom sheet below it ────────────── */}
        <aside
          aria-label="Conversation"
          className={cn(
            "z-40 flex flex-col border-border bg-surface/75 backdrop-blur-2xl",
            // Mobile: docked to the bottom edge, growing to a sheet when open.
            "fixed inset-x-0 bottom-0 rounded-t-2xl border-t shadow-premium-lg",
            sheetOpen ? "top-14 sm:top-16" : "top-auto",
            // Desktop: a real column again.
            "lg:static lg:inset-auto lg:z-auto lg:w-[30%] lg:max-w-[480px] lg:min-w-[340px]",
            "lg:rounded-none lg:border-t-0 lg:border-r lg:shadow-none",
          )}
        >
          {/* The gold + azure wash, the same one the home banner and page headers
              carry. Painted by a child rather than by `.ambient-canvas` on the
              aside itself: that utility sets `position: relative`, and this
              element has to stay `fixed` as a bottom sheet on a phone.

              No `z-index` on either side of it — an absolutely positioned child
              paints above its non-positioned siblings, so the content below is
              made `relative` instead, which puts it in the same painting group and
              lets DOM order do the work. */}
          <div className="ambient-wash pointer-events-none absolute inset-0" aria-hidden="true" />

          {/* Sheet handle. `lg:hidden` — on desktop the panel is simply there, and
              a control to reveal what is already visible is noise. */}
          <button
            type="button"
            onClick={() => setSheetOpen((open) => !open)}
            aria-expanded={sheetOpen}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-4 py-3 text-left text-[13px] font-medium text-content-muted",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden",
            )}
          >
            {sheetOpen ? (
              <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
            )}
            {sheetOpen ? "Hide conversation" : `Conversation · ${messages.length}`}
          </button>

          {/* The thread is present in the DOM at every size — hidden on mobile only
              while the sheet is shut. */}
          <div
            className={cn(
              "relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-2 lg:block lg:pt-6",
              sheetOpen ? "" : "hidden",
            )}
          >
            <WorkspaceThread messages={messages} />
          </div>

          <div className="relative shrink-0 px-4 pt-2 pb-4 lg:pb-5">
            <WorkspaceComposer />
          </div>
        </aside>

        {/* ── Products ─────────────────────────────────────────────────────── */}
        <section aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className={cn(
              "px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8",
              // Clears the docked composer on mobile. On desktop the chat is a
              // sibling column, so no allowance is needed.
              "pb-56 lg:pb-10",
            )}
          >
            <div className="flex items-baseline justify-between gap-4 pb-5">
              <h2 className="text-eyebrow text-content-subtle">
                {products.length} {products.length === 1 ? "piece" : "pieces"} found
              </h2>
              {/* Omitted entirely rather than rendered empty — an empty `<p>` here
                  would still hold its line box and push the rule down. */}
              {resultsNote ? (
                <p className="min-w-0 truncate text-[12px] text-content-subtle">{resultsNote}</p>
              ) : null}
            </div>

            <div className="rule-fade mb-6 h-px" aria-hidden="true" />

            {products.length === 0 ? (
              <p className="py-20 text-center text-sm text-content-muted">
                Nothing matched yet. Snapi is still looking.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 2xl:grid-cols-4">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
