# Assets

Images that ship with the app live here and are referenced by **static import**:

```ts
import cover from "@/assets/edit/atelier-mannequin.jpg";
```

## Why here and not `public/`

Both work — `<MediaFrame>` accepts either. This directory is the default because
a static import is processed at build time, and that buys four things a
`public/` URL string cannot:

| | `src/assets` (static import) | `public/` (URL string) |
| --- | --- | --- |
| Intrinsic width/height | Inferred automatically | You supply them, or risk layout shift |
| Blur-up placeholder | `blurDataURL` generated for you | Only if you generate one yourself |
| Missing file | **Build error** | Runtime 404, usually found in production |
| Caching | Content-hashed filename, immutable | Plain path, must be revalidated |

The blur placeholder matters more than it sounds on this product: a card that
fades up from a blurred preview reads as considered, where one that pops in from
grey reads as a web page still loading.

Use `public/` only for files that must be fetched by a literal, stable URL —
`favicon.ico`, `og-image.png`, files referenced from a manifest or an email.

## Layout

```
src/assets/
├── brands/    # Maison logos — trademarks, see brands/README.md
├── edit/      # Editorial covers, reused across The Edit, More For You and the promo rail
├── hero/      # Home banner backdrops
├── logos/     # The Snapi mark, one artwork per theme
└── products/  # Product shots for the workspace results grid
```

`products/` currently holds tall crops of the editorial photography — 9:16 and 1:2.
They exist to exercise the results grid's **contain** path: anything outside a 3:5
to 5:3 band letterboxes onto the studio plate instead of being cropped. Without a
fixture in that range the branch is written but never seen.

Add a directory per section as you go.

Note that `edit/` no longer means "only The Edit". The same five photographs also
back More For You and the promo marquee, each at a different crop — which is why
the filenames describe the picture rather than the section that happens to use it.

## Rules

- **Filename = what the photo shows**, short and kebab-case:
  `street-style-fur-coat.jpg`, not `IMG_2481.jpg`. Deliberately *not* named after
  the content entry that uses it — one image now serves three sections, so a
  slug-named file becomes a lie the moment it is reused.
- **Never commit an unoptimised original.** Next re-encodes to AVIF/WebP on
  request, but it does not downscale a 6000px camera export before doing so —
  that lands as a slow build and a large cache entry. Resize before committing.
- **No spaces, no capitals, no `IMG_2481.jpg`.**
- **SVG cannot use `placeholder="blur"`** (no `blurDataURL` is generated).
  `<MediaFrame>` already guards for this, but don't expect the blur-up on SVGs.
