"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

/**
 * Shared body for both error boundaries.
 *
 * Extracted so `app/error.tsx` (shell-level failure) and `app/(app)/error.tsx`
 * (failure inside the main region, sidebar intact) present identical copy and
 * recovery actions. Two hand-maintained copies drift.
 */
export function ErrorState({
  digest,
  reset,
  title = "This page didn't load",
}: {
  digest?: string;
  reset: () => void;
  title?: string;
}) {
  return (
    <div className="mx-auto max-w-md px-6 text-center">
      <p className="text-sm font-semibold text-danger">Something broke</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-content-muted">
        The error has been logged. Try again — if it keeps happening, the reference below will help
        us track it down.
      </p>

      {digest ? <p className="mt-4 font-mono text-xs text-content-subtle">ref: {digest}</p> : null}

      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
        <Link href={routes.home()} className={buttonVariants({ variant: "secondary" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
