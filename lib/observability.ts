import * as Sentry from "@sentry/react-native";

/**
 * Error reporting for API failures.
 *
 * Two entry points:
 * - `sentryApiErrorMiddleware` (wired into the store) reports EVERY rejected
 *   RTK Query request, including ones no `catch` block ever sees.
 * - `captureApiError` is called from `catch` blocks to attach flow context
 *   (which product, which action) that the middleware cannot know.
 *
 * Both funnel into the same normaliser so a given failure groups consistently
 * in Sentry whichever path reports it.
 */

/** Values under these keys never leave the device. */
const REDACTED_KEYS = new Set([
  "password",
  "password2",
  "old_password",
  "new_password",
  "confirm_password",
  "pin",
  "old_pin",
  "new_pin",
  "otp",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "secret",
]);

const MAX_STRING = 500;
const MAX_DEPTH = 4;

const isRedacted = (key: string) => REDACTED_KEYS.has(key.toLowerCase());

const truncate = (value: string) =>
  value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;

/**
 * React Native's FormData keeps its fields on the non-standard `_parts`
 * ([name, value] tuples) and has no `entries()`, so read that directly.
 * File parts are reported as their {uri, name, type} descriptor — the uri is
 * what we need to spot a file that vanished before upload.
 */
function summarizeFormData(form: FormData): Record<string, unknown> {
  const parts = (form as unknown as { _parts?: [unknown, unknown][] })._parts;
  if (!Array.isArray(parts)) return { _note: "FormData contents unavailable" };

  const out: Record<string, unknown> = {};
  for (const [rawKey, value] of parts) {
    const key = String(rawKey);
    if (isRedacted(key)) {
      out[key] = "[redacted]";
    } else if (value && typeof value === "object" && "uri" in value) {
      const file = value as { uri?: string; name?: string; type?: string };
      out[key] = { uri: file.uri, name: file.name, type: file.type };
    } else if (typeof value === "string") {
      out[key] = truncate(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Deep-copy a value for Sentry, dropping secrets and capping size. */
export function redact(value: unknown, depth = 0): unknown {
  if (value == null) return value;

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return summarizeFormData(value);
  }
  if (typeof value === "string") return truncate(value);
  if (typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[…]";

  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = isRedacted(key) ? "[redacted]" : redact(item, depth + 1);
  }
  return out;
}

export interface ApiErrorDescription {
  /** "403", "FETCH_ERROR", "TIMEOUT_ERROR", … — used for tagging/grouping. */
  status: string;
  message: string;
  /** True when the request never got an HTTP response at all. */
  isNetworkFailure: boolean;
  /** Response body, for HTTP errors. */
  body?: unknown;
}

/**
 * Flatten RTK Query's error union into something reportable.
 * `{status: number, data}` for HTTP errors; `{status: "FETCH_ERROR", error}`
 * and friends when the request never completed.
 */
export function describeApiError(err: unknown): ApiErrorDescription {
  if (err == null) {
    return { status: "unknown", message: "Unknown error", isNetworkFailure: false };
  }

  const candidate = err as {
    status?: unknown;
    data?: unknown;
    error?: unknown;
    originalStatus?: number;
  };

  if (typeof candidate.status === "number") {
    const body = candidate.data;
    const detail =
      typeof body === "string"
        ? body
        : ((body as Record<string, unknown>)?.detail ??
          (body as Record<string, unknown>)?.message ??
          (body as Record<string, unknown>)?.error);
    return {
      status: String(candidate.status),
      message: detail ? truncate(String(detail)) : `HTTP ${candidate.status}`,
      isNetworkFailure: false,
      body: redact(body),
    };
  }

  // FETCH_ERROR | TIMEOUT_ERROR | PARSING_ERROR | CUSTOM_ERROR
  if (typeof candidate.status === "string") {
    return {
      status: candidate.status,
      message: truncate(String(candidate.error ?? "no detail")),
      isNetworkFailure:
        candidate.status === "FETCH_ERROR" || candidate.status === "TIMEOUT_ERROR",
      body: candidate.originalStatus
        ? { originalStatus: candidate.originalStatus }
        : undefined,
    };
  }

  if (err instanceof Error) {
    return { status: err.name || "Error", message: err.message, isNetworkFailure: false };
  }

  return { status: "unknown", message: truncate(String(err)), isNetworkFailure: false };
}

export interface ApiErrorContext {
  /** Feature area, e.g. "product". Coarse grouping key. */
  flow: string;
  /** What was attempted, e.g. "publish", "save-draft", "delete". */
  action: string;
  /** Anything else worth having when this fires: slug, role, image count. */
  extra?: Record<string, unknown>;
}

/**
 * Report a failure to Sentry. Safe to call with anything: an RTK Query error
 * object, an Error, or a thrown string.
 *
 * Never throws — reporting must not be able to break the flow it reports on.
 */
export function captureApiError(err: unknown, context: ApiErrorContext): void {
  try {
    const described = describeApiError(err);

    // A plain RTK error object carries no stack, so synthesise one to keep the
    // report anchored to this call site. Real Errors are passed through intact.
    const error =
      err instanceof Error
        ? err
        : Object.assign(
            new Error(`${context.flow}/${context.action} failed — ${described.status}: ${described.message}`),
            { name: "ApiError" },
          );

    Sentry.withScope((scope) => {
      scope.setTag("flow", context.flow);
      scope.setTag("action", context.action);
      scope.setTag("api.status", described.status);
      scope.setTag("api.network_failure", String(described.isNetworkFailure));

      scope.setContext("api_error", {
        status: described.status,
        message: described.message,
        isNetworkFailure: described.isNetworkFailure,
        body: described.body ?? null,
      });

      if (context.extra) {
        scope.setContext("flow_context", redact(context.extra) as Record<string, unknown>);
      }

      // Group by what failed and how, not by the synthesised message.
      scope.setFingerprint(["api", context.flow, context.action, described.status]);

      Sentry.captureException(error);
    });
  } catch {
    // Reporting failed; nothing useful left to do.
  }
}

/**
 * Breadcrumb for a user-initiated step, so a later capture shows what led here.
 */
export function trackAction(message: string, data?: Record<string, unknown>): void {
  try {
    Sentry.addBreadcrumb({
      category: "flow",
      level: "info",
      message,
      data: data ? (redact(data) as Record<string, unknown>) : undefined,
    });
  } catch {
    // Ignore.
  }
}
