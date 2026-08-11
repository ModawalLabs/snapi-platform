import { LoadingAnnouncement, Skeleton } from "@/components/ui/skeleton";

/**
 * Route-transition skeleton for the main region.
 *
 * Inside `(app)`, so the sidebar stays mounted and interactive during a
 * navigation — only the content area swaps. A root-level `loading.tsx` would
 * blank the nav on every route change, which reads as a full page reload.
 *
 * Mirrors the home page's actual boxes (hero type, four banner cards, the
 * editorial bento) so nothing jumps when content arrives. Only the first screen
 * is skeletoned — below-the-fold placeholders are wasted markup nobody sees.
 */
export default function AppLoading() {
  return (
    <div>
      <LoadingAnnouncement label="Loading" />

      {/* Hero — mirrors HeroBanner's 65vh and its eyebrow / two-line serif
          headline / supporting copy, so nothing shifts on arrival. */}
      <div className="container-page flex min-h-[65vh] flex-col justify-center pt-14 pb-20 sm:pt-16 lg:pb-28 xl:pb-36">
        <Skeleton className="h-3.5 w-52 rounded-full" />
        <Skeleton className="mt-6 h-12 w-[min(100%,18rem)] sm:h-[4.5rem]" />
        <Skeleton className="mt-2 h-12 w-[min(100%,26rem)] sm:h-[4.5rem]" />
        <Skeleton className="mt-7 h-12 w-[min(100%,34rem)]" />
      </div>

      {/* The band straddles the banner's bottom edge, so only its lower half takes
          layout space below — `13/1` is half of the band's `6.5/1`. */}
      <Skeleton className="aspect-[13/1] max-h-[130px] min-h-[56px] w-full rounded-none" />

      {/* The Edit */}
      <div className="container-page py-14 sm:py-20">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="mt-3 h-8 w-40" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <Skeleton className="aspect-[3/4] rounded-lg lg:row-span-2 lg:aspect-auto lg:min-h-[34rem]" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
