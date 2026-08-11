"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Avatar with an initials fallback.
 *
 * A remote avatar URL *will* eventually 404 (deleted CDN object, expired signed
 * URL), so `onError` swaps to initials rather than leaving a broken-image glyph.
 *
 * The fallback is deliberately palette-bound (gold on a tinted surface) rather
 * than a hue hashed from the name. Hue-hashing is the usual trick and it is the
 * right call in multi-user surfaces — shared lists, reviewers — where telling
 * people apart at a glance matters. Here the avatar appears once, as the signed-in
 * user, inside a near-black-and-gold system: an arbitrary hue lands as the only
 * off-palette colour on screen and cheapens the whole panel. When collaborative
 * surfaces arrive, reintroduce hashing *there* rather than changing this default.
 */

const SIZES = {
  sm: "size-7 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
  /** The profile dialog only. Large enough to anchor a header band. */
  xl: "size-14 text-lg",
} as const;

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full",
        "ring-1 ring-border/80",
        SIZES[size],
        !showImage && "bg-gold-subtle font-semibold text-gold ring-gold-border",
        className,
      )}
      // The name is rendered by the surrounding control; announcing it twice is noise.
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={src as string}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
