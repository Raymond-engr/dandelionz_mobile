/**
 * Presentation rules for the finance ledger.
 *
 * Pulled out of the screen because these are the bits that carry meaning rather than
 * layout: whether a row is money coming in or going out, and which of the two wallet
 * buckets it touched. Getting either backwards on a finance screen is the kind of error
 * that gets believed.
 */

export type LedgerDirection = 'CREDIT' | 'DEBIT';
export type LedgerBucket = 'SPENDABLE' | 'WITHDRAWABLE';

/** Money arriving in a wallet. Debits are money leaving. */
export function isMoneyIn(direction: string): boolean {
  return direction === 'CREDIT';
}

/**
 * Format an amount with the sign its direction implies.
 *
 * Uses a proper minus sign (U+2212) rather than a hyphen so it lines up in a column of
 * figures. The amount itself is always stored positive - direction carries the sign - so
 * this is the only place the sign is applied.
 */
export function signedAmountLabel(amount: string | number, direction: string): string {
  const value = Math.abs(Number(amount) || 0);
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isMoneyIn(direction) ? '+' : '−'}₦${formatted}`;
}

/**
 * What to call each bucket in the UI.
 *
 * "Deposit" rather than "Spendable" because that is what it means to an operator looking
 * at someone's account: money the user put in themselves, which can be spent but never
 * withdrawn to a bank.
 */
export function bucketLabel(bucket: string): string {
  return bucket === 'SPENDABLE' ? 'Deposit' : 'Withdrawable';
}

/**
 * Count of filters currently narrowing the view, for a "Clear (2)" style badge.
 *
 * Takes `object` rather than `Record<string, unknown>` so a declared interface like
 * LedgerFilters can be passed directly — an interface without an index signature is not
 * assignable to a Record, and widening at every call site would be noise.
 */
export function activeFilterCount(filters: object): number {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === 'page') return false;
    return value !== undefined && value !== null && String(value).trim() !== '';
  }).length;
}
