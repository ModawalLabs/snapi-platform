"use client";

import Image from "next/image";
import Link from "next/link";

import allRounderDark from "@/assets/logos/all-rounder-dark.png";
import allRounderLight from "@/assets/logos/all-rounder-light.png";
import logoDark from "@/assets/logos/logo-dark.png";
import logoLight from "@/assets/logos/logo-light.png";
import { useFlavour } from "@/components/providers/flavour-provider";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The mark — one artwork per theme, per flavour.
 *
 * ## Two axes, split between JS and CSS
 *
 * Four combinations, but they are not resolved the same way, because the two axes
 * behave differently:
 *
 *  - **Flavour** is known on the server (the root layout reads the cookie and
 *    seeds the provider), so the pair is *picked* in JS and only two images ever
 *    reach the DOM. It also has to change the instant the profile dialog switches
 *    it, which context gives for free.
 *  - **Theme** is not known during SSR — next-themes resolves it on the client —
 *    so both members of the pair render and the `dark:` variant hides one. Picking
 *    that in JS would mean the server guessing, and the correction landing after
 *    hydration as a visible flash of the wrong mark in the corner of every page.
 *
 * Reversing either choice makes it worse: resolving flavour in CSS would ship
 * four images to render one, and resolving theme in JS would flash.
 *
 * `aria-hidden` on both: the link already carries the accessible name, and
 * without it a screen reader announces the logo twice — once per copy.
 *
 * No gold tile behind it. The old inline glyph was a monochrome shape that needed
 * a ground; this artwork *is* the accent, and a plate would flatten it.
 */
const MARKS = {
  signature: { light: logoLight, dark: logoDark },
  "all-rounder": { light: allRounderLight, dark: allRounderDark },
} as const;

function LogoMark({ className }: { className?: string }) {
  const { flavour } = useFlavour();
  const mark = MARKS[flavour];
  const shared = "h-8 w-auto object-contain transition-transform duration-200";

  // `sizes` is deliberately ~3x the 22px the mark actually occupies. It is a
  // hint about layout width, and the browser multiplies it by the device pixel
  // ratio before choosing a candidate — declaring the honest 24px makes a retina
  // screen pick a 32px file for a 44px slot and the mark renders soft. The cost
  // of over-declaring here is a couple of KB.

  return (
    <span className={cn("relative block shrink-0", className)}>
      <Image
        src={mark.light}
        alt=""
        aria-hidden="true"
        priority
        sizes="64px"
        className={cn(shared, "dark:hidden")}
      />
      <Image
        src={mark.dark}
        alt=""
        aria-hidden="true"
        priority
        sizes="64px"
        className={cn(shared, "hidden dark:block")}
      />
    </span>
  );
}

/**
 * Full lockup: mark + wordmark, linking home.
 *
 * `compact` drops the wordmark for the collapsed rail. The link keeps its
 * `aria-label` in both states so the accessible name never disappears.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href={routes.home()}
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className,
      )}
    >
      <LogoMark className="transition-transform duration-200 group-hover:scale-105" />
      {compact ? null : (
        <span className="text-[17px] font-semibold tracking-[-0.02em]">{siteConfig.name}</span>
      )}
    </Link>
  );
}
