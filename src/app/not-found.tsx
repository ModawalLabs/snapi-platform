import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-gold">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">We couldn&apos;t find that</h1>
        <p className="mt-3 text-sm leading-relaxed text-content-muted">
          The page may have moved, or the product is no longer listed. Try searching instead.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={routes.home()} className={buttonVariants()}>
            Go home
          </Link>
          <Link href={routes.discover()} className={buttonVariants({ variant: "secondary" })}>
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
