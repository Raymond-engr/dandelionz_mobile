/**
 * Pure routing helpers for the shared Paystack WebView.
 *
 * The same WebView screen is used for order checkout, installment payments,
 * wallet top-ups and delivery-fee payments, and each one has to be verified
 * against a different endpoint and returned to a different screen. Keeping the
 * decision here — out of the component — means it can be unit tested without
 * rendering a WebView.
 */

export type PaymentKind = "deposit" | "delivery" | "installment" | "order";

/** Wallet top-up references are minted by the backend with this prefix. */
export const DEPOSIT_REFERENCE_PREFIX = "DEP-";

/** Delivery-fee references are minted by the backend with this prefix. */
export const DELIVERY_REFERENCE_PREFIX = "DLV-";

/**
 * Decide which verification flow a Paystack callback belongs to.
 *
 * Deposits and delivery fees are identified by their reference prefix, and the
 * prefix always wins so a stale plan id on the route cannot misroute them.
 * Everything else keeps the pre-existing rule exactly: a plan id means an
 * installment payment, and its absence means a normal order. That ordering
 * matters — order checkout depends on an unprefixed reference with no plan id
 * still resolving to "order".
 */
export function classifyReference(
  reference: string | null | undefined,
  planId?: string | null,
): PaymentKind {
  if (isDepositReference(reference)) return "deposit";
  if (isDeliveryReference(reference)) return "delivery";
  if (planId) return "installment";
  return "order";
}

export function isDepositReference(reference: string | null | undefined): boolean {
  if (!reference) return false;
  return reference.trim().toUpperCase().startsWith(DEPOSIT_REFERENCE_PREFIX);
}

export function isDeliveryReference(reference: string | null | undefined): boolean {
  if (!reference) return false;
  return reference.trim().toUpperCase().startsWith(DELIVERY_REFERENCE_PREFIX);
}
