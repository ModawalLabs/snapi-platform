import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder.
 *
 * Use these inside `loading.tsx` and Suspense fallbacks so the layout is
 * reserved before data lands — a page that assembles itself without shifting
 * feels roughly twice as fast as one that pops in.
 *
 * Always mirror the real element's box (height, radius, width) rather than
 * dropping in a generic grey rectangle.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-shimmer rounded-md bg-surface-raised", className)}
      {...props}
    />
  );
}

/** Screen-reader announcement to pair with a visual skeleton region. */
export function LoadingAnnouncement({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}
