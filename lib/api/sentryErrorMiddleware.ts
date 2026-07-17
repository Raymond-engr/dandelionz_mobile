import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { captureApiError } from "../observability";

/**
 * Reports every failed RTK Query request to Sentry.
 *
 * This is the safety net for failures no `catch` block observes — a query that
 * fails on a screen nobody is looking at (the customer-profile 403 an admin
 * triggers on login, say) is otherwise invisible outside the server logs.
 *
 * Screens that own a flow also report from their own `catch` with product
 * context; those arrive as separate, more specific issues. This one always
 * fires, so a failure is never lost just because a screen forgot to report it.
 */
export const sentryApiErrorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const meta = (action as { meta?: Record<string, unknown> }).meta ?? {};

    // `condition` = never dispatched (skip//dedupe), `aborted` = superseded or
    // unmounted. Neither is a real failure.
    if (!meta.condition && !meta.aborted) {
      const arg = (meta.arg ?? {}) as {
        endpointName?: string;
        originalArgs?: unknown;
        type?: string;
      };

      captureApiError((action as { payload?: unknown }).payload, {
        flow: "api",
        action: arg.endpointName ?? "unknown",
        extra: {
          endpointName: arg.endpointName,
          requestType: arg.type,
          originalArgs: arg.originalArgs,
        },
      });
    }
  }

  return next(action);
};
