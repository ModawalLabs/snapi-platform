import { ok, withErrorHandling } from "@/lib/api-response";

/**
 * Liveness / readiness probe.
 *
 * Load balancers and orchestrators poll this. Keep it fast and dependency-free
 * unless a dependency is genuinely required to serve traffic — a health check
 * that fails because a non-critical cache is down will take the fleet out.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BOOTED_AT = Date.now();

export const GET = withErrorHandling(async () => {
  return ok({
    status: "ok",
    service: "snapi-web",
    version: process.env.npm_package_version ?? "0.0.0",
    // Vercel/Git SHA if present — tells you exactly what's deployed.
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    uptimeSeconds: Math.round((Date.now() - BOOTED_AT) / 1000),
    timestamp: new Date().toISOString(),
  });
});
