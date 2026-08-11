import Link from "next/link";

import { routes } from "@/config/routes";
import type { MockEditStory } from "@/lib/mock-data";

/**
 * Departments — the short answers, as a dense index.
 *
 * Deliberately the smallest unit on the page: a rule, a number, a category and a
 * headline, and nothing else. No standfirst, no image, no arrow. Everything above
 * this point argues for a piece; this block assumes the reader has decided how
 * they browse and just needs the list.
 *
 * That density is what makes it work as an ending. A magazine narrows toward the
 * back — features, then columns, then the index — and the same taper is what stops
 * a long page from feeling like it simply ran out.
 *
 * Four columns at `lg` rather than one long list: eight items stacked would add a
 * screen of height for information that is meant to be scanned in a glance.
 */
export function DepartmentIndex({ stories }: { stories: MockEditStory[] }) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
      {stories.map((story, index) => (
        <li key={story.id}>
          <Link
            href={routes.editStory(story.slug)}
            className="group flex gap-3 border-t border-border py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {/* Tabular so the numerals sit on one axis down each column. */}
            <span
              className="tabular pt-0.5 text-[10px] font-semibold tracking-[0.14em] text-content-subtle"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <p className="text-eyebrow text-gold">{story.category}</p>
              <h3 className="mt-1.5 text-[15px] leading-snug font-semibold text-balance text-content transition-colors duration-300 group-hover:text-gold">
                {story.title}
              </h3>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
