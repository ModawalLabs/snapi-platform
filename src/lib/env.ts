import { z } from "zod";

/**
 * Environment contract.
 *
 * Validated once, at module load. A missing or malformed variable fails the
 * build / boots loudly instead of surfacing as `undefined` in a request
 * handler three weeks later.
 *
 * Rules
 * - Server variables must never be imported from a Client Component. The
 *   `serverEnv` getter throws if that happens.
 * - Client variables must be prefixed `NEXT_PUBLIC_` and are inlined at build
 *   time. Treat every one of them as public knowledge.
 *
 * ## Nothing has to be set
 *
 * Every variable here has a default, and on Vercel the two public ones are
 * *derived* from the platform's own system variables — see `inferPublicUrl` and
 * `inferAppEnv`. A fresh deployment with an empty Environment Variables list
 * builds and serves correct absolute URLs. Setting them explicitly is an override,
 * not a prerequisite.
 *
 * That is a deliberate reversal. This file used to hard-fail a Vercel build with
 * `NEXT_PUBLIC_APP_URL: Invalid URL`, and the cause was not a *missing* value —
 * `.default()` covers missing. It was a **blank** one. `.default()` in Zod applies
 * only to `undefined`, so an empty dashboard entry sails past it and lands on
 * `z.url()` as `""`. Hence `pruneBlanks` below: in an environment variable, blank
 * and absent mean the same thing to a human and must mean the same thing here.
 */

/**
 * Blank is absent.
 *
 * A platform that offers a text box will eventually be handed an empty one — a
 * variable created and not filled, a CI matrix that omits a value, a shell that
 * exports `FOO=`. Every one of those arrives as `""`, which is a *present* value
 * as far as Zod is concerned, so it defeats `.default()` and then fails the inner
 * check with a message ("Invalid URL") that gives no hint the box was empty.
 *
 * Mapping `""` to `undefined` before parsing is what makes the defaults actually
 * mean what they say.
 */
function pruneBlanks(source: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value,
    ]),
  );
}

/**
 * An origin, forgiving about the two ways people write one.
 *
 * Accepts `snapi.app` as readily as `https://snapi.app` — a bare hostname is what
 * every platform dashboard shows you and what most people therefore paste, and
 * rejecting it is pedantry that costs a failed deploy. Also drops a trailing slash,
 * because every consumer here concatenates onto this (`${url}/sitemap.xml`) and
 * `https://snapi.app//sitemap.xml` is a real URL that resolves to a 404.
 *
 * `https` when the scheme is inferred: a bare hostname in 2026 is not http, and
 * guessing http would silently downgrade every canonical URL in the metadata.
 */
const origin = z.preprocess((value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (trimmed === "") return undefined;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}, z.url());

/** Case-insensitive enum. `Production` is a typo, not a different environment. */
function looseEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.enum(values),
  );
}

const serverSchema = z.object({
  NODE_ENV: looseEnum(["development", "test", "production"]).default("development"),

  /** Canonical origin, used for absolute URLs in metadata, sitemap, OG images. */
  APP_URL: origin.default("http://localhost:3000"),

  /** LLM provider key. Optional until the AI surfaces land. */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  /** Datastore. Optional in the boilerplate; required once persistence lands. */
  DATABASE_URL: z.url().optional(),

  /** Structured-log verbosity. */
  LOG_LEVEL: looseEnum(["debug", "info", "warn", "error"]).default("info"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: origin.default("http://localhost:3000"),
  NEXT_PUBLIC_APP_ENV: looseEnum(["local", "preview", "production"]).default("local"),
});

function format(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

/**
 * The canonical origin, inferred when it was not given.
 *
 * Only `NEXT_PUBLIC_`-prefixed sources are read here, and that is not stylistic.
 * This module is evaluated both while rendering on the server and again in the
 * browser, where only inlined `NEXT_PUBLIC_*` values exist. Reading a bare
 * `VERCEL_URL` would resolve on the server and be `undefined` on the client — the
 * same expression yielding two different origins across a hydration boundary,
 * which is the subtlest possible way to break a page.
 *
 * Vercel exposes the framework-prefixed copies automatically for Next.js projects.
 * `…PROJECT_PRODUCTION_URL` is the stable custom domain; `…VERCEL_URL` is *this*
 * deployment's own host. Production wants the former (a canonical URL that changes
 * per deployment is not canonical); a preview wants the latter, so its metadata and
 * sitemap point at the build you are actually looking at.
 */
function inferPublicUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit;

  const canonical = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const deployment = process.env.NEXT_PUBLIC_VERCEL_URL;

  // `origin` adds the scheme — Vercel's values are bare hostnames.
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? (canonical ?? deployment)
    : (deployment ?? canonical);
}

/**
 * Which edition of the app this is.
 *
 * Vercel's own `production | preview | development` maps almost one-to-one; its
 * `development` is our `local`, which the default already covers. Getting this
 * right matters more than it looks: `isProduction` gates `robots.ts`, so an
 * unlabelled preview deployment would invite Google to index itself.
 */
function inferAppEnv(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_APP_ENV;
  if (explicit) return explicit;

  const vercel = process.env.NEXT_PUBLIC_VERCEL_ENV;
  return vercel === "production" || vercel === "preview" ? vercel : undefined;
}

/**
 * Client env — safe everywhere.
 *
 * Members are listed explicitly rather than spread from `process.env`: Next
 * only inlines statically-analyzable `process.env.X` references.
 */
const parsedClient = clientSchema.safeParse(
  pruneBlanks({
    NEXT_PUBLIC_APP_URL: inferPublicUrl(),
    NEXT_PUBLIC_APP_ENV: inferAppEnv(),
  }),
);

if (!parsedClient.success) {
  throw new Error(
    `Invalid public environment variables:\n${format(parsedClient.error)}\n\n` +
      `Fix these where they are set — on Vercel that is Project → Settings → ` +
      `Environment Variables. Leaving them unset is also valid: the schema in ` +
      `src/lib/env.ts derives both from Vercel's own system variables.`,
  );
}

export const clientEnv = parsedClient.data;

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/**
 * Server env — call only from Server Components, route handlers, or scripts.
 */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called in the browser. Use clientEnv instead.");
  }

  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse(pruneBlanks(process.env));
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables:\n${format(parsed.error)}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export const isProduction = clientEnv.NEXT_PUBLIC_APP_ENV === "production";
export const isLocal = clientEnv.NEXT_PUBLIC_APP_ENV === "local";
