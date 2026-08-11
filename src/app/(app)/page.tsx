import type { Metadata } from "next";

import { DesignerWorlds, HeroBanner, MoreForYou, ProductMarquee, TheEdit } from "@/features/home";

export const metadata: Metadata = {
  title: "Home",
};

/**
 * Home.
 *
 * Composition only — each section owns its own layout and data. Section order is
 * the page's argument: aspiration (banner) → editorial authority (The Edit) →
 * breadth of supply (Designer Worlds) → personalisation (More For You) →
 * merchandising (marquee). Trust first, selling last.
 *
 * Every section here is a Server Component, so the whole page ships zero client
 * JS: the marquee is CSS-only and nothing else needs state. That matters on the
 * one route every session starts from.
 */
export default function HomePage() {
  return (
    <>
      {/* The banner's ribbon straddles its bottom edge, so half the band hangs
          below the section. This reserves exactly that half: the section is
          full-bleed, so `13/1` is precisely half of the band's own `6.5/1`, and the
          clamps are halved to match — no hardcoded height and nothing that has to
          know the sidebar's width. Without it the strips land on The Edit's
          heading. */}
      <HeroBanner />
      <div
        aria-hidden="true"
        className="aspect-[13/1] max-h-[130px] min-h-[56px] w-full shrink-0"
      />
      <TheEdit />
      <DesignerWorlds />
      <MoreForYou />
      <ProductMarquee />
    </>
  );
}
