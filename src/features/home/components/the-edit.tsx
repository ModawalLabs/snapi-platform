import Link from "next/link";

import { MediaFrame } from "@/components/ui/media-frame";
import { Section, SectionHeader } from "@/components/ui/section-header";
import { routes } from "@/config/routes";
import { FLAVOUR_COPY } from "@/config/flavour";
import { getFlavour } from "@/lib/flavour-server";
import { mockEditStories, type MockEditStory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * "The Edit" — editorial stories in an asymmetric bento.
 *
 * The first story spans both rows as the feature; the rest fill a 2×2 beside it.
 * The hierarchy is the point: a uniform grid tells the reader every story is
 * equally important, which means none of them are. Print editorial always leads
 * with one image.
 *
 * Captions sit *below* the images rather than over them, so images are 3:2 and
 * carry no scrim. Note that this makes the section taller overall even though
 * every image is shorter — the caption height is additive where before it was
 * free, overlaid on the photograph.
 *
 * The feature's image is flex-sized rather than given a ratio: it has to absorb
 * whatever the two-row span leaves once its caption is placed, and any fixed
 * ratio would either overshoot the span or leave a gap beneath it.
 */
export async function TheEdit() {
  // Heading from the flavour: "The Edit" in Signature, "Trending Now" in All
  // Rounder. Chosen on the server so the right words are in the first HTML —
  // swapping them after hydration would be a visible flicker of the wrong copy.
  const flavour = await getFlavour();
  const copy = FLAVOUR_COPY[flavour];

  // The bento holds exactly five. `mockEditStories` is the full archive that
  // `/edit` renders, so the slice is what keeps this section fixed as more
  // stories are published rather than growing a sixth row nobody designed.
  const [feature, ...rest] = mockEditStories.slice(0, 5);
  if (!feature) return null;

  return (
    <Section id="the-edit">
      <SectionHeader
        id="the-edit"
        eyebrow={copy.theEditEyebrow}
        title={copy.theEdit}
        description={copy.theEditDescription}
        // Label *and* destination both come from the flavour: All Rounder's
        // "All trends" goes to `/trends`, not to the editorial archive wearing a
        // different name.
        action={{
          label: copy.theEditAction,
          href: flavour === "all-rounder" ? routes.trends() : routes.edit(),
        }}
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <EditCard story={feature} feature className="lg:row-span-2" />
        {rest.map((story, index) => (
          <EditCard key={story.id} story={story} index={index + 2} />
        ))}
      </div>
    </Section>
  );
}

function EditCard({
  story,
  feature = false,
  index,
  className,
}: {
  story: MockEditStory;
  feature?: boolean;
  index?: number;
  className?: string;
}) {
  return (
    <article className={cn("group relative", className)}>
      <Link
        href={routes.editStory(story.slug)}
        className="flex h-full flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {/* `scrim={false}` — nothing sits on the image any more, and the scrim
            existed only to keep overlaid type legible. Dropping it lets the
            photography read at full contrast, which is the point of moving the
            caption out. */}
        <MediaFrame
          src={story.image}
          alt=""
          priority={feature}
          focus={story.focus}
          scrim={false}
          sizes={feature ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 22vw, 100vw"}
          className={cn(
            "rounded-lg shadow-premium-sm",
            // 3:2 everywhere except the feature on lg, where `flex-1` lets the
            // image absorb whatever height the two-row span leaves after its
            // caption. A fixed ratio there would either overshoot the span or
            // leave a gap under it.
            feature ? "aspect-[3/2] lg:aspect-auto lg:min-h-0 lg:flex-1" : "aspect-[3/2]",
          )}
        />

        {/* Caption, below the image. Theme tokens now, not white-alpha — this text
            sits on the canvas rather than on a photograph. `shrink-0` so the
            feature's image, not its caption, gives up space in the span. */}
        <div className="mt-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Editorial numeral. Gold only on the feature — numbering every card
                in gold turns the accent into wallpaper. */}
            <span
              className={cn(
                "tabular text-[11px] font-semibold tracking-[0.14em]",
                feature ? "text-gold" : "text-content-subtle",
              )}
            >
              {String(feature ? 1 : (index ?? 0)).padStart(2, "0")}
            </span>
            <span className="h-px w-4 bg-border-strong" aria-hidden="true" />
            <span className="text-eyebrow text-content-subtle">{story.category}</span>
          </div>

          <h3
            className={cn(
              "mt-2 font-semibold text-balance text-content transition-colors duration-300 group-hover:text-gold",
              feature ? "display-lg text-xl sm:text-2xl" : "text-[15px] leading-snug sm:text-base",
            )}
          >
            {story.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
