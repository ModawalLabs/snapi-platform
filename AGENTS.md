<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Snapi — agent notes

Snapi is an AI shopping assistant: snap a photo or describe what you want, and
it finds the item across every store, compares prices, and advises on timing.
This repo is the Next.js web platform.

**Current state: UI shell only.** Design system, app chrome (collapsible
sidebar), theming, and quality gates exist. No backend, no auth, no real data —
sidebar content comes from `src/lib/mock-data.ts`. Only `/` has a page; the other
routes in `src/config/routes.ts` are linked but 404. Product features get built
in `src/features/`.

## Before you finish

```bash
npm run verify   # typecheck + lint + format:check + test
```

This is exactly what CI runs. Don't hand back work that fails it.

## Non-obvious things that will bite you

**`noPropertyAccessFromIndexSignature` is off on purpose.** Next only inlines
`process.env.NEXT_PUBLIC_X` written as dot-access. Turning the flag on forces
bracket access and silently breaks client-side env replacement. The reason is
commented in `tsconfig.json` — don't "fix" it.

**Root layout is typed `{ children: React.ReactNode }`, not Next's generated
`LayoutProps<"/">`.** That global only exists after `.next/types` is generated,
so using it makes `tsc --noEmit` fail on a clean checkout in CI.

**It's `src/proxy.ts`, not `src/middleware.ts`.** Next 16 renamed the convention;
the old filename still builds but warns.

**`vitest.config.mts`, not `.ts`.** Vite's native config loader treats `.ts` as
CommonJS and warns about ESM syntax.

**Don't call `setState` inside an effect.** React's `set-state-in-effect` rule is
an error here, not a warning. Two established workarounds in this codebase:

- Need "has hydration finished?" → `useIsHydrated()` from
  `src/hooks/use-is-hydrated.ts`.
- Need to reset state when a prop changes → adjust state during render, as
  `AppSidebar` does for the mobile drawer on route change.

**Never import a shared constant from a `"use client"` module into a Server
Component.** The bundler replaces the import with a client-reference proxy, not
the value — so `cookies().get(THAT)` silently returns undefined and you get the
default with no error anywhere. This exact bug already happened once with the
sidebar cookie. Shared constants live in `src/config/` (no directive).

**Tailwind v4 has no `tailwind.config.js`.** Tokens are `@theme inline` in
`src/app/globals.css`. Dark mode is the `@custom-variant dark` declared there.

**`gold` vs `gold-solid` are different tokens, not shades.** `gold` is
content-safe (text, icons) and is a dark bronze in light mode; `gold-solid` is a
bright fill (badges, logo mark). Swapping them produces either illegible text or
a muddy badge. Same for `azure`: interactive states only — links, focus,
selection. Never decorative.

**One `.ambient-canvas` per page, on a bounded hero — never on `<main>`.** Its
light sources are percentage-positioned, so on a long scrolling page they land in
the middle of the document instead of behind the headline. It paints on a
pseudo-element at `z-index: -1`, so the ancestor needs `isolation: isolate` (the
utility sets it) and it is masked to fade out before its own bottom edge.
Stacking two washes doubles the glow and looks cheap.

**Cards that will hold images use `<MediaFrame>`; never style it with border or
theme text tokens.** `.media-placeholder` is deliberately hard-coded dark in both
themes because a photograph does not change colour with the theme — a
token-based version produced a grey ramp in light mode. Content overlaid on a
MediaFrame is always white/white-alpha, and the frame draws its own inset
hairline edge. See the README's "Image-ready cards".

**Marquee clones must be `inert`, not just `aria-hidden`.** The seamless loop
needs exactly two copies of the content and `translateX(-50%)`; `aria-hidden`
alone leaves every cloned link in the tab order.

## House rules

| Rule                                                                | Where                     |
| ------------------------------------------------------------------- | ------------------------- |
| Server Components by default; `"use client"` on leaves only          | —                         |
| Semantic color tokens only — never `bg-white`, `text-gray-*`          | `src/app/globals.css`     |
| Mock data stays in one file, easy to grep and delete                 | `src/lib/mock-data.ts`    |
| Sidebar nav is config-driven, not hardcoded JSX                      | `src/config/nav.ts`       |
| Money is integer minor units + currency, never a float               | `src/types/domain.ts`     |
| Outbound HTTP goes through the client (timeout + retries)             | `src/lib/http.ts`         |
| Validate every boundary with Zod                                     | `src/lib/api-response.ts` |
| `logger`, never `console.log`                                        | `src/lib/logger.ts`       |
| Internal links come from the route registry                          | `src/config/routes.ts`    |
| Throw `AppError` with a stable `code`, not a bare `Error`             | `src/lib/errors.ts`       |
| Cross-feature imports only via a slice's `index.ts`                   | `src/features/README.md`  |
| Icon-only controls need `aria-label`; decorative SVGs `aria-hidden`   | —                         |

## Where things go

- New product surface → `src/features/<slice>/`, per `src/features/README.md`.
- New route in the app shell → `src/app/(app)/<segment>/page.tsx`, and add the
  URL to `src/config/routes.ts` first.
- New sidebar entry → `src/config/nav.ts` (do not hardcode it in the component).
- Reusable primitive used by 2+ features → `src/components/ui/`.
- Copy, nav labels, product strings → `src/config/site.ts`.
- Domain nouns shared app-wide → `src/types/domain.ts`. Feature-local types stay
  in the feature.
- Tests sit next to their subject: `foo.ts` → `foo.test.ts`.

## Deliberately absent

Auth, database/ORM, E2E tests, error-tracking SDK, rate limiting, i18n routing,
and pages for every route except `/`. Don't assume any of these exist. Logout is
inert. Git is not initialized.
