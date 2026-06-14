import { logger } from "./logger";

/**
 * Single funnel for reporting unexpected errors.
 *
 * This is the integration point for an error-tracking service (e.g. Sentry,
 * Bugsnag). We deliberately do NOT pull in a heavy SDK until it's actually
 * configured — adding a dependency is a real cost. When you're ready, install
 * the SDK and forward `err`/`context` to it from here; everything already calls
 * this function, so no other code needs to change.
 *
 * Set `ERROR_TRACKING_DSN` in the environment to signal that a service is wired
 * up (used only for an informational log flag today).
 */
const dsn = process.env.ERROR_TRACKING_DSN;

export function captureException(
  err: unknown,
  context?: Record<string, unknown>,
): void {
  logger.error(
    { err, ...context, errorTracking: dsn ? "configured" : "disabled" },
    "captured exception",
  );
}
