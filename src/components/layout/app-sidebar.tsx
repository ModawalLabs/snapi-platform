"use client";

import { Bell, ChevronsLeft, LogOut, PanelLeft, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { AskSnapiButton } from "@/components/layout/ask-snapi-button";
import { Logo } from "@/components/layout/logo";
import { ProfileAccount } from "@/components/layout/profile-account";
import { SidebarAction, SidebarItem } from "@/components/layout/sidebar-item";
import { useSidebar } from "@/components/layout/sidebar-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { sidebarNav } from "@/config/nav";
import { routes } from "@/config/routes";
import { mockCounts, mockRecents, type MockRecent } from "@/lib/mock-data";
import { MODALITY_ICON } from "@/lib/modality";
import { groupByRecency } from "@/lib/recency";
import { cn } from "@/lib/utils";

/**
 * How many recents the sidebar shows before deferring to the history page.
 *
 * The column scrolls, so this is not a space constraint — it is what makes "View
 * all" mean something. A rail that already lists everything turns the link into a
 * duplicate of what is on screen.
 *
 * Back to eight from five. Five was a concession to the composer that used to sit
 * directly beneath this list: every row carried the same weight, and the composer
 * was losing the contrast fight against them. With the composer docked to the
 * page there is nothing below Recents to protect, and the rail can go back to
 * being as useful as it can be.
 */
const RECENTS_LIMIT = 8;

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  // A route change must always dismiss the mobile drawer. Adjusting state during
  // render rather than in an effect resolves it in the same pass, so the drawer
  // never paints over the new route.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Inside the mobile drawer the sidebar is always expanded — collapsing a rail
  // that is already an overlay serves no purpose.
  const railed = collapsed;

  return (
    <>
      {/* Mobile trigger. Lives here rather than in the page so no route has to
          remember to render it. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className={cn(
          "fixed top-3 left-3 z-50 grid size-10 place-items-center rounded-md border border-border bg-surface/85 text-content shadow-premium-sm backdrop-blur-xl",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "md:hidden",
        )}
      >
        <PanelLeft className="size-[18px]" aria-hidden="true" />
      </button>

      {/* Scrim. Tapping it closes the drawer; it is not focusable, since Escape
          and the explicit close button already cover keyboard users. */}
      {mobileOpen ? (
        <div
          role="presentation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 animate-in bg-black/50 backdrop-blur-sm duration-200 fade-in md:hidden"
        />
      ) : null}

      <aside
        aria-label="Main navigation"
        data-collapsed={railed}
        className={cn(
          "z-50 flex shrink-0 flex-col border-r bg-surface/70 backdrop-blur-2xl",
          // Fixed overlay on mobile, in-flow column from md up.
          "fixed inset-y-0 left-0 md:sticky md:top-0 md:h-dvh md:translate-x-0",
          "transition-[width,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Tooltips in the rail escape horizontally, so x-overflow must stay visible.
          "overflow-x-visible",
        )}
        style={{
          width: railed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
        }}
      >
        {/* Header: lockup + collapse control */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center",
            railed ? "justify-center px-3" : "gap-2 px-4",
          )}
        >
          <Logo compact={railed} />

          {!railed ? (
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
                className="group relative hidden size-8 place-items-center rounded-md text-content-subtle transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-2 focus-visible:outline-ring md:grid"
              >
                <ChevronsLeft className="size-4" aria-hidden="true" />
                <Tooltip label="Collapse" shortcut="[" />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="grid size-8 place-items-center rounded-md text-content-subtle transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-2 focus-visible:outline-ring md:hidden"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        {/* Expand control, only reachable from the rail */}
        {railed ? (
          <div className="flex justify-center px-3 pb-2">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
              className="group relative grid size-8 place-items-center rounded-md text-content-subtle transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-2 focus-visible:outline-ring"
            >
              <PanelLeft className="size-4" aria-hidden="true" />
              <Tooltip label="Expand" shortcut="[" />
            </button>
          </div>
        ) : null}

        {/* The one action, above the destinations. It is deliberately not shaped
            like the rows below it — see `AskSnapiButton`. */}
        <div className={cn("shrink-0 pb-3", railed ? "flex justify-center px-3" : "px-4")}>
          <AskSnapiButton collapsed={railed} />
        </div>

        {/* Primary navigation */}
        <nav
          aria-label="Sections"
          className={cn("flex shrink-0 flex-col gap-0.5", railed ? "items-center px-3" : "px-4")}
        >
          {sidebarNav.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.title}
              tooltip={item.title}
              collapsed={railed}
              active={isActive(item.href)}
              count={item.badgeKey ? mockCounts[item.badgeKey] : undefined}
              countLabel="active"
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Recents — the only region that scrolls, so the header above and the
            account block below stay pinned regardless of history length. */}
        {railed ? (
          <div className="flex-1" />
        ) : (
          <RecentsSection
            recents={mockRecents}
            activePath={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        )}

        {/* The composer used to sit here, between Recents and the account block.
            It is now docked to the bottom of the page — see `FloatingComposer`.
            At 232px in a column of navigation it was permanently losing the
            contrast fight against the rows above it; the fix was more room, not
            more decoration. */}

        {/* Account block */}
        <div className={cn("shrink-0", railed ? "px-3" : "px-4")}>
          <div className="rule-fade mb-2 h-px" />

          <div className={cn("flex flex-col gap-0.5", railed && "items-center")}>
            <SidebarItem
              href={routes.notifications()}
              icon={Bell}
              label="Notifications"
              collapsed={railed}
              active={isActive(routes.notifications())}
              count={mockCounts.notifications}
              countLabel="unread"
              onNavigate={() => setMobileOpen(false)}
            />
            {/* Opens a dialog rather than navigating: everything the account row
                led to — identity, flavour, memory — fits in one card, and a
                round trip to a page for it would lose the reader's place. */}
            <ProfileAccount collapsed={railed} />
          </div>
        </div>

        {/* Footer: theme + logout. Pinned to the bottom edge. */}
        <div className={cn("shrink-0 pt-2 pb-3", railed ? "px-3" : "px-4")}>
          <div className="rule-fade mb-2 h-px" />

          {railed ? (
            <div className="flex flex-col items-center gap-0.5">
              <ThemeToggle collapsed />
              <SidebarAction
                icon={LogOut}
                label="Log out"
                collapsed
                tone="danger"
                onClick={handleLogout}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-content-muted hover:bg-danger-subtle hover:text-danger",
                  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/** Placeholder — swap for the real session teardown once auth exists. */
function handleLogout() {
  // Intentionally inert in the UI-only build.
}

/**
 * Recent conversations, bucketed by recency.
 *
 * Grouping rather than a flat list because a bare reverse-chronological column
 * gives no sense of *when* — users look for "the one from yesterday", not
 * "the fourth one down".
 */
function RecentsSection({
  recents,
  activePath,
  onNavigate,
}: {
  recents: MockRecent[];
  activePath: string;
  onNavigate: () => void;
}) {
  // Newest first, then trimmed — sorting after the slice would pick an arbitrary
  // eight and then order those, which is not the same thing.
  const groups = React.useMemo(
    () =>
      groupByRecency(
        [...recents]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, RECENTS_LIMIT),
      ),
    [recents],
  );

  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-1.5">
        <h2 className="text-[11px] font-semibold tracking-[0.08em] text-content-subtle uppercase">
          Recents
        </h2>

        {/* A link, not a button: it goes to a URL, so it must be openable in a new
            tab and reachable by the browser's own navigation. */}
        <Link
          href={routes.chats()}
          onClick={onNavigate}
          className={cn(
            "shrink-0 rounded-sm text-[11px] font-medium text-content-subtle transition-colors",
            "hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          View all
        </Link>
      </div>

      {/* `overscroll-contain` stops a scroll that bottoms out here from chaining
          into the page behind the mobile drawer. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
        {groups.length === 0 ? (
          <p className="px-1 py-3 text-xs leading-relaxed text-content-subtle">
            No conversations yet. Snap something to get started.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-3 last:mb-0">
              <h3 className="px-1 pt-1 pb-1 text-[10px] font-medium tracking-wide text-content-subtle">
                {group.label}
              </h3>
              <ul className="flex flex-col gap-px">
                {group.items.map((recent) => {
                  const href = routes.chat(recent.id);
                  const active = activePath === href;
                  const ModalityIcon = MODALITY_ICON[recent.modality];

                  return (
                    <li key={recent.id}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={recent.title}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] transition-colors",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          active
                            ? "bg-gold-subtle font-medium text-content"
                            : "text-content-muted hover:bg-surface-raised hover:text-content",
                        )}
                      >
                        <ModalityIcon
                          className={cn(
                            "size-3.5 shrink-0 transition-colors",
                            active ? "text-gold" : "text-content-subtle group-hover:text-gold",
                          )}
                          aria-hidden="true"
                        />
                        {/* truncate needs min-w-0 on a flex child or it overflows instead. */}
                        <span className="min-w-0 flex-1 truncate">{recent.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
