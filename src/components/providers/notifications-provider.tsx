"use client";

import * as React from "react";

import type { MockNotification } from "@/lib/mock-data";

/**
 * Notifications, held for the session rather than for the page.
 *
 * ## Why this one is lifted when the others are not
 *
 * Nearly every other piece of mock state in this app lives in the component that shows
 * it, on the argument that nothing persists anyway. Read state cannot: the act that
 * marks a notification read is *opening it*, and opening it navigates. Page-local state
 * would be destroyed by the very gesture that changes it, so "tap a row and it stops
 * being new" would be a promise the app breaks every single time.
 *
 * Lifting it also settles a disagreement that has been visible since the rail was built:
 * the sidebar badge read a fixture constant while the page it links to had its own idea
 * of what was unread. Both now read from here, so the count goes down as things are read
 * — which is the whole point of a badge.
 *
 * It sits at the *root*, not in the `(app)` layout, and that is not a matter of taste
 * either. Notifications link into the workspace — a mission opens `/missions/:id`,
 * which is a different route group — and changing groups unmounts the `(app)` layout
 * with everything it holds. Mounted there, tapping a mission notification would mark it
 * read and then immediately forget, which is the exact failure lifting the state was
 * meant to fix.
 *
 * Still session-lived. There is no endpoint to send "I have read this" to, so a reload
 * starts from the fixture again — which is the honest state of the feature, not a bug in
 * this file.
 *
 * ## The list arrives as a prop
 *
 * It used to import the fixture directly, and that was the source of a hydration
 * mismatch on every notifications render: the fixture dated itself from `Date.now()` at
 * module scope, which is a different instant in the server process than in the browser.
 * The dates are now resolved once, on the server, in `Providers` — so the strings in the
 * HTML are the strings React hydrates with. See `NotificationSeed` in the fixture.
 */
interface NotificationsValue {
  items: MockNotification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = React.createContext<NotificationsValue | null>(null);

export function NotificationsProvider({
  initial,
  children,
}: {
  /**
   * The starting list, dated by the server. Read once into state, so a re-render of the
   * layout cannot reset what the reader has marked read.
   */
  initial: MockNotification[];
  children: React.ReactNode;
}) {
  // Never mutated: every change maps to new objects, so `initial` stays what it says it
  // is — where the list starts.
  const [items, setItems] = React.useState(initial);

  const markRead = React.useCallback((id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllRead = React.useCallback(() => {
    setItems((current) => current.map((item) => (item.read ? item : { ...item, read: true })));
  }, []);

  const unread = items.reduce((total, item) => total + (item.read ? 0 : 1), 0);

  const value = React.useMemo(
    () => ({ items, unread, markRead, markAllRead }),
    [items, unread, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/**
 * Throws outside the provider rather than returning a default.
 *
 * A silent fallback here would mean a badge that never moves and a page that cannot mark
 * anything read, with nothing to point at — the failure would look like a bug in the
 * feature instead of a missing provider.
 */
export function useNotifications(): NotificationsValue {
  const value = React.useContext(NotificationsContext);
  if (!value) {
    throw new Error("useNotifications must be used inside <NotificationsProvider>");
  }
  return value;
}
