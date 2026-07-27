import { hasCompletePayoutDetails } from "./customerApi";

const complete = {
  bank_name: "Access Bank",
  bank_code: "044",
  account_number: "0123456789",
  account_name: "Ada Obi",
};

describe("hasCompletePayoutDetails", () => {
  it("returns true when bank name, bank code, account number and account name are all present", () => {
    expect(hasCompletePayoutDetails(complete)).toBe(true);
  });

  it("returns false when only bank_code is missing, because Paystack cannot create a transfer recipient without it", () => {
    expect(hasCompletePayoutDetails({ ...complete, bank_code: "" })).toBe(false);
  });

  it("returns false when bank_name is missing", () => {
    expect(hasCompletePayoutDetails({ ...complete, bank_name: "" })).toBe(false);
  });

  it("returns false when account_number is missing", () => {
    expect(hasCompletePayoutDetails({ ...complete, account_number: "" })).toBe(
      false,
    );
  });

  it("returns false when account_name is missing, since the account has not been verified", () => {
    expect(hasCompletePayoutDetails({ ...complete, account_name: "" })).toBe(
      false,
    );
  });

  it("returns false for an empty settings object", () => {
    expect(hasCompletePayoutDetails({})).toBe(false);
  });

  it("returns false when settings is undefined, so a still-loading query never enables withdrawal", () => {
    expect(hasCompletePayoutDetails(undefined)).toBe(false);
  });

  it("returns false when settings is null", () => {
    expect(hasCompletePayoutDetails(null)).toBe(false);
  });

  it("ignores recipient_code and has_pin, which are not required to build the payout body", () => {
    expect(
      hasCompletePayoutDetails({
        ...complete,
        recipient_code: "",
        has_pin: false,
      }),
    ).toBe(true);
  });

  it("returns a boolean rather than the truthy field value it checked", () => {
    expect(typeof hasCompletePayoutDetails(complete)).toBe("boolean");
  });
});
