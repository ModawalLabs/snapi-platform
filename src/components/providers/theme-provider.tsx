"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

/**
 * Theme provider.
 *
 * `next-themes` writes the class to <html> before paint via an inline script,
 * which is what prevents the white-flash-then-dark on first load.
 *
 * That script is exactly the thing a nonce CSP exists to stop, so it has to be
 * told the nonce. Next stamps its *own* inline scripts automatically by reading
 * the policy off the request header, but it cannot reach inside a third-party
 * component — so the value is read in the root layout and passed down. Without
 * it the browser reports a violation on every page load, and the moment the
 * policy stops being report-only the script is blocked outright and the theme
 * flashes on every navigation.
 */
export function ThemeProvider({ nonce, children }: { nonce?: string; children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  );
}
