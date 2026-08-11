"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * A single sidebar row, in either the expanded or collapsed (rail) state.
 *
 * Both states share one component so the active-state logic, focus ring, and
 * hit area can never drift apart between them.
 *
 * Accessibility notes:
 *  - The label is always in the DOM. When collapsed it is visually hidden but
 *    kept as the `aria-label`, so the accessible name never disappears — an
 *    icon-only link with no name is the single most common a11y defect in
 *    collapsible sidebars.
 *  - `aria-current="page"` marks the active row; colour alone is not a signal.
 *  - A badge count is folded into the accessible name ("Missions, 3 active")
 *    rather than left as a bare number floating next to the link.
 */

export interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  active?: boolean;
  /** Numeric badge. Rendered as a pill expanded, as a dot in the rail. */
  count?: number;
  /** Describes what the count means, for the accessible name. */
  countLabel?: string;
  tooltip?: string;
  onNavigate?: () => void;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  collapsed,
  active = false,
  count,
  countLabel = "new",
  tooltip,
  onNavigate,
}: SidebarItemProps) {
  const hasCount = typeof count === "number" && count > 0;
  const accessibleName = hasCount ? `${label}, ${count} ${countLabel}` : label;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={accessibleName}
      className={cn(
        "group relative flex h-10 items-center rounded-md text-sm font-medium",
        "transition-[background-color,color] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        collapsed ? "w-10 justify-center" : "gap-3 px-3",
        active
          ? "bg-gold-subtle text-content"
          : "text-content-muted hover:bg-surface-raised hover:text-content",
      )}
    >
      {/* Active marker: a gold bar on the leading edge. Reads instantly in the
          rail, where a background tint alone is ambiguous on a 40px square. */}
      {active ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-solid"
        />
      ) : null}

      <Icon
        className={cn("size-[18px] shrink-0 transition-colors", active && "text-gold")}
        aria-hidden="true"
      />

      {collapsed ? (
        <Tooltip label={tooltip ?? label} />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {hasCount ? (
            <span
              aria-hidden="true"
              // Gold, not neutral grey: these counts represent work the user has
              // not seen yet (agents running, unread alerts). A count that does
              // not attract the eye is the same as no count at all.
              className={cn(
                "tabular grid h-5 min-w-5 place-items-center rounded-full border px-1.5 text-[11px] font-semibold",
                active
                  ? "border-transparent bg-gold-solid text-gold-content"
                  : "border-gold-border bg-gold-subtle text-gold",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </>
      )}

      {/* In the rail there is no room for a number, so presence is shown as a
          dot. The count itself still reaches assistive tech via aria-label. */}
      {collapsed && hasCount ? (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gold-solid ring-2 ring-canvas"
        />
      ) : null}
    </Link>
  );
}

/**
 * Button-shaped sibling of SidebarItem, for actions rather than destinations
 * (logout, theme, collapse). Same metrics so rows line up across both kinds.
 */
export function SidebarAction({
  icon: Icon,
  label,
  collapsed,
  tooltip,
  onClick,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  tooltip?: string;
  onClick?: () => void;
  tone?: "default" | "danger";
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group relative flex h-10 items-center rounded-md text-sm font-medium",
        "transition-[background-color,color] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        collapsed ? "w-10 justify-center" : "w-full gap-3 px-3",
        tone === "danger"
          ? "text-content-muted hover:bg-danger-subtle hover:text-danger"
          : "text-content-muted hover:bg-surface-raised hover:text-content",
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      {collapsed ? (
        <Tooltip label={tooltip ?? label} />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          {children}
        </>
      )}
    </button>
  );
}
