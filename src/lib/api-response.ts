import { NextResponse } from "next/server";

import { toAppError, type AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Route-handler helpers.
 *
 * The point is that every API response in the app has the same envelope and
 * every failure is logged exactly once, with a request id the client can quote
 * back in a support ticket.
 */

const REQUEST_ID_HEADER = "x-request-id";

function requestIdFrom(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
}

export function ok<T>(data: T, init: { status?: number; requestId?: string } = {}) {
  return NextResponse.json(
    { data },
    {
      status: init.status ?? 200,
      headers: init.requestId ? { [REQUEST_ID_HEADER]: init.requestId } : undefined,
    },
  );
}

function fail(error: AppError, requestId?: string) {
  return NextResponse.json(
    { ...error.toResponseBody(), requestId },
    {
      status: error.status,
      headers: requestId ? { [REQUEST_ID_HEADER]: requestId } : undefined,
    },
  );
}

/**
 * Wrap a route handler so no unhandled throw ever reaches the client as an
 * opaque 500 with a stack trace in it.
 *
 * Usage:
 *   export const GET = withErrorHandling(async (request) => ok({ hello: "world" }))
 */
export function withErrorHandling<TContext>(
  handler: (request: Request, context: TContext) => Promise<Response>,
) {
  return async (request: Request, context: TContext): Promise<Response> => {
    const requestId = requestIdFrom(request);
    const startedAt = Date.now();

    try {
      return await handler(request, context);
    } catch (error) {
      const appError = toAppError(error);

      // Expected errors are user-driven and belong at `warn`. Unexpected ones
      // are ours and should be loud enough to alert on.
      const log = logger.child({ requestId, path: new URL(request.url).pathname });
      if (appError.expected) {
        log.warn(appError.message, { code: appError.code, durationMs: Date.now() - startedAt });
      } else {
        log.error("Unhandled route error", appError, { durationMs: Date.now() - startedAt });
      }

      return fail(appError, requestId);
    }
  };
}
