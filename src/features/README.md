# Feature slices

Product code lives here, organized **by feature, not by file type**. The reason
is churn: a change to how search works should touch one directory, not five.

## Shape of a slice

```
src/features/<feature>/
  components/     # UI owned by this feature
  hooks/          # client-side state and effects
  api/            # server-side data access (queries, mutations, upstream calls)
  schemas.ts      # zod schemas — the validation boundary for this feature
  types.ts        # feature-local types (domain-wide types go in src/types)
  index.ts        # public surface: the ONLY thing other features may import
```

## Rules

1. **Import across features only through `index.ts`.** Reaching into
   `features/cart/hooks/use-cart-internals` from the search feature is how a
   codebase becomes one big ball of mud. If two features need the same thing,
   it graduates to `src/components`, `src/lib`, or `src/hooks`.
2. **Validate at the edge.** Anything from a request, a form, or an upstream API
   is parsed with a zod schema in `schemas.ts` before it becomes a typed value.
3. **Server Components by default.** Add `"use client"` only when you need
   state, effects, or browser APIs — and push it as far down the tree as
   possible so the interactive leaf doesn't drag its parents to the client.
4. **Colocate tests.** `foo.ts` is tested by `foo.test.ts` next to it.

## Planned slices for Snapi

| Slice      | Owns                                                      |
| ---------- | --------------------------------------------------------- |
| `snap`     | Camera capture, image upload, visual-match results        |
| `search`   | Text/voice intent parsing, result ranking, filter state   |
| `catalog`  | Product detail, variants, merchant comparison             |
| `cart`     | Line items, quantity, optimistic updates, persistence     |
| `checkout` | Address, payment, order confirmation                      |
| `assistant`| Conversational shopping agent, streaming responses, tools |
| `deals`    | Price tracking, watchlists, drop notifications            |
