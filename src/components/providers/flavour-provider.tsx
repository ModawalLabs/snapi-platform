"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { COOKIES, PREFERENCE_COOKIE_MAX_AGE } from "@/config/cookies";
import { DEFAULT_FLAVOUR, type Flavour } from "@/config/flavour";

/**
 * Which edition of Snapi is on screen.
 *
 * Deliberately shaped like `SidebarProvider`: the server reads the cookie and
 * seeds `defaultFlavour`, so the first HTML is already correct and nothing
 * flashes. The provider then owns changes.
 *
 * ## Three things happen on a switch, and all three are necessary
 *
 *  1. **The cookie is written**, so the choice outlives the tab.
 *  2. **`<html data-flavour>` is set directly**, so the accent changes on the
 *     same frame as the click. Waiting for React to re-render the document
 *     element is not an option — the attribute lives above the React root.
 *  3. **`router.refresh()`** re-runs the Server Components with the new cookie.
 *     That is what swaps the home page's headings, which are chosen on the
 *     server. It is a soft refresh: client state and scroll survive, so the
 *     profile dialog stays open while the page underneath re-renders.
 *
 * Doing only (2) would give a blue app with Signature's wording. Doing only (3)
 * would leave the accent gold until the payload lands.
 */

interface FlavourContextValue {
  flavour: Flavour;
  setFlavour: (next: Flavour) => void;
}

const FlavourContext = React.createContext<FlavourContextValue | null>(null);

export function FlavourProvider({
  defaultFlavour = DEFAULT_FLAVOUR,
  children,
}: {
  defaultFlavour?: Flavour;
  children: React.ReactNode;
}) {
  const [flavour, setFlavourState] = React.useState<Flavour>(defaultFlavour);
  const router = useRouter();

  const setFlavour = React.useCallback(
    (next: Flavour) => {
      setFlavourState(next);
      document.documentElement.dataset.flavour = next;
      document.cookie = `${COOKIES.flavour}=${next}; path=/; max-age=${PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  const value = React.useMemo(() => ({ flavour, setFlavour }), [flavour, setFlavour]);

  return <FlavourContext.Provider value={value}>{children}</FlavourContext.Provider>;
}

export function useFlavour(): FlavourContextValue {
  const context = React.useContext(FlavourContext);
  if (!context) throw new Error("useFlavour must be used within <FlavourProvider>");
  return context;
}
