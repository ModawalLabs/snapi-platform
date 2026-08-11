import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Numbered pagination, driven by the URL.
 *
 * `buildHref` rather than a base path, so the caller keeps ownership of its query
 * string — a page control has no business knowing which other params a route
 * carries, and rebuilding the URL here would silently drop them.
 *
 * Accessibility notes:
 *  - Prev/Next render as `<span>` when unavailable, never a disabled `<a>`. There
 *    is no such thing as a disabled link: an anchor with `aria-disabled` is still
 *    focusable and still followable, so it lies to keyboard users.
 *  - The current page carries `aria-current="page"`; colour alone is not a signal.
 *  - Ellipses are `aria-hidden` — "…" announced between numbers is noise.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <Step
        direction="prev"
        href={page > 1 ? buildHref(page - 1) : undefined}
        label="Previous page"
      />

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="w-6 text-center text-sm text-content-subtle select-none"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={buildHref(entry)}
            aria-current={entry === page ? "page" : undefined}
            aria-label={`Page ${entry}`}
            className={cn(
              "tabular grid h-9 min-w-9 place-items-center rounded-md px-2 text-sm focus-visible:outline-ring",
              "transition-[background-color,color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
              entry === page
                ? "border border-gold-border bg-gold-subtle font-semibold text-gold"
                : "border border-transparent text-content-muted hover:bg-surface-raised hover:text-content",
            )}
          >
            {entry}
          </Link>
        ),
      )}

      <Step
        direction="next"
        href={page < totalPages ? buildHref(page + 1) : undefined}
        label="Next page"
      />
    </nav>
  );
}

function Step({
  direction,
  href,
  label,
}: {
  direction: "prev" | "next";
  href?: string;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const shared =
    "grid size-9 place-items-center rounded-md border transition-[background-color,color,border-color] duration-200";

  if (!href) {
    return (
      <span
        aria-hidden="true"
        className={cn(shared, "cursor-default border-transparent text-content-subtle/40")}
      >
        <Icon className="size-4" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        shared,
        "border-border text-content-muted hover:border-gold-border hover:text-gold",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Link>
  );
}

/**
 * Read a `?page=` value into a usable page number.
 *
 * Anything that is not a positive integer falls back to page 1. `?page=abc`,
 * `?page=-3` and `?page=` are user-supplied strings, not trusted input, and
 * `Number("abc")` is `NaN` — which makes every downstream comparison false and
 * silently renders an empty list.
 *
 * Lives here so every paginated route parses its param the same way. Safe to
 * import from a Server Component: this module has no `"use client"`.
 */
export function parsePageParam(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

/**
 * Page numbers to render, with `"gap"` where a run is elided.
 *
 * Always shows the first and last page plus a window around the current one, so
 * "jump to the end" stays one click away no matter how long the list gets.
 */
function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const out: Array<number | "gap"> = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);

  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < totalPages - 1) out.push("gap");

  out.push(totalPages);
  return out;
}
