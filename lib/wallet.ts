/**
 * Fallback minimum withdrawal, in naira.
 *
 * The server is the authority: it enforces `MIN_WITHDRAWAL_NGN` and returns the current
 * value as `min_withdrawal` on the wallet balance endpoint. This constant is only the
 * value used before that response arrives, and it exists because mobile and web used to
 * hardcode different numbers (500 and 100) while the server enforced neither.
 */
export const MIN_WITHDRAWAL = 500;

/** Smallest top-up the backend accepts, in naira. Server-enforced. */
export const MIN_DEPOSIT = 100;

/** Largest top-up the backend accepts in a single transaction, in naira. Server-enforced. */
export const MAX_DEPOSIT = 500000;

export interface DepositAmountCheck {
  valid: boolean;
  reason?: string;
}

/**
 * Pure validity check for the wallet top-up amount.
 *
 * The server is the authority on the bounds — this only stops obviously bad
 * requests before they are sent, and supplies the message shown under the input.
 * Bounds are injectable so a future server-supplied min/max can be threaded
 * through without touching callers' logic.
 */
export function isDepositAmountValid(
  amount: number,
  {
    min = MIN_DEPOSIT,
    max = MAX_DEPOSIT,
  }: { min?: number; max?: number } = {},
): DepositAmountCheck {
  if (!Number.isFinite(amount)) {
    return { valid: false, reason: "Enter an amount." };
  }
  if (amount <= 0) {
    return { valid: false, reason: "Enter an amount greater than zero." };
  }
  if (amount < min) {
    return { valid: false, reason: `Minimum top-up is ₦${min.toLocaleString()}.` };
  }
  if (amount > max) {
    return { valid: false, reason: `Maximum top-up is ₦${max.toLocaleString()}.` };
  }
  return { valid: true };
}

export interface CheckoutSplit {
  /** What the wallet will cover. */
  wallet: number;
  /** What the card will be charged. Zero means no payment page opens at all. */
  card: number;
}

/**
 * Preview how an order total will divide between wallet and card.
 *
 * The server decides this for real — see plan_split in transactions/wallet_checkout.py —
 * and this mirrors it so the checkout screen can show the customer the split before they
 * commit. Kept deliberately identical in shape: if the two ever disagree, the number on
 * screen is a promise the server will break.
 *
 * Guards against a negative card leg and a negative wallet leg independently, because a
 * balance larger than the order is the common case, not an edge case.
 */
export function planCheckoutSplit(total: number, walletBalance: number): CheckoutSplit {
  if (!Number.isFinite(total) || total <= 0) {
    return { wallet: 0, card: 0 };
  }
  if (!Number.isFinite(walletBalance) || walletBalance <= 0) {
    return { wallet: 0, card: total };
  }
  const wallet = Math.min(walletBalance, total);
  return { wallet, card: Math.max(0, total - wallet) };
}

export interface RefundAmountCheck {
  valid: boolean;
  reason?: string;
}

/**
 * Pure validity check for refunding deposited funds to the original card.
 *
 * Gated on `refundable`, not on the spendable balance: a top-up with no recorded Paystack
 * transaction id cannot be sent back to source, so the two numbers can differ and the
 * lower one is the real ceiling. Telling the user "you have ₦5,000" and then rejecting a
 * ₦5,000 refund is exactly the mismatch this avoids.
 */
export function isRefundAmountValid(
  amount: number,
  { refundable }: { refundable: number },
): RefundAmountCheck {
  if (!Number.isFinite(amount)) {
    return { valid: false, reason: "Enter an amount." };
  }
  if (amount <= 0) {
    return { valid: false, reason: "Enter an amount greater than zero." };
  }
  if (refundable <= 0) {
    return { valid: false, reason: "You have no deposited funds to refund." };
  }
  if (amount > refundable) {
    return {
      valid: false,
      reason: `You can refund up to ₦${refundable.toLocaleString()}.`,
    };
  }
  return { valid: true };
}

/**
 * Pure validity check for the customer withdrawal form. Bank details are no
 * longer part of the request body — they come from saved payout settings — so
 * the only things this gates are the amount and the 4-digit payment PIN.
 *
 * `minimum` defaults to MIN_WITHDRAWAL so existing callers keep working, but callers
 * should pass the server-supplied value so the client and server never disagree.
 */
export function isWithdrawFormValid({
  amount,
  pin,
  balance,
  minimum = MIN_WITHDRAWAL,
}: {
  amount: number;
  pin: string;
  balance: number;
  minimum?: number;
}): boolean {
  if (!Number.isFinite(amount)) return false;
  if (amount < minimum) return false;
  if (amount > balance) return false;
  if (pin.length !== 4) return false;
  return true;
}
