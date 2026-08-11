import { cookies } from "next/headers";
import type * as React from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { ComposerProvider } from "@/components/layout/composer-provider";
import { FloatingComposer } from "@/components/layout/floating-composer";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { COOKIES } from "@/config/cookies";

/**
 * Authenticated app shell: sidebar + main region.
 *
 * A route group `(app)` rather than a path segment, so these routes keep clean
 * URLs (`/missions`, not `/app/missions`) while marketing pages can later live
 * under their own group with a completely different chrome.
 *
 * Async because the sidebar's collapsed state is read from a cookie here. Doing
 * it server-side is what makes the first painted HTML already the correct width
 * — with client-only storage the rail would flash open on every reload for
 * anyone who prefers it collapsed.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(COOKIES.sidebarCollapsed)?.value === "true";

  return (
    <SidebarProvider defaultCollapsed={collapsed}>
      <ComposerProvider>
        <div className="flex min-h-dvh">
          <AppSidebar />

          {/* min-w-0 is required: without it a wide child (a product grid, a long
            unbroken string) forces this flex item past the viewport and the
            whole page scrolls sideways.

            No `.ambient-canvas` here on purpose — pages are long enough that a
            wash anchored to <main> puts its percentage-positioned light sources
            somewhere in the middle of the document. Each page applies it to its
            own bounded hero instead. */}
          {/* No bottom padding here. The composer's footprint is applied by a
              rule in `globals.css` keyed off the card being open, because the
              open state is a client concern and this is a Server Component —
              and padding that stayed while the card was away would leave a dead
              200px band at the foot of every page. */}
          <main id="main" className="relative min-w-0 flex-1">
            {children}
          </main>
        </div>

        {/* Outside <main> and last in the DOM: it is a control that floats over
            every page, not part of any one page's content, and a reader tabbing
            through reaches it after the page rather than before it. */}
        <FloatingComposer />
      </ComposerProvider>
    </SidebarProvider>
  );
}
