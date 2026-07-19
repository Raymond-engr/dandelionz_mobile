/**
 * Pure routing helpers for the shared Paystack WebView.
 *
 * The same WebView screen is used for order checkout, installment payments and
 * wallet top-ups, and each one has to be verified against a different endpoint
 * and returned to a different screen. Keeping the decision here — out of the
 * component — means it can be unit tested without rendering a WebView.
 */

export type PaymentKind = "deposit" | "installment" | "order";

/** Wallet top-up references are minted by the backend with this prefix. */
export const DEPOSIT_REFERENCE_PREFIX = "DEP-";

/**
 * Decide which verification flow a Paystack callback belongs to.
 *
 * Deposits are identified by their reference prefix. Everything else keeps the
 * pre-existing rule exactly: a plan id means an installment payment, and its
 * absence means a normal order. That ordering matters — order checkout depends
 * on an unprefixed reference with no plan id still resolving to "order".
 */
export function classifyReference(
  reference: string | null | undefined,
  planId?: string | null,
): PaymentKind {
  if (isDepositReference(reference)) return "deposit";
  if (planId) return "installment";
  return "order";
}

export function isDepositReference(reference: string | null | undefined): boolean {
  if (!reference) return false;
  return reference.trim().toUpperCase().startsWith(DEPOSIT_REFERENCE_PREFIX);
}
