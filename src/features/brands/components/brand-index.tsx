import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { routes } from "@/config/routes";
import { BrandPlate } from "@/features/brands/components/brand-plate";
import { ALPHABET, groupByInitial } from "@/features/brands/lib/group";
import { mockBrands } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * `/brands` — the register of maisons, A–Z.
 *
 * ## Designed around what actually exists
 *
 * Snapi has a mark and a name per house. Nothing else. Every richer layout —
 * hero imagery, house descriptions, founding years — would need copy invented for
 * it, and a page built on invented content collapses the day it meets the real
 * feed.
 *
 * So this is a *register*: the form print has used for a list of names since long
 * before it had photography. It earns its premium feel from structure and air
 * rather than from content it does not have — a hanging letter in the margin, a
 * generous grid of plates, one type size, one rule.
 *
 * ## The alphabet is the navigation
 *
 * With forty houses and no categories to filter by, the initial is the only axis
 * a reader can navigate on, so it is given real weight: a sticky bar of letters
 * that reduces the register to one letter at a time.
 *
 * The selection lives in the URL (`?letter=B`), not in component state. That
 * keeps this a Server Component, makes a filtered view shareable and
 * refresh-proof, and gives the back button the behaviour it looks like it has.
 * The letter is read in `page.tsx` and passed down.
 *
 * Letters with no maisons render as dimmed spans rather than dead links. There is
 * no such thing as a disabled link — an `aria-disabled` anchor is still focusable
 * and still followable, so it lies to keyboard users.
 *
 * A Server Component throughout: the bar is links, the plates are links, and
 * nothing here reacts. A client-side filter would pull the whole register into
 * the browser to save a navigation that is already instant.
 */
/**
 * The selected letter is marked by fill, not by colour alone — `aria-current` is
 * on it too, so the state survives for anyone who cannot see the gold.
 */
const SEGMENT = cn(
  "grid h-7 place-items-center rounded-sm text-[12px] font-semibold",
  "transition-[background-color,color] duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
);
const ACTIVE = "bg-gold-solid text-gold-content";
const INACTIVE = "text-content-muted hover:bg-gold-subtle hover:text-gold";

export function BrandIndex({ letter }: { letter: string | null }) {
  const groups = groupByInitial(mockBrands);
  const present = new Set(groups.map((group) => group.letter));

  // A letter nobody files under falls back to the whole register rather than an
  // empty page. The bar never links to one, so this only happens on a hand-typed
  // or stale URL — and showing everything is a better answer than showing nothing.
  const active = letter && present.has(letter) ? letter : null;
  const visible = active ? groups.filter((group) => group.letter === active) : groups;
  const count = visible.reduce((total, group) => total + group.brands.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Maisons on Snapi"
        title="Designer Worlds"
        description="Every house Snapi carries, from authorised boutiques to vetted resale. Open one and ask for anything in it."
      />

      <div className="container-page">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-10 pb-6 sm:pt-12">
          <p className="text-eyebrow text-content-subtle">The register</p>
          <p className="text-[11px] tracking-wide text-content-subtle">
            {/* Reflects what is on screen, not the archive total — a count that
                ignored the filter would contradict the grid under it. */}
            {count} {count === 1 ? "maison" : "maisons"}
            {active ? ` under ${active}` : ""}
          </p>
        </div>

        {/* Sticky index. Full-bleed background so rows scrolling underneath are
            covered edge to edge rather than showing through beside it. */}
        <nav
          aria-label="Filter by letter"
          className="sticky top-0 z-20 -mx-4 border-y border-border bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5">
            {/* The way back. Without it, filtering is a one-way door — you would
                have to reach for the browser's back button to see the register
                again, which is not a control the page gets to rely on. */}
            <li className="mr-1.5">
              <Link
                href={routes.brands()}
                aria-current={active ? undefined : "true"}
                className={cn(SEGMENT, "px-2.5", active ? INACTIVE : ACTIVE)}
              >
                All
              </Link>
            </li>

            {ALPHABET.map((entry) => (
              <li key={entry}>
                {present.has(entry) ? (
                  <Link
                    // Clicking the selected letter again clears the filter. A
                    // toggle costs nothing and is what people try first.
                    href={entry === active ? routes.brands() : `${routes.brands()}?letter=${entry}`}
                    aria-current={entry === active ? "true" : undefined}
                    aria-label={
                      entry === active ? `Clear the ${entry} filter` : `Show maisons under ${entry}`
                    }
                    className={cn(SEGMENT, "tabular size-7", entry === active ? ACTIVE : INACTIVE)}
                  >
                    {entry}
                  </Link>
                ) : (
                  <span
                    aria-hidden="true"
                    className="tabular grid size-7 cursor-default place-items-center rounded-sm text-[12px] font-medium text-content-subtle/35"
                  >
                    {entry}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* One continuous grid, letters included as cells.
         *
         * The obvious layout — a section per letter with the guide letter hanging
         * in the left margin — was built first and thrown away. Thirty-seven
         * houses across seventeen letters averages two per letter, so every
         * section became one plate against a half-empty row and the page ran to
         * four screens of whitespace. Sparse is not the same as spacious.
         *
         * Setting the letters *in* the flow fixes it: rows fill, the page halves
         * in length, and it reads as a type specimen — which is a more
         * interesting object than a directory anyway.
         *
         * `items-stretch` is the grid default and is load-bearing: it is what
         * makes each letter cell take its row's height, and what keeps a plate
         * whose name wraps to two lines level with its neighbours. */}
        <ul className="grid grid-cols-2 gap-3 pt-10 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.flatMap((group) => [
            // `aria-hidden` — the letter is a visual marker, and a screen reader
            // announcing "list item, A" between maisons is noise. Filtering by
            // letter is served by the labelled bar above, which is the accessible
            // affordance for the same job.
            <li
              key={`letter-${group.letter}`}
              aria-hidden="true"
              className="flex items-center justify-center py-4"
            >
              <span className="font-display text-4xl leading-none font-normal text-content-subtle/45 sm:text-5xl">
                {group.letter}
              </span>
            </li>,

            ...group.brands.map((brand) => (
              <li key={brand.id}>
                <BrandPlate brand={brand} />
              </li>
            )),
          ])}
        </ul>

        {/* Colophon, as on The Edit — the same sign-off closes both registers. */}
        <p className="border-t border-border pt-10 pb-16 text-center font-display text-lg leading-none font-normal tracking-[0.01em] text-content-muted sm:text-xl">
          Curated, effortlessly
        </p>
      </div>
    </>
  );
}
