import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Page-level header for an interior app route.
 *
 * Distinct from `SectionHeader`, which hardcodes an `<h2>` because it labels a
 * band *within* a page. Reusing it here would leave the route with no `<h1>` at
 * all — the document outline would start at h2 and assistive tech would have
 * nothing to announce as the page's title.
 *
 * Carries the display serif and a bounded ambient wash, so interior pages share
 * the home banner's register without repeating its full photographic treatment.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Small trailing detail, e.g. a count. Sits beside the eyebrow. */
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ambient-canvas relative", className)}>
      <div className="container-page pt-12 pb-10 sm:pt-16 sm:pb-12">
        {eyebrow || meta ? (
          <div className="flex items-center gap-3">
            {eyebrow ? <p className="text-eyebrow text-gold">{eyebrow}</p> : null}
            {eyebrow && meta ? (
              <span className="h-px w-5 bg-border-strong" aria-hidden="true" />
            ) : null}
            {meta ? <p className="text-[11px] tracking-wide text-content-subtle">{meta}</p> : null}
          </div>
        ) : null}

        {/* `font-normal` — Oranienbaum ships one weight, and anything heavier makes
            the browser synthesise a fake bold that smears the serifs. */}
        <h1
          className={cn(
            "font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] font-normal tracking-[-0.008em] text-content",
            eyebrow || meta ? "mt-4" : "",
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-content-muted">
            {description}
          </p>
        ) : null}
      </div>

      <div className="rule-fade h-px" aria-hidden="true" />
    </div>
  );
}
