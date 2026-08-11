import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/routes";
import type { MockEditStory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Dispatches — the text-only column.
 *
 * Every magazine spread needs a page without pictures. Twelve photographs in a row
 * flattens into wallpaper: nothing is emphasised because everything is, and the
 * reader stops looking at any single image. A run of pure type resets the eye and
 * makes the photograph after it land again.
 *
 * These stories carry `image: null` in the data, so this is what they are for
 * rather than a fallback for a missing asset.
 *
 * Numbered, because an ordered run of headlines reads as a considered selection —
 * an editor's list — where the same three unnumbered would read as leftovers.
 */
export function DispatchList({ stories }: { stories: MockEditStory[] }) {
  return (
    <ol className="flex flex-col">
      {stories.map((story, index) => (
        <li key={story.id} className="border-t border-border first:border-t-0">
          <Link
            href={routes.editStory(story.slug)}
            className={cn(
              "group flex gap-5 py-6 first:pt-0",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
            )}
          >
            {/* Tabular so the numerals sit on one axis down the column. A
                proportional "1" is narrower than a "3" and the list edge wavers. */}
            <span
              className="tabular pt-1 text-[11px] font-semibold tracking-[0.14em] text-content-subtle"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
              {/* Category only — no read time, for the reason given on `Meta`. */}
              <p className="text-eyebrow text-gold">{story.category}</p>

              <h3 className="mt-2 flex items-start gap-2 text-lg leading-snug font-semibold text-balance text-content transition-colors duration-300 group-hover:text-gold">
                {story.title}
                <ArrowRight
                  className="mt-1.5 size-4 shrink-0 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </h3>

              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-content-muted">
                {story.standfirst}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
