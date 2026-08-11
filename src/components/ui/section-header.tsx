import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Section heading with an optional trailing action.
 *
 * Enforces one thing across the whole page: heading levels. Each section passes
 * its own `id` and the heading is always an `<h2>`, so the document outline stays
 * h1 → h2 → h3 no matter what order sections get rearranged into. Hand-rolled
 * headings per section is how pages end up with three h1s and no h2.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-eyebrow text-gold">{eyebrow}</p> : null}

        <h2
          id={id}
          className={cn(
            "display-lg text-2xl font-semibold text-content sm:text-[2rem]",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-content-muted">{description}</p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            "group hidden shrink-0 items-center gap-1.5 rounded-sm text-content-muted hover:text-gold focus-visible:outline-ring",
            "text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 sm:inline-flex",
          )}
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Consistent vertical rhythm for a page section.
 *
 * `aria-labelledby` wiring is built in rather than left to each caller — a
 * `<section>` with no accessible name is invisible in a screen reader's landmark
 * list, which is most of the value of using `<section>` at all.
 */
export function Section({
  id,
  children,
  className,
  bleed = false,
}: {
  /** Must match the `id` given to the SectionHeader inside. */
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Skip the content container — for full-width rows like the marquee. */
  bleed?: boolean;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("py-14 sm:py-20", !bleed && "container-page", className)}
    >
      {children}
    </section>
  );
}
