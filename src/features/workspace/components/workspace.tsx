"use client";

import { ChevronDown, MessageSquare, Scale, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Logo } from "@/components/layout/logo";
import { MissionCollections } from "@/features/workspace/components/mission-collections";
import { MissionDossier } from "@/features/workspace/components/mission-dossier";
import { ProductCard } from "@/features/workspace/components/product-card";
import { ProductComparison } from "@/features/workspace/components/product-comparison";
import { ProductDetail } from "@/features/workspace/components/product-detail";
import { MAX_COMPARE } from "@/features/workspace/lib/compare";
import { WorkspaceComposer } from "@/features/workspace/components/workspace-composer";
import { WorkspaceThread } from "@/features/workspace/components/workspace-thread";
import type { MockMessage, MockProduct, ProductCategory } from "@/lib/mock-data";
import type { ImageSource } from "@/types/media";
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
  selfHref,
  productSlug,
  messages,
  products,
  resultsNote,
  filed,
  mission,
}: {
  eyebrow: string;
  title: string;
  /** This workspace's own URL, without `?p=`. See `WorkspaceSeed.selfHref`. */
  selfHref: string;
  /**
   * The product to show in the pane, from `?p=` on the URL.
   *
   * A slug rather than a product, so the page that reads the query string does not
   * also have to resolve it — and so an unknown slug degrades to the grid instead of
   * to an error. Someone editing the URL by hand, or following a link to a product
   * that has since left the results, gets the results back rather than a dead end.
   */
  productSlug?: string;
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
  /** Ids already filed into the mission. See `WorkspaceSeed.filed`. */
  filed?: string[];
  /** Set only when this workspace is a mission. See `WorkspaceSeed.mission`. */
  mission?: {
    name: string;
    image: ImageSource | null;
    focus?: string;
  };
}) {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  /**
   * Comparison, as three states rather than two booleans.
   *
   * `browse | select | compare` cannot represent "comparing but also still
   * selecting", which a pair of flags can and which would be a bug nobody notices
   * until the grid renders behind the verdict.
   */
  const [mode, setMode] = React.useState<"browse" | "select" | "compare">("browse");
  const [picked, setPicked] = React.useState<string[]>([]);

  const selecting = mode === "select";

  /**
   * What has been filed into this mission, and which half of the pane is showing.
   *
   * Ids rather than products, so one array is the whole of it and the order comes from
   * the results — see `addedProducts`. Both pieces of state are separate from `mode`:
   * adding is not a mode, it is a tap on a card that leaves you exactly where you were,
   * which is the difference between filing something and starting a task.
   *
   * Seeded from `filed`, which a mission arrives with — see that prop. The initialiser
   * runs once, so a later change to the seed does not reset what the reader has done.
   *
   * Deliberately not lifted above the route. Nothing persists this yet, so a provider
   * would only widen where the illusion holds — reload and it is gone either way — and
   * the missions board's own `collections` count keeps its fixture value. That
   * disagreement is real and visible, and it goes away with the first backend.
   */
  const [added, setAdded] = React.useState<string[]>(filed ?? []);
  const [tab, setTab] = React.useState<"results" | "mission">("results");

  /**
   * Which collection the mission tab has open in full, if any.
   *
   * Held here rather than inside `MissionCollections` because the dossier — on the
   * *other* side of the split — opens a named collection when one of its pills is
   * pressed. Two components setting one view is a value that belongs to their parent.
   */
  const [openCollection, setOpenCollection] = React.useState<ProductCategory | null>(null);

  /** A pill in the dossier: show the mission tab, on that collection. */
  const openCollectionFromBrief = React.useCallback((category: ProductCategory) => {
    setTab("mission");
    setOpenCollection(category);
  }, []);

  const toggleAdded = React.useCallback(
    (id: string) => {
      const next = added.includes(id) ? added.filter((addedId) => addedId !== id) : [...added, id];

      setAdded(next);

      // Removing the last piece of the collection being viewed leaves nowhere to be.
      // `MissionCollections` renders the overview when it cannot find the category, so
      // this is not about the current frame — it is about the *next* add of that
      // category silently reopening a collection nobody asked for.
      if (openCollection) {
        const survives = products.some(
          (product) => next.includes(product.id) && product.category === openCollection,
        );
        if (!survives) setOpenCollection(null);
      }
    },
    [added, openCollection, products],
  );

  /**
   * The filed pieces, resolved and ordered as the results grid shows them.
   *
   * Grid order, not the order they were added: the collections are a place things live
   * rather than a log of what you did, and a shelf that reorders itself by recency
   * makes the piece you added yesterday hard to find today.
   */
  const addedProducts = React.useMemo(
    () => products.filter((product) => added.includes(product.id)),
    [added, products],
  );

  /**
   * Toggle a pick, capped at `MAX_COMPARE`.
   *
   * Past the cap the tap is refused rather than replacing the oldest pick. At two the
   * replacement was the better call — "this one too" answered by silence looks broken.
   * At five it is the worse one: the tick that would disappear is somewhere else in a
   * grid you are not looking at, so the set changes behind your back while the count
   * stays put. Refusing is only defensible because the interface says so out loud —
   * the header reads "5 of 5 · full" and the unpicked cards go quiet. Neither half
   * works without the other.
   */
  const togglePick = React.useCallback((id: string) => {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((pickedId) => pickedId !== id);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, id];
    });
  }, []);

  /**
   * Drop one column from the comparison.
   *
   * Below two there is nothing left to compare, so the reader goes back to the grid
   * *still selecting*, with whatever survived ticked. That is the useful place to
   * land: they removed one because they wanted a different one, so the next tap
   * continues the job rather than starting it over.
   */
  const removeFromComparison = React.useCallback(
    (id: string) => {
      // Both setters called from the handler, not one from inside the other's updater.
      // An updater must be a pure function of its argument: React is free to run it
      // twice (it does, in development), and a `setMode` in there is a side effect that
      // runs twice with it. Reading `picked` from the closure is safe here because a
      // removal is a click, and a click always sees the rendered set.
      const next = picked.filter((pickedId) => pickedId !== id);
      setPicked(next);
      if (next.length < 2) setMode("select");
    },
    [picked],
  );

  /**
   * The opened product, and the href that opens one.
   *
   * `selfHref` may already carry a query (`/chat?q=…`) or not (`/chat/abc`), so the
   * separator has to be decided rather than assumed — appending `?p=` to a URL that
   * already has a `?` produces a second query string that no router will parse.
   */
  const productHref = React.useCallback(
    (slug: string) =>
      `${selfHref}${selfHref.includes("?") ? "&" : "?"}p=${encodeURIComponent(slug)}`,
    [selfHref],
  );

  const opened = React.useMemo(
    () => (productSlug ? (products.find((item) => item.slug === productSlug) ?? null) : null),
    [productSlug, products],
  );

  /**
   * The chosen set, resolved back to products and ordered as the grid shows them.
   *
   * Ordered by the grid rather than by pick order, so the leftmost column is the card
   * that was leftmost. Picking right-then-left and having the columns swap is
   * disorienting in a way that is hard to name and easy to feel.
   *
   * `null` unless there are genuinely at least two, which is what lets the render
   * below treat "compare" and "have something to compare" as one condition instead of
   * trusting the mode.
   */
  const compared = React.useMemo((): MockProduct[] | null => {
    if (mode !== "compare") return null;
    const set = products.filter((product) => picked.includes(product.id));
    return set.length >= 2 ? set : null;
  }, [mode, picked, products]);

  /** The set is full: every remaining card is unpickable until something is dropped. */
  const atCapacity = picked.length >= MAX_COMPARE;

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
              lets DOM order do the work.

              `opacity-80` holds it 20% below what the page headers carry, and the
              *mechanism* is the point: the alternative is redefining `--glow-gold`,
              `--glow-azure` and `--glow-gold-soft` on this element, which is six
              values across two themes copied out of the palette and left to drift from
              it. One number on the layer dims every light source in it, in both
              themes, and cannot disagree with the tokens it is dimming.

              Why quieter here at all: this column is a *reading* surface. The same wash
              behind a page header sits under a headline and 40px of white space, where
              here it sits behind twenty lines of 13px conversation. */}
          <div
            className="ambient-wash pointer-events-none absolute inset-0 opacity-80"
            aria-hidden="true"
          />

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
            {/* The dossier is the first thing *in* the thread, not a header over
                it: it scrolls away as the conversation grows, which is right for the
                opening of a conversation rather than a frame around one. */}
            {mission ? (
              <MissionDossier
                name={mission.name}
                image={mission.image}
                focus={mission.focus}
                added={addedProducts}
                productHref={productHref}
                onOpenCollection={openCollectionFromBrief}
              />
            ) : null}

            <WorkspaceThread messages={messages} />
          </div>

          <div className="relative shrink-0 px-4 pt-2 pb-4 lg:pb-5">
            <WorkspaceComposer />
          </div>
        </aside>

        {/* ── Products ─────────────────────────────────────────────────────── */}
        <section aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* The comparison replaces the grid rather than opening over it. A modal
              would put a decision about two products on top of the twelve you were
              choosing between, and the pane is the natural place for it — the
              conversation stays beside it, which is the whole point of the split. */}
          {/* A product wins over a comparison: `?p=` is in the URL, and the URL is
              the more authoritative statement of what the reader asked to see than a
              flag left over from a click. */}
          {opened ? (
            <div className={cn("px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8", "pb-56 lg:pb-10")}>
              {/* Keyed on the product, so opening a different one remounts rather
                  than reusing — see the note on its state.

                  `related` is the rest of these results, not this vendor's inventory.
                  The heading says otherwise and the mismatch is a known placeholder —
                  see the prop's own note. */}
              <ProductDetail
                key={opened.id}
                product={opened}
                backHref={selfHref}
                related={products.filter((item) => item.id !== opened.id).slice(0, 5)}
                relatedHref={productHref}
                // Filing works from the product page as well as the grid, and it is
                // the same state either way: open a piece, add it, go back, and the
                // tick is already on its card.
                inMissionWorkspace={Boolean(mission)}
                inMission={added.includes(opened.id)}
                onToggleMission={() => toggleAdded(opened.id)}
              />
            </div>
          ) : compared ? (
            <div className={cn("px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8", "pb-56 lg:pb-10")}>
              <ProductComparison
                products={compared}
                onBack={() => {
                  setPicked([]);
                  setMode("browse");
                }}
                // Keeps every pick, so changing one is a tap rather than starting
                // the selection over.
                onChangeSelection={() => setMode("select")}
                onRemove={removeFromComparison}
              />
            </div>
          ) : (
            <>
              {/* Pinned to the top of the pane rather than scrolling away with the
                  first row. Compare was easy to miss partly because it was styled
                  quietly and partly because it left the screen the moment you looked
                  at the results — a tool you only want *after* reading the grid
                  should still be there once you have.

                  A direct child of the scroll container, not of the padded wrapper:
                  inside the padding, the bar's background would stop short of the
                  gutters and cards would scroll visibly past its edges. */}
              <div
                className={cn(
                  "sticky top-0 z-10 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8",
                  "bg-canvas/90 backdrop-blur-md",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-4">
                  {/* ── Heading, or the tab strip ─────────────────────────────
                      A mission gets two tabs where every other workspace gets a
                      count, and they occupy the same slot on purpose: the strip *is*
                      the heading here, so the pane never carries both a title and a
                      switch fighting for the same line.

                      Hidden while selecting. Compare takes over the grid, and a tab
                      that would abandon a half-made selection is a trapdoor. */}
                  {mission && !selecting ? (
                    <div
                      role="tablist"
                      aria-label="Results or mission"
                      // An inset track with one half filled, rather than two
                      // underlined labels. Filing pieces into the mission is half of
                      // what this surface is for, and an 11px small-caps label with a
                      // hairline under it reads as a caption on the pane — something
                      // describing where you are, not something to press. A switch
                      // that looks like a switch is the whole of the fix.
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-premium-sm"
                    >
                      <PaneTab
                        active={tab === "results"}
                        count={products.length}
                        onClick={() => setTab("results")}
                      >
                        Results
                      </PaneTab>
                      <PaneTab
                        active={tab === "mission"}
                        count={added.length}
                        onClick={() => setTab("mission")}
                      >
                        In this mission
                      </PaneTab>
                    </div>
                  ) : (
                    <h2 className="text-eyebrow text-content-subtle">
                      {selecting
                        ? // The count is the instruction. A bare "Select some" leaves
                          // the reader counting ticks across a grid to work out where
                          // they are — and at the ceiling it is the only thing
                          // explaining why the next tap did nothing.
                          `Select up to ${MAX_COMPARE} to compare · ${picked.length} of ${MAX_COMPARE}${atCapacity ? " · full" : ""}`
                        : `${products.length} ${products.length === 1 ? "piece" : "pieces"} found`}
                    </h2>
                  )}

                  {selecting ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPicked([]);
                          setMode("browse");
                        }}
                        className={cn(
                          "rounded-md px-2 py-1.5 text-[13px] font-medium text-content-subtle",
                          "transition-colors duration-200 hover:text-content",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        )}
                      >
                        Cancel
                      </button>

                      {/* Genuinely disabled below two, not merely dimmed — there is
                          nothing to compare one product against, and letting the
                          click through would land on a half-built view. */}
                      <button
                        type="button"
                        disabled={picked.length < 2}
                        onClick={() => setMode("compare")}
                        className={cn(
                          "rounded-md bg-gold-solid px-3.5 py-1.5 text-[13px] font-semibold text-gold-content",
                          "transition-[background-color,opacity] duration-200",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          picked.length >= 2
                            ? "hover:bg-gold-solid-hover"
                            : "cursor-not-allowed opacity-40",
                        )}
                      >
                        {picked.length >= 2 ? `Compare these ${picked.length}` : "Compare"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-4">
                      {/* Omitted entirely rather than rendered empty — an empty `<p>`
                          here would still hold its line box and push the rule down.
                          Suppressed on the mission tab too: "ranked by how closely
                          each answers the brief" describes the search, and saying it
                          over a set the reader chose by hand is simply false. */}
                      {resultsNote && tab === "results" ? (
                        <p className="min-w-0 truncate text-[12px] text-content-subtle">
                          {resultsNote}
                        </p>
                      ) : null}

                      {/* Two is the floor: comparing a product with itself is not a
                          thing, so the control does not exist until it can work.

                          A solid accent fill, which nothing else in this pane is —
                          the cards carry no buttons, so it competes with nothing and
                          becomes the one thing the eye finds. It names the ceiling
                          rather than saying "Compare": the label has to say what it
                          will ask of you, or the mode change on click is a surprise —
                          and the number is what tells you this is a set you build
                          rather than a single choice. */}
                      {products.length >= 2 && tab === "results" ? (
                        <button
                          type="button"
                          onClick={() => setMode("select")}
                          className={cn(
                            "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2",
                            "bg-gold-solid text-[13px] font-semibold text-gold-content",
                            "shadow-[var(--shadow-edge),var(--shadow-premium-sm)]",
                            "transition-[background-color,box-shadow,transform] duration-200",
                            "hover:bg-gold-solid-hover active:scale-[0.98]",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          )}
                        >
                          <Scale className="size-4" aria-hidden="true" />
                          Compare up to {MAX_COMPARE}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="rule-fade h-px" aria-hidden="true" />
              </div>

              <div
                className={cn(
                  "px-4 pt-6 sm:px-6 lg:px-8",
                  // Clears the docked composer on mobile. On desktop the chat is a
                  // sibling column, so no allowance is needed.
                  "pb-56 lg:pb-10",
                )}
              >
                {mission && tab === "mission" ? (
                  <MissionCollections
                    products={addedProducts}
                    missionName={mission.name}
                    onRemove={toggleAdded}
                    productHref={productHref}
                    onFindMore={() => setTab("results")}
                    openCategory={openCollection}
                    onOpenCategory={setOpenCollection}
                  />
                ) : products.length === 0 ? (
                  <p className="py-20 text-center text-sm text-content-muted">
                    Nothing matched yet. Snapi is still looking.
                  </p>
                ) : (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 2xl:grid-cols-4">
                    {products.map((product) => (
                      <li key={product.id}>
                        <ProductCard
                          product={product}
                          href={productHref(product.slug)}
                          selectable={selecting}
                          selected={picked.includes(product.id)}
                          // Says "the set is full" on the cards themselves, which is
                          // where the refused tap happens. The header's count explains
                          // it; this is what makes it visible before you try.
                          atCapacity={atCapacity && !picked.includes(product.id)}
                          onToggle={() => togglePick(product.id)}
                          // Filing into the mission: only ever on in a mission
                          // workspace, and the card itself suppresses it while
                          // Compare has the grid.
                          addable={mission !== undefined}
                          inMission={added.includes(product.id)}
                          onToggleMission={() => toggleAdded(product.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/**
 * One tab in the results pane.
 *
 * A real `role="tab"` with `aria-selected`, inside the strip's `role="tablist"`. The
 * panel below is not marked up as a `tabpanel` on purpose: it is the whole scrolling
 * region of the pane, and pointing `aria-controls` at a container that also holds the
 * sticky strip itself would describe a loop.
 *
 * ## The count is the point of the tab
 *
 * "In this mission · 3" tells you both where you are and what is there, and it is what
 * makes adding legible: the number goes up as you tap, so the tap has a visible
 * consequence even while you stay on the results. Zero is rendered rather than hidden —
 * "In this mission · 0" is an invitation, where a bare label is a question.
 *
 * ## A filled half, not an underline
 *
 * It began as two small-caps labels with a 2px rule under the active one, which is a
 * perfectly good tab strip and the wrong control here: it read as a caption telling you
 * where you were, when filing into the mission is half of what the surface is *for*.
 * The active half is now a solid gold segment inside an inset track — the same fill as
 * the Compare button, which is the pane's other primary, so the two agree about what
 * "press me" looks like instead of one whispering.
 *
 * Sentence case at 13px rather than 11px small-caps for the same reason. Small caps are
 * for labelling things; this is a thing you press.
 */
function PaneTab({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap",
        "transition-[background-color,color,box-shadow] duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "bg-gold-solid text-gold-content shadow-[var(--shadow-edge)]"
          : "text-content-muted hover:text-content",
      )}
    >
      {children}

      {/* The count in its own chip, so it reads as a quantity rather than as part of
          the label. On the filled half it is a darker well in the gold — a *lighter*
          chip there would glow brighter than the label it belongs to. */}
      <span
        className={cn(
          "tabular grid min-w-[1.25rem] place-items-center rounded-full px-1 text-[11px] font-semibold",
          active ? "bg-[oklch(20%_0.02_70/0.14)] text-gold-content" : "text-content-subtle",
        )}
      >
        {count}
      </span>
    </button>
  );
}
