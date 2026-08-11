import { isLocal } from "@/lib/env";

/**
 * Structured logger.
 *
 * One line of JSON per event in deployed environments so a log aggregator can
 * index it; human-readable in local dev. Swap the `emit` sink for your vendor
 * transport (Datadog, Axiom, OTel) and every call site keeps working.
 *
 * Never log raw PII, tokens, card data, or full request bodies. Log IDs and
 * let the operator join against the datastore.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/** Read directly rather than via serverEnv() so the logger is import-safe anywhere. */
const minLevel: LogLevel = (() => {
  const configured = process.env.LOG_LEVEL;
  if (
    configured === "debug" ||
    configured === "info" ||
    configured === "warn" ||
    configured === "error"
  ) {
    return configured;
  }
  return isLocal ? "debug" : "info";
})();

export type LogContext = Record<string, unknown> & {
  /** Correlates every log line emitted while handling one request. */
  requestId?: string;
  userId?: string;
  /** Duration in ms, for anything worth a latency SLO. */
  durationMs?: number;
};

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isLocal ? error.stack : undefined,
      cause: error.cause instanceof Error ? error.cause.message : undefined,
    };
  }
  return { name: "UnknownError", message: String(error) };
}

function emit(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) return;

  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
    ...(error ? { error: serializeError(error) } : {}),
  };

  // This is the one place `console.log` is legitimate — the `no-console` rule
  // exists to route everything else through here.
  // eslint-disable-next-line no-console
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (isLocal) {
    const { level: _l, message: _m, timestamp: _t, ...rest } = payload;
    sink(`[${level}] ${message}`, Object.keys(rest).length ? rest : "");
    return;
  }

  sink(JSON.stringify(payload));
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    emit("error", message, context, error),

  /** Returns a logger that stamps every line with the same base context. */
  child: (base: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      emit("debug", message, { ...base, ...context }),
    info: (message: string, context?: LogContext) => emit("info", message, { ...base, ...context }),
    warn: (message: string, context?: LogContext) => emit("warn", message, { ...base, ...context }),
    error: (message: string, error?: unknown, context?: LogContext) =>
      emit("error", message, { ...base, ...context }, error),
  }),
};
