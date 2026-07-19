import {
  MAX_DEPOSIT,
  MIN_DEPOSIT,
  MIN_WITHDRAWAL,
  isDepositAmountValid,
  isWithdrawFormValid,
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
