"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { isAppError } from "@/lib/errors";

/**
 * React Query setup for client-side data (infinite feeds, cart mutations,
 * streaming AI results). Server Components remain the default for initial
 * loads; this is for interaction-driven fetching.
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, a non-zero staleTime prevents an immediate refetch of data
        // the server just delivered.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Never retry a client error — the request will fail identically.
          if (isAppError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        // Mutations are not assumed idempotent; a blind retry could double-charge.
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // On the server: a fresh client per request, so no cache is ever shared
  // between two users. This is a correctness requirement, not an optimization.
  if (isServer) return makeQueryClient();

  // In the browser: one client for the tab's lifetime, created lazily so
  // Suspense-triggered re-renders don't blow away the cache.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
