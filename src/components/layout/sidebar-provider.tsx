"use client";

import * as React from "react";

import { COOKIES, PREFERENCE_COOKIE_MAX_AGE } from "@/config/cookies";

/**
 * Sidebar open/collapsed state.
 *
 * The initial value is passed in from the server (read from a cookie in the app
 * layout) rather than from `localStorage`. That distinction matters: with
 * `localStorage` the server always renders the expanded rail and the client
 * snaps it shut after hydration, which is a visible width jump on every reload
 * for anyone who prefers the collapsed rail. Reading a cookie means the very
 * first HTML is already correct.
 *
 * Desktop collapse and mobile drawer are separate pieces of state on purpose.
 * Collapsing the rail on desktop and closing an overlay on mobile are different
 * user intents, and conflating them means resizing the window silently changes
 * what the user chose.
 */

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      document.cookie = `${COOKIES.sidebarCollapsed}=${next}; path=/; max-age=${PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax`;
      return next;
    });
  }, []);

  // `[` toggles the rail — the shortcut used by most desktop-class apps.
  // Skipped while the user is typing, or the key never reaches the input.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "[" || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      toggleCollapsed();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCollapsed]);

  // Mobile drawer: Escape closes it, and the page behind it must not scroll.
  // Both are expected of any overlay; omitting the scroll lock is the classic
  // "background crept up while I was scrolling the menu" bug.
  React.useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const value = React.useMemo(
    () => ({ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, toggleCollapsed, mobileOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within <SidebarProvider>.");
  }
  return context;
}
