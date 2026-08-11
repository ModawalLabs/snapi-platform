/**
 * Error taxonomy.
 *
 * Every failure that crosses a boundary (route handler, server action, fetch)
 * should be one of these. Two properties matter at scale:
 *
 * - `code` is a stable machine string. Clients and dashboards branch on it.
 *   Never branch on a human message.
 * - `expected` separates "the user typed a bad SKU" from "Postgres is down".
 *   Only the latter should page anyone.
 */

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "INTERNAL";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  TIMEOUT: 504,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** True when this is a normal, anticipated outcome — do not alert on it. */
  readonly expected: boolean;
  /** Safe to render to an end user. Never contains internal detail. */
  readonly publicMessage: string;
  readonly context: Record<string, unknown> | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      publicMessage?: string;
      expected?: boolean;
      context?: Record<string, unknown>;
      cause?: unknown;
    } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.expected = options.expected ?? code !== "INTERNAL";
    this.publicMessage = options.publicMessage ?? defaultPublicMessage(code);
    this.context = options.context;
  }

  /** Shape returned to clients. Deliberately omits `message` and `context`. */
  toResponseBody() {
    return {
      error: {
        code: this.code,
        message: this.publicMessage,
      },
    };
  }
}

function defaultPublicMessage(code: ErrorCode): string {
  switch (code) {
    case "BAD_REQUEST":
      return "That request wasn't valid. Please check your input and try again.";
    case "UNAUTHORIZED":
      return "Please sign in to continue.";
    case "FORBIDDEN":
      return "You don't have access to this.";
    case "NOT_FOUND":
      return "We couldn't find what you were looking for.";
    case "CONFLICT":
      return "That change conflicts with the current state. Refresh and retry.";
    case "RATE_LIMITED":
      return "Too many requests. Please slow down and try again shortly.";
    case "UPSTREAM_ERROR":
      return "A service we depend on is having trouble. Please try again.";
    case "TIMEOUT":
      return "That took too long to respond. Please try again.";
    case "INTERNAL":
      return "Something went wrong on our end. We're looking into it.";
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/** Narrow anything thrown into an AppError so handlers stay uniform. */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (error instanceof DOMException && error.name === "AbortError") {
    return new AppError("TIMEOUT", "Request aborted", { cause: error });
  }

  return new AppError("INTERNAL", error instanceof Error ? error.message : String(error), {
    expected: false,
    cause: error,
  });
}
