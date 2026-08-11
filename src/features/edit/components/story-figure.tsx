import Link from "next/link";
import type * as React from "react";

import { MediaFrame } from "@/components/ui/media-frame";
import { routes } from "@/config/routes";
import type { MockEditStory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * One story as an image plus caption — the page's repeating unit.
 *
 * Everything that varies between placements is a prop, so the layout above can
 * change scale and emphasis without a second component drifting out of sync. Only
 * three scales exist on purpose: a magazine spread with five type sizes stops
 * reading as a hierarchy and starts reading as an accident.
 *
 * Captions sit below the image in theme tokens, never over it. That is the
 * decision the whole editorial system already made — nothing on the photograph
 * means no scrim, and the photography runs at full contrast.
 */
export function StoryFigure({
  story,
  scale = "md",
  ratio = "aspect-[3/4]",
  align = "left",
  showStandfirst = true,
  priority = false,
  linked = true,
  mediaOverlay,
  sizes,
  className,
}: {
  story: MockEditStory;
  scale?: "sm" | "md" | "lg";
  /** Aspect class for the frame. Varied per slot, not per story. */
  ratio?: string;
  align?: "left" | "center";
  showStandfirst?: boolean;
  priority?: boolean;
  /**
   * Whether the figure opens the story. `false` renders the identical block with
   * no anchor at all — not a disabled one. An anchor that is styled dead but
   * still focusable and still followable lies to keyboard users, and the hover
   * and zoom affordances would keep promising a destination that is not there.
   */
  linked?: boolean;
  /**
   * Rendered inside the frame, on top of the photograph. Positions itself — the
   * frame is the containing block, so an overlay uses `absolute` plus its own
   * corner offsets rather than being told where to go from here.
   */
  mediaOverlay?: React.ReactNode;
  sizes?: string;
  className?: string;
}) {
  const title = {
    sm: "text-base sm:text-lg",
    md: "text-xl sm:text-2xl",
    lg: "font-display text-[clamp(1.75rem,3vw,2.75rem)] font-normal leading-[1.08]",
  }[scale];

  const Frame = linked ? Link : "div";
  const frameProps = linked
    ? {
        href: routes.editStory(story.slug),
        className:
          "flex h-full flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
      }
    : { className: "flex h-full flex-col" };

  return (
    // `group` only when there is something to hover toward.
    <article className={cn(linked && "group", className)}>
      <Frame {...(frameProps as { href: string; className: string })}>
        <MediaFrame
          src={story.image}
          alt=""
          focus={story.focus}
          scrim={false}
          priority={priority}
          zoomOnHover={linked}
          sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
          className={cn("rounded-lg shadow-premium-sm", ratio)}
        >
          {mediaOverlay}
        </MediaFrame>

        <div className={cn("mt-4", align === "center" && "text-center")}>
          <Meta story={story} align={align} />

          <h3
            className={cn(
              "mt-2.5 text-balance text-content",
              linked && "transition-colors duration-300 group-hover:text-gold",
              scale === "lg" ? title : cn(title, "leading-snug font-semibold"),
            )}
          >
            {story.title}
          </h3>

          {showStandfirst ? (
            <p
              className={cn(
                "mt-2.5 leading-relaxed text-content-muted",
                scale === "sm" ? "text-[13px]" : "text-sm",
                // A measure, not a width. Past ~70 characters the eye loses the
                // start of the next line; centred text needs the bound *and* the
                // auto margins or it drifts off the card's axis.
                "max-w-[46ch]",
                align === "center" && "mx-auto",
              )}
            >
              {story.standfirst}
            </p>
          ) : null}
        </div>
      </Frame>
    </article>
  );
}

/**
 * The category line.
 *
 * Category alone — no date, no read time. Both were dropped deliberately: a
 * publication date turns evergreen writing into something with a shelf life, and a
 * minute count invites the reader to price the piece before reading a word of it.
 *
 * With the timestamp gone the rule that separated the two halves has nothing left
 * to separate, so it went with them rather than becoming a dangling flourish.
 */
export function Meta({
  story,
  align = "left",
  className,
}: {
  story: MockEditStory;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <p className={cn("text-eyebrow text-gold", align === "center" && "text-center", className)}>
      {story.category}
    </p>
  );
}
