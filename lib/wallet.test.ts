import {
  MAX_DEPOSIT,
  MIN_DEPOSIT,
  MIN_WITHDRAWAL,
  isDepositAmountValid,
  isRefundAmountValid,
  isWithdrawFormValid,
  planCheckoutSplit,
} from "./wallet";

describe("MIN_WITHDRAWAL", () => {
  it("is 500, the smallest payout the backend accepts", () => {
    expect(MIN_WITHDRAWAL).toBe(500);
  });
});

describe("isWithdrawFormValid", () => {
  it("returns true for an amount at or above the minimum, within balance, with a 4-digit PIN", () => {
    expect(isWithdrawFormValid({ amount: 1000, pin: "1234", balance: 5000 })).toBe(
      true,
    );
  });

  it("returns true when the amount is exactly the minimum withdrawal", () => {
    expect(isWithdrawFormValid({ amount: 500, pin: "1234", balance: 5000 })).toBe(
      true,
    );
  });

  it("returns true when the amount is exactly the full balance", () => {
    expect(isWithdrawFormValid({ amount: 5000, pin: "1234", balance: 5000 })).toBe(
      true,
    );
  });

  it("returns false when the amount is below the minimum withdrawal", () => {
    expect(isWithdrawFormValid({ amount: 499, pin: "1234", balance: 5000 })).toBe(
      false,
    );
  });

  it("returns false when the amount exceeds the available balance", () => {
    expect(isWithdrawFormValid({ amount: 5001, pin: "1234", balance: 5000 })).toBe(
      false,
    );
  });

  it("returns false when the PIN is shorter than 4 digits", () => {
    expect(isWithdrawFormValid({ amount: 1000, pin: "123", balance: 5000 })).toBe(
      false,
    );
  });

  it("returns false when the PIN is longer than 4 digits", () => {
    expect(isWithdrawFormValid({ amount: 1000, pin: "12345", balance: 5000 })).toBe(
      false,
    );
  });

  it("returns false when the PIN is empty", () => {
    expect(isWithdrawFormValid({ amount: 1000, pin: "", balance: 5000 })).toBe(
      false,
    );
  });

  it("returns false for NaN, which is what an unparseable amount input produces", () => {
    expect(isWithdrawFormValid({ amount: NaN, pin: "1234", balance: 5000 })).toBe(
      false,
    );
  });

  it("returns false when the balance is zero", () => {
    expect(isWithdrawFormValid({ amount: 500, pin: "1234", balance: 0 })).toBe(
      false,
    );
  });

  it("returns false for a negative amount", () => {
    expect(isWithdrawFormValid({ amount: -1000, pin: "1234", balance: 5000 })).toBe(
      false,
    );
  });
});

describe("deposit bounds", () => {
  it("mirrors the server-enforced minimum of 100", () => {
    expect(MIN_DEPOSIT).toBe(100);
  });

  it("mirrors the server-enforced maximum of 500000", () => {
    expect(MAX_DEPOSIT).toBe(500000);
  });
});

describe("isDepositAmountValid", () => {
  it("accepts an amount comfortably inside the bounds", () => {
    expect(isDepositAmountValid(5000).valid).toBe(true);
  });

  it("accepts the exact minimum", () => {
    expect(isDepositAmountValid(MIN_DEPOSIT).valid).toBe(true);
  });

  it("accepts the exact maximum", () => {
    expect(isDepositAmountValid(MAX_DEPOSIT).valid).toBe(true);
  });

  it("rejects an amount one naira below the minimum", () => {
    expect(isDepositAmountValid(99).valid).toBe(false);
  });

  it("rejects an amount one naira above the maximum", () => {
    expect(isDepositAmountValid(500001).valid).toBe(false);
  });

  it("rejects NaN, which is what an empty or unparseable input produces", () => {
    expect(isDepositAmountValid(NaN).valid).toBe(false);
  });

  it("rejects Infinity", () => {
    expect(isDepositAmountValid(Infinity).valid).toBe(false);
  });

  it("rejects zero", () => {
    expect(isDepositAmountValid(0).valid).toBe(false);
  });

  it("rejects a negative amount", () => {
    expect(isDepositAmountValid(-500).valid).toBe(false);
  });

  it("gives a reason whenever it rejects, and none when it accepts", () => {
    expect(isDepositAmountValid(50).reason).toBeTruthy();
    expect(isDepositAmountValid(600000).reason).toBeTruthy();
    expect(isDepositAmountValid(NaN).reason).toBeTruthy();
    expect(isDepositAmountValid(1000).reason).toBeUndefined();
  });

  it("reports the minimum and the maximum with distinct reasons", () => {
    expect(isDepositAmountValid(50).reason).not.toBe(
      isDepositAmountValid(600000).reason,
    );
  });

  it("honours caller-supplied bounds over the defaults", () => {
    expect(isDepositAmountValid(150, { min: 200 }).valid).toBe(false);
    expect(isDepositAmountValid(50, { min: 10 }).valid).toBe(true);
    expect(isDepositAmountValid(9000, { max: 5000 }).valid).toBe(false);
    expect(isDepositAmountValid(600000, { max: 1000000 }).valid).toBe(true);
  });
});

describe("isWithdrawFormValid with a server-supplied minimum", () => {
  it("rejects an amount below the server minimum even when it clears the local default", () => {
    expect(
      isWithdrawFormValid({ amount: 600, pin: "1234", balance: 10000, minimum: 1000 }),
    ).toBe(false);
  });

  it("accepts an amount below the local default when the server minimum is lower", () => {
    expect(
      isWithdrawFormValid({ amount: 200, pin: "1234", balance: 10000, minimum: 100 }),
    ).toBe(true);
  });

  it("falls back to the local default when no minimum is supplied", () => {
    expect(isWithdrawFormValid({ amount: 499, pin: "1234", balance: 10000 })).toBe(false);
    expect(isWithdrawFormValid({ amount: 500, pin: "1234", balance: 10000 })).toBe(true);
  });
});

describe("isRefundAmountValid", () => {
  it("accepts an amount within the refundable total", () => {
    expect(isRefundAmountValid(500, { refundable: 2000 }).valid).toBe(true);
  });

  it("accepts refunding the whole refundable balance", () => {
    expect(isRefundAmountValid(2000, { refundable: 2000 }).valid).toBe(true);
  });

  it("rejects more than can be sent back to source", () => {
    const check = isRefundAmountValid(2500, { refundable: 2000 });
    expect(check.valid).toBe(false);
    expect(check.reason).toContain("2,000");
  });

  it("caps on the refundable amount, not the spendable balance", () => {
    // A top-up with no recorded Paystack transaction id counts towards the balance but
    // cannot go back to a card, so the two numbers legitimately differ. Gating on the
    // balance would let the user submit a refund the server is bound to reject.
    expect(isRefundAmountValid(5000, { refundable: 1200 }).valid).toBe(false);
  });

  it("rejects zero and negative amounts", () => {
    expect(isRefundAmountValid(0, { refundable: 2000 }).valid).toBe(false);
    expect(isRefundAmountValid(-100, { refundable: 2000 }).valid).toBe(false);
  });

  it("explains an empty or unparsed input rather than showing a bounds error", () => {
    const check = isRefundAmountValid(NaN, { refundable: 2000 });
    expect(check.valid).toBe(false);
    expect(check.reason).toBe("Enter an amount.");
  });

  it("says there is nothing to refund when no deposits remain", () => {
    const check = isRefundAmountValid(100, { refundable: 0 });
    expect(check.valid).toBe(false);
    expect(check.reason).toContain("no deposited funds");
  });
});

describe("planCheckoutSplit", () => {
  it("puts the whole order on the card when the wallet is empty", () => {
    expect(planCheckoutSplit(5000, 0)).toEqual({ wallet: 0, card: 5000 });
  });

  it("covers the whole order when the wallet is large enough", () => {
    expect(planCheckoutSplit(1000, 5000)).toEqual({ wallet: 1000, card: 0 });
  });

  it("splits when the wallet covers only part", () => {
    expect(planCheckoutSplit(5000, 2000)).toEqual({ wallet: 2000, card: 3000 });
  });

  it("never returns a negative card leg", () => {
    // A balance larger than the order is the common case, not an edge case.
    const { card } = planCheckoutSplit(100, 999999);
    expect(card).toBe(0);
  });

  it("always sums back to the order total", () => {
    for (const [total, balance] of [[5000, 2000], [1000, 5000], [750.5, 250.25]]) {
      const { wallet, card } = planCheckoutSplit(total, balance);
      expect(wallet + card).toBeCloseTo(total, 2);
    }
  });

  it("treats a zero or negative total as nothing to pay", () => {
    expect(planCheckoutSplit(0, 5000)).toEqual({ wallet: 0, card: 0 });
    expect(planCheckoutSplit(-100, 5000)).toEqual({ wallet: 0, card: 0 });
  });

  it("falls back to the card for an unparseable balance", () => {
    expect(planCheckoutSplit(5000, NaN)).toEqual({ wallet: 0, card: 5000 });
  });

  it("agrees with the server's plan_split on the boundary cases it mirrors", () => {
    // Same three cases asserted in PlanSplitTests on the backend. If these drift, the
    // number shown at checkout is a promise the server will not keep.
    expect(planCheckoutSplit(1000, 5000)).toEqual({ wallet: 1000, card: 0 });
    expect(planCheckoutSplit(5000, 2000)).toEqual({ wallet: 2000, card: 3000 });
    expect(planCheckoutSplit(5000, 0)).toEqual({ wallet: 0, card: 5000 });
  });
});
