import type * as React from "react";

import { FlavourProvider } from "@/components/providers/flavour-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Flavour } from "@/config/flavour";
import { currentNotifications } from "@/lib/mock-data";

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
        <QueryProvider>
          {/* Root rather than the app shell: a notification can lead into the
              full-screen workspace, which is another route group, and read state has
              to survive that. See the provider.

              The list is dated once, on the server, per request. That is what makes
              the timestamps in the HTML identical to the ones the browser hydrates
              with — the fixture used to date itself on both sides and they disagreed by
              the server's uptime. Safe per request because the root layout awaits
              `cookies()`, so no route is prerendered with a build-time clock baked into
              it. Read through `currentNotifications` rather than by calling the clock
              inline: see that function for why the distinction is real. */}
          <NotificationsProvider initial={currentNotifications()}>{children}</NotificationsProvider>
        </QueryProvider>
      </FlavourProvider>
    </ThemeProvider>
  );
}
