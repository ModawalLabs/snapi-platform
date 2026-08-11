"use client";

import * as React from "react";

import { ErrorState } from "@/components/layout/error-state";

/**
 * Error boundary for the app's main region.
 *
 * Exists specifically so a failing page does NOT take the sidebar with it: this
 * boundary is *inside* `(app)/layout.tsx`, so navigation, recents, and the theme
 * control all keep working and the user can route away instead of being stranded
 * on a full-screen error.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Route error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center py-20">
      <ErrorState digest={error.digest} reset={reset} />
    </div>
  );
}
