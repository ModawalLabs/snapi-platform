# Snapi

**Snap it. Find it. Buy it.** — an AI shopping assistant. Point a camera at
anything or describe what you want, and Snapi finds it across every store,
compares prices, and tells you when to buy.

This repository is the web platform. Currently **UI shell only**: the design
system, app chrome (collapsible sidebar), theming, and quality gates are in
place. There is no backend, no auth, and no real data — sidebar content comes
from `src/lib/mock-data.ts`.

---

## Stack

| Concern      | Choice                             | Why                                                                |
| ------------ | ---------------------------------- | ------------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router, Turbopack) | Server Components keep the client bundle small as the app grows     |
| Language     | TypeScript (strict)                | Every strictness flag enabled that doesn't fight the framework      |
| Styling      | Tailwind CSS v4                    | CSS-first config; tokens live in `globals.css`, not a JS object     |
| Variants     | CVA + `tailwind-merge`             | Type-safe component variants with predictable class overrides       |
| Client state | Zustand                            | Minimal; most state stays on the server                             |
| Server state | TanStack Query                     | Only for interaction-driven fetching, not initial loads             |
| Validation   | Zod                                | One schema library for env, request bodies, and upstream responses   |
| Icons        | lucide-react                       | Tree-shaken via `optimizePackageImports`                             |
| Theming      | next-themes                        | Class-based dark mode, no flash on first paint                       |
| Testing      | Vitest + Testing Library           | Same transform pipeline as the app; fast watch mode                  |

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in what you need
npm run dev                  # http://localhost:3000
```

## Scripts

| Script                  | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Dev server with Turbopack                           |
| `npm run build`         | Production build (`output: "standalone"`)            |
| `npm start`             | Serve the production build                          |
| `npm run typecheck`     | `tsc --noEmit`                                      |
| `npm run lint`          | ESLint                                              |
| `npm run format`        | Prettier write                                      |
| `npm test`              | Vitest, single run                                  |
| `npm run test:watch`    | Vitest watch mode                                   |
| `npm run test:coverage` | Vitest with V8 coverage                             |
| **`npm run verify`**    | **Everything CI runs. Run this before you push.**   |

## Layout

```
src/
├── app/
│   ├── layout.tsx          # Document only: fonts, metadata, providers, skip link
│   ├── error.tsx           # Shell-level error boundary
│   ├── global-error.tsx    # Root-layout failure boundary (inline-styled)
│   ├── not-found.tsx       # 404
│   ├── manifest.ts         # PWA manifest (camera-first ⇒ installability matters)
│   ├── robots.ts           # Blocks indexing outside production
│   ├── sitemap.ts          # Static routes; paginate once the catalog exists
│   ├── api/health/route.ts # Liveness probe
│   │
│   └── (app)/              # Authenticated app shell — sidebar + main region
│       ├── layout.tsx      # Reads sidebar cookie server-side, mounts sidebar
│       ├── page.tsx        # Home — composes the sections in features/home
│       ├── error.tsx       # Fails inside main; sidebar survives
│       └── loading.tsx     # Skeleton for main only; nav stays interactive
│
├── components/
│   ├── ui/                 # Primitives: Button, Input, Card, Badge, Avatar,
│   │                       #   MediaFrame, Marquee, Section/SectionHeader, …
│   ├── layout/             # Sidebar, logo, theme toggle, error state
│   └── providers/          # Theme + Query composition
│
├── features/               # Vertical product slices — see features/README.md
│   └── home/               # Hero banner, The Edit, Designer Worlds,
│                           #   More For You, product marquee
├── config/                 # site, routes, nav, cookies
├── lib/                    # env, logger, errors, http, api-response, utils,
│                           #   mock-data (DELETE when real data lands)
├── hooks/                  # Shared client hooks
├── types/                  # Domain vocabulary (Product, Money, CartLine, …)
└── proxy.ts                # Request id + nonce CSP (Next 16's middleware)
```

## Design system

Tokens live in `src/app/globals.css` — there is no `tailwind.config.js` in
Tailwind v4.

**Palette: near-black ink, gold, azure.** Gold is the only expressive colour;
azure is reserved for interactive states (links, focus rings, selection). If a
view has two gold-filled elements competing for attention, one of them is wrong.

| Token group                      | Use                                                    |
| -------------------------------- | ------------------------------------------------------ |
| `canvas` / `surface` / `-raised` / `-sunken` | Page, cards, hover fills, wells            |
| `content` / `-muted` / `-subtle` | Text hierarchy                                          |
| `ink` / `ink-content`            | Primary action (near-black light, near-white dark)      |
| `gold`                           | Gold as **content** — text, icons. AA-safe per theme.    |
| `gold-solid` / `gold-content`    | Gold as a **fill** — badges, the logo mark               |
| `gold-subtle` / `gold-border`    | Tinted backgrounds and hairlines                        |
| `azure` + variants               | Links, focus, selection. Nothing decorative.            |
| `price-down` / `price-up`        | Commerce semantics, not raw green/red                   |

Two rules that are easy to get wrong:

1. **`gold` and `gold-solid` are not interchangeable.** A gold readable as text
   on white is a dark bronze; a gold that works as a filled badge is bright.
   Each is retuned per theme. Use `gold` for anything you read, `gold-solid` for
   anything you fill.
2. **Surfaces stay near-zero chroma.** Product photography sits on them, and a
   tinted background shifts how a garment's colour reads — which drives returns.
   Warmth lives in `canvas`; cards stay neutral.

Utilities worth knowing: `.ambient-canvas` (the gold/azure ambient wash — one
per page, on a **bounded** hero, never on a long scrolling container),
`.text-foil` (gold sheen, **display sizes only**), `.text-eyebrow` (tracked
label above a heading), `.media-placeholder` / `.media-scrim` (see below),
`.display-xl` / `.display-lg` (optical tracking for large type), `.rule-fade`
(hairline that fades at both ends), `.tabular` (stops numbers jittering),
`.container-page`, and `shadow-premium{,-sm,-lg}` (warm-near / cool-far two-hue
elevation).

## Image-ready cards

Every card that will eventually hold photography goes through `<MediaFrame>`.
It exists so that dropping real images in is a one-line change:

- **The box holds its aspect ratio while empty** — no layout shift, no CLS hit
  when images arrive.
- **The scrim already exists.** Titles sit on `.media-scrim`, so they stay
  legible over an arbitrary photograph from day one. Adding a scrim later means
  re-tuning every card's type colour at once.
- **The empty state is theme-independent.** `.media-placeholder` uses hard-coded
  dark tones, not surface tokens. A photograph does not change colour when the
  user switches to light mode, so its placeholder must not either — an earlier
  token-based version produced a pale card in light mode that the dark scrim
  turned into a grey ramp, and it read as a rendering bug. As a result these
  tiles look identical in both themes, exactly as they will with real imagery.
- **The frame edge is an inset hairline**, not a `border-border` on the caller.
  These tiles are dark in both themes; a light border token would ring them with
  a pale halo on the light canvas.

The corollary: **do not put `border-border` on a MediaFrame**, and do not use
theme text colours inside one. Content over media is always white/white-alpha.

## App chrome

The sidebar collapses to a 68px icon rail (`[` toggles it) and becomes an
overlay drawer below `md`. Three details that took deliberate work:

- **Collapse state is a cookie read server-side**, not `localStorage`. With
  client-only storage the server always renders the expanded rail and the client
  snaps it shut after hydration — a visible width jump on every reload for
  anyone who prefers the rail.
- **Desktop collapse and the mobile drawer are separate state.** Conflating them
  means resizing the window silently discards the user's choice.
- **The rail keeps every accessible name.** Labels become `aria-label` rather
  than disappearing, and counts fold into that name ("Missions, 3 active").
  Icon-only links with no name are the most common a11y defect in collapsible
  sidebars.

## Conventions

These exist because each one prevents a specific failure mode.

**Server Components by default.** Add `"use client"` only for state, effects, or
browser APIs — and put it on the smallest possible leaf so its parents stay on
the server.

**Money is an integer plus a currency.** See `Money` in `src/types/domain.ts`.
Never a float (`0.1 + 0.2 !== 0.3`), never a bare number.

**Validate at every boundary.** Request bodies, search params, upstream
responses, and environment variables all pass through a Zod schema before
becoming typed values. Helpers live in `src/lib/api-response.ts` and
`src/lib/http.ts`.

**All outbound HTTP goes through `src/lib/http.ts`.** It enforces a timeout,
bounded retries with full jitter, and response-schema validation. A raw `fetch`
with no timeout is the most common cause of a cascading outage.

**Never `console.log`.** Use `logger` from `src/lib/logger.ts` — it emits
structured JSON with a level and a request id. Never log PII, tokens, or card
data; log IDs and join against the datastore.

**Semantic tokens only.** Write `bg-surface text-content-muted`, never
`bg-white text-gray-500`. Raw values break dark mode and turn a rebrand into a
find-and-replace across hundreds of files. See **Design system** above.

**No `setState` inside an effect.** React's `set-state-in-effect` rule is an
error here. For "has hydration finished?" use `useIsHydrated()`; to reset state
when a prop changes, adjust state during render (as `AppSidebar` does for the
mobile drawer on route change).

**Shared constants go in a module without `"use client"`.** A constant imported
from a client module into a Server Component does not arrive as its value — the
bundler substitutes a client-reference proxy. See `src/config/cookies.ts`.

**Internal links come from `src/config/routes.ts`.** When a URL shape changes,
the compiler finds every call site; string literals don't.

**Cross-feature imports go through a slice's `index.ts`.** See
`src/features/README.md`.

## Accessibility

Non-negotiable, and far cheaper to maintain than to retrofit:

- Skip-to-content link is the first tab stop on every page.
- Every icon-only control has an `aria-label`; decorative SVGs are `aria-hidden`.
- Visible azure `:focus-visible` ring on every interactive element.
- `prefers-reduced-motion` disables animation globally.
- Zoom is not locked (`maximumScale: 5`).
- Loading regions pair a visual skeleton with an `aria-live` announcement.
- The active nav row is marked with `aria-current="page"`, not colour alone.
- Collapsed-rail tooltips are `aria-hidden` decoration — the real name is on the
  control, so nothing is announced twice.
- The mobile drawer closes on Escape and locks background scroll.

## Security

- Static headers (HSTS, `nosniff`, `X-Frame-Options`, Referrer-Policy,
  Permissions-Policy) in `next.config.ts`.
- Per-request nonce CSP in `src/proxy.ts`, currently **report-only**. Flip the
  header name to `content-security-policy` once violation reports are clean.
- `remotePatterns` in `next.config.ts` is an explicit host allowlist. Add hosts
  deliberately; never wildcard.
- `robots.ts` blocks indexing on any non-production environment.
- Server env is unreachable from the client: `serverEnv()` throws in the browser.

## Not yet wired up

Deliberate omissions, so you know what to reach for next:

- **Routes behind every link.** Only `/` exists. Everything in
  `src/config/routes.ts` — `/missions`, `/list`, `/chat`, `/profile`, `/edit/*`,
  `/brands/*`, `/collections/*`, `/p/*`, `/c/*` — is linked from the UI but has
  no page yet, so it 404s.
- **All imagery.** Every `image` field in `mock-data.ts` is `null`;
  `<MediaFrame>` renders its studio-backdrop placeholder. Brand logos likewise
  fall back to authored monograms — source real files from official brand asset
  kits or the merchant feed, not by scraping.
- **The composer.** The hero is text-only for now; camera / mic / search input is
  the next piece.
- **Logout** is inert (`handleLogout` in `app-sidebar.tsx`).
- **Auth** — no provider chosen. `routes.signIn()` is a placeholder.
- **Database** — `DATABASE_URL` is validated but unused. No ORM yet.
- **E2E tests** — Playwright is the natural fit; not installed to keep install
  light.
- **Error tracking** — `error.tsx` and `logger.ts` have marked hook points for
  Sentry or equivalent.
- **Rate limiting** — belongs in `proxy.ts` once there is a real API surface.
- **i18n** — `Intl` is used throughout, but there is no locale routing.
- **Git** — the repo is not initialized. Run `git init` when you're ready.
