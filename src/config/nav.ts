import { Bookmark, House, Radar, type LucideIcon } from "lucide-react";

import { routes } from "@/config/routes";

/**
 * Sidebar navigation.
 *
 * Ordering rationale — the primary group is sequenced by how often a returning
 * user opens it, not alphabetically or by feature size:
 *
 *  1. Home      — the snap/ask entry point; the reason the app is open at all.
 *  2. Missions  — background agent work. It changes without the user acting, so
 *                 it sits high and carries a live count. Anything that can
 *                 update on its own needs to be glanceable.
 *  3. Snapi List— saved items. Intentional, lower-frequency, no urgency.
 *
 * "New chat" is an *action*, not a destination, so it is not in this list — it
 * gets button treatment above the nav. Recents is a data-driven list, also
 * separate. Notifications and Profile are account-scoped and live in the footer.
 */

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Which mock counter feeds this item's badge, if any. */
  badgeKey?: "missions";
  /** Short hint shown in the collapsed rail's tooltip. */
  description: string;
}

export const sidebarNav: SidebarNavItem[] = [
  {
    title: "Home",
    href: routes.home(),
    icon: House,
    description: "Snap, say, or search",
  },
  {
    title: "Missions",
    href: routes.missions(),
    icon: Radar,
    badgeKey: "missions",
    description: "Agents working in the background",
  },
  {
    title: "Snapi List",
    href: routes.snapiList(),
    icon: Bookmark,
    description: "Everything you've saved",
  },
];
