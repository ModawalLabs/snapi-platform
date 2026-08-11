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
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** Canonical origin, used for absolute URLs in metadata, sitemap, OG images. */
  APP_URL: z.url().default("http://localhost:3000"),

  /** LLM provider key. Optional until the AI surfaces land. */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  /** Datastore. Optional in the boilerplate; required once persistence lands. */
  DATABASE_URL: z.url().optional(),

  /** Structured-log verbosity. */
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_ENV: z.enum(["local", "preview", "production"]).default("local"),
});

function format(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

/**
 * Client env — safe everywhere.
 *
 * Members are listed explicitly rather than spread from `process.env`: Next
 * only inlines statically-analyzable `process.env.X` references.
 */
const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});

if (!parsedClient.success) {
  throw new Error(`Invalid public environment variables:\n${format(parsedClient.error)}`);
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

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables:\n${format(parsed.error)}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export const isProduction = clientEnv.NEXT_PUBLIC_APP_ENV === "production";
export const isLocal = clientEnv.NEXT_PUBLIC_APP_ENV === "local";
