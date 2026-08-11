"use client";

import * as React from "react";

import { ErrorState } from "@/components/layout/error-state";

/**
 * Shell-level error boundary — catches failures *outside* the `(app)` group
 * (and inside it, if `(app)/error.tsx` itself fails).
 *
 * Next strips the message in production and gives us `digest` instead. The same
 * id appears in server logs, so support can join on it.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Replace with the telemetry client (Sentry, etc.) when it lands.
    console.error("Shell error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center py-20">
      <ErrorState digest={error.digest} reset={reset} />
    </div>
  );
}
