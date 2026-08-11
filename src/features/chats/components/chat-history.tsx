import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { routes } from "@/config/routes";
import { mockRecents } from "@/lib/mock-data";
import { MODALITY_ICON, MODALITY_LABEL } from "@/lib/modality";
import { groupByRecency } from "@/lib/recency";
import { formatCompact, formatDate } from "@/lib/utils";

/**
 * Chat history — every conversation, where the sidebar shows only the newest few.
 *
 * A **Server Component**. Nothing here is interactive: the rows are links, the
 * grouping is derived, and there is no state to own. Marking it `"use client"`
 * would ship the whole list to the browser for no behaviour in return.
 *
 * Same recency buckets as the sidebar, from the same `groupByRecency` — if the two
 * surfaces disagreed about what "Today" means, the link between them would read as
 * a bug. That function reads the clock, which is safe here precisely *because*
 * this renders on the server only and never hydrates.
 *
 * ## Pagination and grouping together
 *
 * The flat list is sliced into pages first, and only the current page is grouped.
 * Grouping before slicing would let a page start halfway through "Previous 7
 * days" with no heading above it. Done this way a day heading can still span two
 * pages, but each page states which day it is showing.
 *
 * The page number lives in the URL, read on the server in `page.tsx` and passed
 * down — so `?page=2` is shareable and the back button works.
 */
const PAGE_SIZE = 10;

export function ChatHistory({ page }: { page: number }) {
  const conversations = [...mockRecents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const totalPages = Math.max(1, Math.ceil(conversations.length / PAGE_SIZE));
  // Clamped rather than 404'd: `?page=99` on a list that has shrunk is a stale
  // link, not a mistake worth an error page.
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  const groups = groupByRecency(conversations.slice(start, start + PAGE_SIZE));

  return (
    <>
      <PageHeader
        eyebrow="History"
        meta={`${formatCompact(conversations.length)} ${
          conversations.length === 1 ? "conversation" : "conversations"
        }`}
        title="Chat History"
        description="Everything you've asked Snapi, newest first. Open one to pick it up where you left off."
      />

      <div className="container-page py-10 sm:py-12">
        {groups.length === 0 ? (
          <p className="py-16 text-center text-sm text-content-muted">
            No conversations yet. Snap, say, or search something to start one.
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <section key={group.label}>
                {/* Sticky so the day you are reading stays named while you scroll
                    past a long run of rows. */}
                <h2 className="sticky top-0 z-10 -mx-2 bg-canvas/85 px-2 py-2 text-[11px] font-semibold tracking-[0.08em] text-content-subtle uppercase backdrop-blur-sm">
                  {group.label}
                </h2>

                {/* `<ol>` — the order is meaningful, so "3 of 8" tells a screen
                    reader user something true. */}
                {/* `divide-y` rather than a border on each row: it draws the rule
                    between rows only, so the last one needs no exception. */}
                <ol className="mt-2 flex flex-col divide-y divide-border">
                  {group.items.map((conversation) => {
                    const Icon = MODALITY_ICON[conversation.modality];

                    return (
                      <li key={conversation.id}>
                        {/* The whole row is one link. Unlike a saved item, a
                            conversation has exactly one destination, so there is
                            nothing to nest and the entire row can be the target. */}
                        <Link
                          href={routes.chat(conversation.id)}
                          className="group flex items-center gap-4 rounded-lg border border-transparent px-3 py-3.5 transition-[background-color,border-color] duration-300 hover:border-border hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <span
                            className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-raised text-content-subtle transition-colors duration-300 group-hover:border-gold-border group-hover:text-gold"
                            aria-hidden="true"
                          >
                            <Icon className="size-4" />
                          </span>

                          <span className="min-w-0 flex-1">
                            {/* One line, clipped. A history row is an index entry;
                                letting a long question wrap to three lines makes
                                the column impossible to scan. The full text is in
                                the tooltip and read out in full by a screen
                                reader, so nothing is actually lost. */}
                            <span
                              title={conversation.title}
                              className="block truncate text-sm font-medium text-content"
                            >
                              {conversation.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-content-subtle">
                              {MODALITY_LABEL[conversation.modality]}
                              <span aria-hidden="true"> · </span>
                              <time dateTime={conversation.updatedAt}>
                                {formatDate(conversation.updatedAt)}
                              </time>
                            </span>
                          </span>

                          <ArrowUpRight
                            className="size-4 shrink-0 text-content-subtle opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}

            <Pagination
              page={safePage}
              totalPages={totalPages}
              buildHref={(next) => (next === 1 ? routes.chats() : `${routes.chats()}?page=${next}`)}
              className="pt-2"
            />
          </div>
        )}
      </div>
    </>
  );
}
