import { Bookmark, ConciergeBell, House, Radar, type LucideIcon } from "lucide-react";

import { routes } from "@/config/routes";

/**
 * Sidebar navigation.
 *
 * Ordering rationale — the primary group is sequenced by how often a returning
 * user opens it, not alphabetically or by feature size:
 *
 *  1. Concierge — where a session begins: the briefing, and the composer. First
 *                 because it is what a returning user opens most often, and
 *                 because starting over should never require finding your way
 *                 back to somewhere else first.
 *  2. Home      — the editorial front page.
 *  3. Missions  — background agent work. It changes without the user acting, so
 *                 it sits high and carries a live count. Anything that can
 *                 update on its own needs to be glanceable.
 *  4. Snapi List— saved items. Intentional, lower-frequency, no urgency.
 *
 * ## Concierge, not "New chat"
 *
 * It was called New chat, and that was two mistakes. It read as an *action* in a
 * list of places, and it collided with the `AskSnapiButton` directly above — two
 * controls a centimetre apart both promising to start a conversation, which is one
 * too many for anyone to reason about.
 *
 * A noun fixes both. The page it opens is a briefing — a greeting, the date, what
 * moved while you were away, what is still running — and it announces itself as
 * SNAPI CONCIERGE at the top, so label and destination now agree. The pair reads
 * as it should: ask in place, or go to the desk.
 *
 * Recents is a data-driven list and lives separately. Notifications and Profile
 * are account-scoped and live in the footer.
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
    title: "Concierge",
    href: routes.newChat(),
    icon: ConciergeBell,
    description: "Your briefing, and somewhere to begin",
  },
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
