/**
 * Cookie names, shared by server and client code.
 *
 * These live in a module with NO `"use client"` directive on purpose. A constant
 * imported from a client module into a Server Component does not arrive as its
 * value — the bundler replaces the import with a client-reference proxy, so
 * `cookies().get(THAT)` silently returns undefined and the server renders the
 * default. Keeping shared constants in a neutral module is what prevents it.
 */
export const COOKIES = {
  /** "true" when the desktop sidebar is collapsed to its icon rail. */
  sidebarCollapsed: "snapi.sidebar.collapsed",
  /**
   * Which edition of Snapi the user is in — see `config/flavour.ts`.
   *
   * A cookie rather than `localStorage` because the accent covers the whole page.
   * The server has to know it to put the right value in the first HTML; read it
   * on the client and every load would paint gold and correct itself afterwards,
   * which on an app-wide accent is a very visible flash.
   */
  flavour: "snapi.flavour",
} as const;

/** One year. These are layout preferences, not credentials. */
export const PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
