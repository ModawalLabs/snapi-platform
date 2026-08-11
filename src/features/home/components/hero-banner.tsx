import { HeroStage } from "@/features/home/components/hero-stage";
import { RibbonDivider } from "@/features/home/components/ribbon-divider";
import { FLAVOUR_COPY } from "@/config/flavour";
import { getFlavour } from "@/lib/flavour-server";
import { mockHeroPrompts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Full-bleed top banner.
 *
 * Owns the page's ambient gold/azure wash (`.ambient-canvas`) rather than the
 * app shell's `<main>`. On a long scrolling page a wash anchored to `<main>` is
 * wrong twice over: its percentage-positioned light sources land somewhere in
 * the middle of a 5000px document, and the glow bleeds behind sections that
 * should sit on clean canvas. Bounding it to the banner keeps the atmosphere
 * where the eye lands first.
 *
 * Two treatments, switched by whether any hero prompt has supplied a photograph:
 *
 * - **No image (today):** typographic, on the ambient wash, theme-adaptive type.
 * - **With images:** photographic banner, scrim, and fixed light type in *both*
 *   themes. A photograph does not change colour when the viewer switches to light
 *   mode, so type over it cannot either — `text-content` would render a near-black
 *   headline onto a dark photo the moment light mode was selected.
 *
 * Deriving that from the data rather than hardcoding it means dropping images into
 * `mockHeroPrompts` flips the whole banner over with no other edit, and there is
 * no broken half-state in between.
 *
 * Typography is the luxury-editorial pairing: display serif headline over sans
 * supporting copy. The serif carries the brand; the sans stays legible at body
 * size, which long-form serif on screen does not.
 */
export async function HeroBanner() {
  const flavour = await getFlavour();
  const copy = FLAVOUR_COPY[flavour];

  // Prompt and photograph travel together — see `mockHeroPrompts`.
  const prompts = mockHeroPrompts[flavour];
  const hasBackdrop = prompts.some((prompt) => prompt.image !== null);

  return (
    <section
      aria-labelledby="hero-heading"
      // The ambient wash is skipped once photography is present — the backdrop
      // covers it completely, so painting it would be dead work.
      // `overflow-hidden` clips the ribbon's lower half at this edge, so the
      // strips read as passing beneath the banner rather than hanging past it.
      className={cn("relative", !hasBackdrop && "ambient-canvas")}
    >
      {/* The ribbon is the banner's closing edge, not a separate divider — the
          section ends exactly where the strips end, and they lie over the
          photograph rather than on the canvas below. */}
      <HeroStage prompts={prompts} hasBackdrop={hasBackdrop} footer={<RibbonDivider />}>
        <p
          className={cn(
            "animate-rise text-[11px] font-semibold tracking-[0.18em] uppercase sm:text-xs",
            hasBackdrop ? "text-gold-solid" : "text-gold",
          )}
        >
          {copy.heroEyebrow}
        </p>

        {/* `font-normal`, not semibold: Oranienbaum ships a single 400 weight, so
            any heavier value makes the browser synthesise a fake bold — smeared
            stems and broken serifs at display size.
            Tracking is near-zero rather than the negative value used for Geist
            display type; a serif this narrow tightens into itself. */}
        <h1
          id="hero-heading"
          className={cn(
            "mt-6 max-w-4xl animate-rise font-display text-[clamp(2.75rem,7.5vw,5.75rem)] leading-[1.03] font-normal tracking-[-0.008em]",
            hasBackdrop ? "text-white" : "text-content",
          )}
          style={{ animationDelay: "70ms" }}
        >
          {/* One foiled phrase — the claim. Any more of the accent and it stops
              meaning anything. The headline is split in the copy rather than
              broken here, so each edition decides where its own line falls:
              "Found," / "not searched." and "One Platform." / "Infinite Choices"
              break at different words. */}
          <span className="text-foil">{copy.heroTitleLead}</span>
          <br />
          {copy.heroTitleRest}
        </h1>

        <p
          className={cn(
            "mt-7 max-w-xl animate-rise text-base leading-relaxed sm:text-[1.0625rem]",
            hasBackdrop ? "text-white/75" : "text-content-muted",
          )}
          style={{ animationDelay: "120ms" }}
        >
          {copy.heroSupport}
        </p>
      </HeroStage>
    </section>
  );
}
