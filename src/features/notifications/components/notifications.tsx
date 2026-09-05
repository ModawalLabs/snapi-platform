"use client";

import { ArrowRight, BellOff, Radar, TrendingDown, Bookmark } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useNotifications } from "@/components/providers/notifications-provider";
import { Cart } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHeader } from "@/components/ui/page-header";
import { type MockNotification, type NotificationKind } from "@/lib/mock-data";
import { groupByRecency } from "@/lib/recency";
import { cn } from "@/lib/utils";

/**
 * What changed while you were away.
 *
 * ## Grouped by when, marked by what
 *
 * Recency buckets — Today, Previous 7 days, Older — from the same `groupByRecency` the
 * sidebar's recents and the chat history use. If three surfaces disagreed about what
 * "Today" meant, the link between them would read as a bug.
 *
 * Grouping by *kind* was the other option and it is the wrong one for this page: a
 * price drop from an hour ago would sit under a mission update from last week, and the
 * page would stop answering the only question anyone opens it with. The kind still
 * shows on every row, as an eyebrow and a glyph, which is what makes the list scannable
 * without reordering it.
 *
 * ## Read is a state, not an action
 *
 * Unread rows carry a gold dot and a tinted ground. Opening one marks it read, and
 * "Mark all read" does the rest. There is no dismiss and no delete: a notification is a
 * record of something that happened, and a list you can prune is a list that cannot be
 * trusted to be complete.
 *
 * ## Why this is a Client Component
 *
 * The filter lives here and the read state comes from context. The rows are links, so
 * navigation still works with JavaScript busy; only the marking and the filtering need
 * the client.
 */
export function Notifications() {
  /**
   * Read state comes from the app shell, not from here.
   *
   * It has to: the act that marks a notification read is opening it, and opening it
   * navigates away from this page. State held here would be destroyed by the very
   * gesture that changed it. The sidebar badge reads the same source, so the count and
   * the list can never disagree. See `NotificationsProvider`.
   */
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [kind, setKind] = React.useState<NotificationKind | "all">("all");

  /**
   * Counts per tab, over *everything* rather than over what is showing.
   *
   * A tab whose own count changed when you selected it would be a tab reporting on the
   * filter rather than on the data.
   */
  const counts = React.useMemo(() => {
    const tally: Record<string, number> = { all: items.length };
    for (const item of items) tally[item.kind] = (tally[item.kind] ?? 0) + 1;
    return tally;
  }, [items]);

  const visible = React.useMemo(
    () => (kind === "all" ? items : items.filter((item) => item.kind === kind)),
    [items, kind],
  );

  // Newest first, then bucketed. The sort is here rather than in the fixture because
  // "most recent first" is how this page reads a list, not a fact about the data.
  const groups = React.useMemo(
    () =>
      groupByRecency(
        [...visible].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      ),
    [visible],
  );

  return (
    <>
      <PageHeader
        eyebrow="Notifications"
        meta={unread > 0 ? `${unread} unread` : "All read"}
        title="What moved while you were away"
        description="Price drops on what you are watching, what your missions have turned up, and changes to anything you have set aside."
      />

      <div className="container-page py-10 sm:py-12">
        {/* ── Filter and the one action ────────────────────────────────────
            The tabs filter for real — the data carries the kind, so nothing here is
            decorative. "Mark all read" sits opposite them and disappears when there
            is nothing left to mark, rather than sitting there disabled: a control
            that cannot act is a control that has to be explained. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pb-4">
          <div
            role="tablist"
            aria-label="Filter notifications"
            className="-mb-px flex flex-wrap items-center gap-1"
          >
            {KINDS.map((option) => (
              <FilterTab
                key={option.id}
                active={kind === option.id}
                count={counts[option.id] ?? 0}
                onClick={() => setKind(option.id)}
              >
                {option.label}
              </FilterTab>
            ))}
          </div>

          {unread > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className={cn(
                "shrink-0 rounded-md text-[13px] font-medium text-content-muted",
                "transition-colors duration-200 hover:text-gold",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {groups.length === 0 ? (
          <div className="py-20 text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid size-12 place-items-center rounded-full border border-dashed border-border-strong text-content-subtle"
            >
              <BellOff className="size-5" />
            </span>
            <p className="mt-5 font-display text-xl leading-tight font-normal text-content">
              Nothing of this kind yet.
            </p>
            <p className="mx-auto mt-2.5 max-w-[44ch] text-sm leading-relaxed text-content-muted">
              Snapi only sends these when something actually changes, so a quiet list is the list
              working.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <div className="flex items-baseline justify-between gap-4 pb-3">
                  <h2 className="text-eyebrow text-content-subtle">{group.label}</h2>
                  <p className="tabular text-[11px] text-content-subtle">{group.items.length}</p>
                </div>

                {/* Hairlines between rows, none above the first: the group's own
                    heading rule is the top edge, and two lines 3px apart is a
                    seam rather than a rule. */}
                <ul className="divide-y divide-border border-t border-border">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NotificationRow item={item} onOpen={() => markRead(item.id)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * The kinds, in the order they are worth reading.
 *
 * Price first because it is the one with a deadline, then missions, then the two
 * surfaces where a piece is already set aside. Every tab names the thing it filters the
 * way the rest of the app names it — "Snapi List", not "Saved" — so the filter and the
 * sidebar row it corresponds to cannot be read as two different features.
 */
const KINDS = [
  { id: "all", label: "All" },
  { id: "price", label: "Price drops" },
  { id: "mission", label: "Missions" },
  { id: "list", label: "Snapi List" },
  { id: "cart", label: "Cart" },
] as const satisfies ReadonlyArray<{ id: NotificationKind | "all"; label: string }>;

/** What each kind is called, and what it looks like, in one place. */
const KIND_META: Record<NotificationKind, { label: string; icon: typeof Radar; tone: string }> = {
  price: { label: "Price drop", icon: TrendingDown, tone: "text-gold" },
  mission: { label: "Mission", icon: Radar, tone: "text-gold" },
  list: { label: "Snapi List", icon: Bookmark, tone: "text-content-muted" },
  cart: { label: "Cart", icon: Cart, tone: "text-content-muted" },
};

/**
 * One notification.
 *
 * The whole row is the link, and the row is not a card. Eight cards in a column is a
 * page of boxes; eight ruled rows is a list you read down. The tint is reserved for
 * unread, which is the only state worth spending a background on.
 *
 * The photograph appears only where the notification is about a specific piece. A
 * mission update is about a *set*, and a stand-in image for it would be a picture of
 * something the sentence is not about — the placeholder frame is a designed surface, but
 * here the honest thing is no frame at all.
 */
function NotificationRow({ item, onOpen }: { item: MockNotification; onOpen: () => void }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;

  return (
    <Link
      href={item.href}
      onClick={onOpen}
      className={cn(
        "group flex items-start gap-4 px-3 py-4 sm:gap-5 sm:px-4",
        "transition-colors duration-200",
        item.read ? "hover:bg-surface-raised/60" : "bg-gold-subtle/40 hover:bg-gold-subtle/70",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
      )}
    >
      {/* The unread dot, in the gutter. Its space is reserved on read rows too, so a
          row does not shift left the moment it is opened. */}
      <span className="mt-2 grid w-2 shrink-0 place-items-center" aria-hidden="true">
        {item.read ? null : <span className="size-2 rounded-full bg-gold-solid" />}
      </span>

      {item.image ? (
        <MediaFrame
          src={item.image}
          alt=""
          focus={item.focus}
          scrim={false}
          sizes="64px"
          className="aspect-square w-14 shrink-0 rounded-lg shadow-premium-sm sm:w-16"
        />
      ) : (
        // A glyph in a ruled square where a photograph would be, so rows with and
        // without art keep the same left edge for their text. A missing image should
        // not re-set the row.
        <span
          aria-hidden="true"
          className={cn(
            "grid aspect-square w-14 shrink-0 place-items-center rounded-lg border border-dashed border-border-strong sm:w-16",
            meta.tone,
          )}
        >
          <Icon className="size-5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-eyebrow flex items-center gap-2 text-content-subtle">
          <Icon className={cn("size-3 shrink-0", meta.tone)} aria-hidden="true" />
          {meta.label}
          {item.read ? null : <span className="text-gold">· New</span>}
        </p>

        <p
          className={cn(
            "mt-1.5 text-[15px] leading-snug text-balance transition-colors duration-200",
            item.read ? "font-medium text-content" : "font-semibold text-content",
            "group-hover:text-gold",
          )}
        >
          {item.title}
        </p>

        <p className="mt-1.5 max-w-[68ch] text-[13px] leading-relaxed text-content-muted">
          {item.body}
        </p>
      </div>

      {/* Time and the arrow in one column at the right, so every row ends the same way
          however long its sentence is. `<time>` with a machine-readable datetime: the
          visible string is for people, the attribute is what a parser reads. */}
      <div className="flex shrink-0 flex-col items-end gap-3 pt-0.5">
        <time
          dateTime={item.updatedAt}
          className="tabular text-[11px] whitespace-nowrap text-content-subtle"
        >
          {relativeAge(item.updatedAt)}
        </time>

        <ArrowRight
          className="size-4 text-content-subtle transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-gold"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

/**
 * "2h", "3d", "2w" — the shortest true form.
 *
 * Not `Intl.RelativeTimeFormat`, which renders "2 hours ago" and would be the longest
 * string in a column set to be the narrowest. The unit is the only thing that has to
 * survive: "how long ago, roughly" is the whole question a timestamp answers in a list.
 *
 * Reads the clock, and the comment here used to say that was safe "because this
 * component is client-only and never server-rendered". It is not: a `"use client"`
 * component is still rendered to HTML on the server, which is precisely how this page
 * came to log a hydration mismatch. What makes it safe is that the timestamps it
 * measures against are now fixed per request, so the two readings are milliseconds
 * apart and round to the same label.
 */
function relativeAge(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;

  return `${Math.round(days / 7)}w`;
}

/**
 * One filter tab.
 *
 * Underlined rather than filled. The row sits on the page's own hairline and the count
 * is what makes it useful — a tab reading "Price drops 3" tells you whether the filter
 * is worth pressing before you press it.
 */
function FilterTab({
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
        "relative inline-flex items-center gap-2 rounded-t-md px-3 pb-3.5 text-[13px] font-semibold whitespace-nowrap",
        "transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active ? "text-content" : "text-content-subtle hover:text-content-muted",
        // Drawn as an element rather than a border, so inactive tabs keep the same
        // height and nothing shifts on switching.
        "after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:rounded-full",
        active ? "after:bg-gold-solid" : "after:bg-transparent",
      )}
    >
      {children}
      <span className={cn("tabular text-[11px]", active ? "text-gold" : "text-content-subtle")}>
        {count}
      </span>
    </button>
  );
}
