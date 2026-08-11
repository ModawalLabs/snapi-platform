import type * as React from "react";

import { FlavourProvider } from "@/components/providers/flavour-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Flavour } from "@/config/flavour";

/**
 * Single composition point for app-wide providers.
 *
 * Keep this list short. Every provider added here runs on every page, so
 * anything only one feature needs belongs closer to that feature.
 */
export function Providers({
  flavour,
  nonce,
  children,
}: {
  /** Read from the cookie in the root layout, so the first paint is correct. */
  flavour?: Flavour;
  /** Per-request CSP nonce, for providers that emit their own inline script. */
  nonce?: string;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider nonce={nonce}>
      <FlavourProvider defaultFlavour={flavour}>
        <QueryProvider>{children}</QueryProvider>
      </FlavourProvider>
    </ThemeProvider>
  );
}
