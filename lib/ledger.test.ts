import {
  activeFilterCount,
  bucketLabel,
  isMoneyIn,
  signedAmountLabel,
} from "./ledger";

describe("isMoneyIn", () => {
  it("treats a credit as money arriving", () => {
    expect(isMoneyIn("CREDIT")).toBe(true);
  });

  it("treats a debit as money leaving", () => {
    expect(isMoneyIn("DEBIT")).toBe(false);
  });

  it("does not treat an unknown direction as money in", () => {
    // Fail closed: showing an unrecognised row as green income is the wrong way to be
    // wrong on a finance screen.
    expect(isMoneyIn("")).toBe(false);
    expect(isMoneyIn("SOMETHING_NEW")).toBe(false);
  });
});

describe("signedAmountLabel", () => {
  it("prefixes a credit with a plus", () => {
    expect(signedAmountLabel("1000.00", "CREDIT")).toBe("+₦1,000.00");
  });

  it("prefixes a debit with a minus", () => {
    expect(signedAmountLabel("500.00", "DEBIT")).toBe("−₦500.00");
  });

  it("always shows two decimal places", () => {
    expect(signedAmountLabel("1000", "CREDIT")).toBe("+₦1,000.00");
    expect(signedAmountLabel("0.5", "CREDIT")).toBe("+₦0.50");
  });

  it("groups thousands", () => {
    expect(signedAmountLabel("1234567.89", "CREDIT")).toBe("+₦1,234,567.89");
  });

  it("ignores a sign already on the amount and uses the direction", () => {
    // Amounts are stored positive and direction carries the sign; a stray negative in the
    // data must not produce "−₦−500".
    expect(signedAmountLabel("-500.00", "DEBIT")).toBe("−₦500.00");
    expect(signedAmountLabel("-500.00", "CREDIT")).toBe("+₦500.00");
  });

  it("renders zero without breaking", () => {
    expect(signedAmountLabel("0", "CREDIT")).toBe("+₦0.00");
  });

  it("falls back to zero for an unparseable amount", () => {
    expect(signedAmountLabel("not a number", "CREDIT")).toBe("+₦0.00");
  });

  it("uses a real minus sign, not a hyphen, so figures align in a column", () => {
    expect(signedAmountLabel("500.00", "DEBIT").startsWith("−")).toBe(true);
    expect(signedAmountLabel("500.00", "DEBIT").startsWith("-")).toBe(false);
  });
});

describe("bucketLabel", () => {
  it("calls the spendable bucket a deposit, which is what it means to an operator", () => {
    expect(bucketLabel("SPENDABLE")).toBe("Deposit");
  });

  it("labels the withdrawable bucket plainly", () => {
    expect(bucketLabel("WITHDRAWABLE")).toBe("Withdrawable");
  });
});

describe("activeFilterCount", () => {
  it("counts nothing when no filters are set", () => {
    expect(activeFilterCount({})).toBe(0);
  });

  it("counts each filter that narrows the view", () => {
    expect(activeFilterCount({ direction: "DEBIT", entry_type: "WITHDRAWAL" })).toBe(2);
  });

  it("ignores page, which is navigation rather than a filter", () => {
    // Otherwise the Clear button appears on page 2 of an unfiltered list.
    expect(activeFilterCount({ page: 3 })).toBe(0);
    expect(activeFilterCount({ page: 3, direction: "DEBIT" })).toBe(1);
  });

  it("ignores empty and whitespace-only values", () => {
    expect(activeFilterCount({ search: "", user: "   ", direction: "CREDIT" })).toBe(1);
  });

  it("ignores undefined and null", () => {
    expect(activeFilterCount({ search: undefined, user: null })).toBe(0);
  });
});
