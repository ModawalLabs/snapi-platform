# The Edit — cover images

## Current files

| File | Size | Slot | Notes |
| --- | --- | --- | --- |
| `atelier-mannequin.jpg` | 1202×1800 | Story 1 — **feature** | True 2:3, so the feature card crops nothing |
| `bridal-light.jpg` | 1585×1800 | Story 2 | Subject right of centre → `object-[58%_38%]` |
| `sneakers-studio.jpg` | 1100×1800 | Story 3 | Framed low → `object-[50%_74%]`, or the 4:3 crop loses the shoes |
| `street-style-fur-coat.jpg` | 1600×1066 | Story 4 | The only landscape source; native fit for a 4:3 slot |
| `poolside-resort.jpg` | 1200×1800 | Story 5 | `object-[50%_42%]` |

Photos are paired to stories **by crop, not by subject** — content matching was
not required. Assignment is fixed in `mockEditStories`, never randomised: a
render-time `Math.random()` would pick a different image on the server than the
client (hydration mismatch) and a different one per request.

The committed files are downscaled working copies — 41 MB of camera exports became
1.4 MB with no visible difference, since the largest these ever render is ~1170px.

There is no `_originals/` directory any more; the full-resolution masters were
deleted as unused. They were git-ignored, so they are not recoverable from
version control — **re-cropping any of these now means re-sourcing the original**.
If you reinstate the practice, `.gitignore` still excludes `src/assets/**/_originals/`.

---

To add or replace a cover, drop it here and wire it up in `src/lib/mock-data.ts`
(see "Wiring one up" below).

## What to supply

The first story in `mockEditStories` renders as the **tall feature card**; the
other four are **landscape**. They need different crops:

| Slot | Card | Ratio | Recommended | Notes |
| --- | --- | --- | --- | --- |
| Story 1 | Feature (left, full height) | **2:3 portrait** | 1200 × 1800 | Also crops to 3:4 on mobile, so keep the subject away from the left and right edges |
| Stories 2–5 | Standard | **4:3 landscape** | 1400 × 1050 | |

Everything is `object-cover`, so a ratio that is slightly off will crop rather
than distort — but supplying the wrong orientation (a landscape file for the
feature) will crop away most of the subject.

**Composition:** a title sits over the bottom third of every card. Keep faces and
product detail in the **upper two thirds** where you can — and where you can't,
set `focus` (see below) rather than accepting the centre crop.

**Tone:** overlaid type is white, and `.media-scrim` is tuned so that even a
high-key subject (cream sneaker on a yellow sweep) clears 4.5:1. Bright images
are fine. What is *not* fine is weakening the scrim to "let the photo breathe" —
that works until the next pale image.

## Off-centre subjects

`object-cover` crops from the centre, which silently deletes the subject of a
low- or side-framed shot. When that happens, set `focus` on the story — a
Tailwind `object-position` class:

```ts
image: sneakersStudio,
focus: "object-[50%_74%]", // bias downward; the shoes are near the bottom edge
```

`focus` belongs to the **photo**, not the card, so it follows the image if you
move it to a different slot. Three of the five current covers need one.

## Format and size

- **JPEG** for photography (`.jpg`). Next re-encodes to AVIF/WebP per request, so
  don't pre-convert.
- **Resize before committing.** Target the recommended pixel dimensions above,
  quality ~82. Next optimises format, not source resolution — a 6000px export
  makes builds slow and cache entries huge for no visible gain.
- Keep each file **under ~400 KB**.

## Naming

Name for **what the photo shows**, short and kebab-case —
`street-style-fur-coat.jpg`, not `fashionable-woman-posing-city-warm-fur-coat-…-trend.jpg`
and not `IMG_2481.jpg`.

Deliberately *not* named after the story slug: covers are paired by crop and get
reshuffled, so a slug-named file becomes a lie the first time one moves. The name
describes the asset; `mock-data.ts` records the pairing.

## Wiring one up

Two edits in `src/lib/mock-data.ts` — an import at the top, and the `image` field:

```ts
import atelierMannequin from "@/assets/edit/atelier-mannequin.jpg";

export const mockEditStories: MockEditStory[] = [
  {
    id: "e1",
    slug: "handbags-defining-modern-elegance",
    title: "5 Handbags Defining Modern Elegance",
    category: "Accessories",
    readMinutes: 6,
    image: atelierMannequin, // ← was null
  },
  // …
];
```

Nothing else changes. `<MediaFrame>` already reserves the aspect ratio, renders
the scrim, and switches on a blur-up placeholder automatically for static
imports. Cards with `image: null` keep showing the studio placeholder, so you can
add them one at a time without the section looking broken in between.

## Alt text

`MediaFrame` is currently called with `alt=""` from `the-edit.tsx`, which is
correct **only** while these are decorative covers sitting beside a visible
title — a screen reader already gets the story name from the heading, so
describing the photo too is noise.

If a cover ever carries information the title does not (a specific product being
reviewed, a named person), add a `description` field to `MockEditStory` and pass
it through as `alt`. Don't put the title in `alt` — that duplicates the heading.
