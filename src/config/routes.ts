/**
 * Route registry.
 *
 * Every internal link goes through a function here instead of a hand-written
 * string literal. When a URL shape changes, the compiler finds every call site
 * for you — hardcoded strings do not offer that.
 *
 * Only routes with a caller live here. A registry of URLs nobody links to is not
 * a roadmap, it is a list of 404s waiting to be pasted into a `href` by someone
 * who assumes the page exists — `checkout`, `search`, `settings`, `sign-in`,
 * `/c/:slug` and three marketing pages were all removed on exactly that ground.
 * Add an entry when the page does. (`cart` was one of the removed ones and came
 * back the day `/cart` was built, which is the rule working rather than an
 * exception to it.)
 *
 * The exceptions are marked below: destinations that are linked *today* but whose
 * pages are not built yet.
 */
export const routes = {
  home: () => "/",

  // Primary app surfaces
  missions: () => "/missions",
  mission: (id: string) => `/missions/${id}`,
  cart: () => "/cart",
  snapiList: () => "/list",
  /** Linked from the sidebar. No page yet. */
  notifications: () => "/notifications",
  profile: () => "/profile",

  // Conversations
  /**
   * The start page — the briefing and the composer, inside the app shell.
   *
   * Its own route rather than `/chat` with no query, because the two want opposite
   * chrome: this one sits beside the sidebar, and the answered view takes the whole
   * window. A layout is fixed per segment, so one URL cannot be both.
   */
  concierge: () => "/concierge",
  /**
   * A search, full screen. `prompt` becomes `?q=` and is required — `/chat` with
   * nothing asked has nothing to show, and redirects to the Concierge.
   */
  newChat: (prompt?: string) => (prompt ? `/chat?q=${encodeURIComponent(prompt)}` : "/chat"),
  chat: (id: string) => `/chat/${id}`,
  /**
   * Full conversation history.
   *
   * `/chats`, not `/chat/history` — the latter would be swallowed by the `[id]`
   * segment above and resolve as a conversation whose id happens to be "history".
   */
  chats: () => "/chats",

  // Commerce
  /** Linked from every product card and Buy now. No page yet — the biggest gap. */
  product: (slug: string) => `/p/${slug}`,
  /** Linked from More For You. No page yet. */
  collection: (slug: string) => `/collections/${slug}`,

  // Editorial & brands
  edit: () => "/edit",
  editStory: (slug: string) => `/edit/${slug}`,
  /**
   * All Rounder's counterpart to `/edit`.
   *
   * A separate route rather than a flavour-aware `/edit`, because they are not the
   * same content wearing different words: one is an editorial archive, the other
   * is what is selling. Sharing a URL would mean a link that lands somewhere
   * different depending on a cookie — unshareable, and wrong in a new tab.
   */
  trends: () => "/trends",
  brands: () => "/brands",
  brand: (slug: string) => `/brands/${slug}`,

  /** Linked from the 404 page. No page yet. */
  discover: () => "/discover",
} as const;
