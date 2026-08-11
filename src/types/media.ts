import type { StaticImageData } from "next/image";

/**
 * Anything `<Image src>` accepts.
 *
 * `StaticImageData` is what a static import (`import cover from "@/assets/…"`)
 * evaluates to — it carries the intrinsic width, height, and a generated
 * `blurDataURL`. A plain `string` is a remote URL, which carries none of that and
 * whose host must be allowlisted in `next.config.ts`.
 *
 * Prefer static imports. See `src/assets/README.md` for why.
 */
export type ImageSource = string | StaticImageData;
