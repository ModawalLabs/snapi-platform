import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (formerly `middleware.ts` — renamed in Next 16).
 *
 * Runs before every matched request, so it must stay cheap: no database calls,
 * no heavy imports, no awaiting anything slow. Everything here is on the
 * critical path of every page view.
 *
 * Responsibilities:
 *  1. Stamp a request id so one user action is traceable across all log lines.
 *  2. Emit a per-request nonce CSP.
 */

const isDev = process.env.NODE_ENV === "development";

/**
 * Whether the policy is advisory or enforced.
 *
 * Report-only until the app's real script/connect surface is known. Flip this to
 * `false` once violation reports are clean — `buildCsp` reads it, so the header
 * name and the directive set stay consistent instead of drifting apart.
 */
const REPORT_ONLY = true;

function buildCsp(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    // 'strict-dynamic' lets nonce-approved scripts load their own dependencies,
    // which is what makes a nonce CSP survive Next's chunk loading.
    // `unsafe-eval` is dev-only — React Refresh needs it.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,
    // Tailwind and next/font inject style tags a nonce cannot cover.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${isDev ? "ws: http://localhost:*" : ""}`,
    `media-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];

  // `upgrade-insecure-requests` has no meaning in a report-only policy — there is
  // nothing to report, since it changes requests rather than blocking them — and
  // the browser logs an error for every page load saying so. Adding it only when
  // the policy is enforced keeps the console clean now and brings the directive
  // back automatically the day `REPORT_ONLY` flips.
  if (!REPORT_ONLY) directives.push(`upgrade-insecure-requests`);

  return directives
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const csp = buildCsp(nonce);

  // Forward these on so Server Components and route handlers can read them.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("x-request-id", requestId);
  response.headers.set(
    REPORT_ONLY ? "content-security-policy-report-only" : "content-security-policy",
    csp,
  );

  return response;
}

export const config = {
  /**
   * Skip static assets and image optimization — they need no nonce, and running
   * this on every asset is a measurable cost at scale.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
