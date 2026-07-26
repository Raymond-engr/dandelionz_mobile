import {
  classifyReference,
  isDeliveryReference,
  isDepositReference,
} from "./payments";

describe("classifyReference", () => {
  it("classifies a DEP- reference as a deposit", () => {
    expect(classifyReference("DEP-abc123")).toBe("deposit");
  });

  it("classifies a DEP- reference as a deposit even when a plan id is present", () => {
    // A top-up is never part of an installment plan; the prefix wins so a stale
    // plan_id left on the route cannot send a deposit to the wrong endpoint.
    expect(classifyReference("DEP-abc123", "42")).toBe("deposit");
  });

  it("classifies a DLV- reference as a delivery payment", () => {
    expect(classifyReference("DLV-abc123")).toBe("delivery");
  });

  it("classifies a DLV- reference as a delivery payment even when a plan id is present", () => {
    // A delivery fee is never part of an installment plan; the prefix wins so a
    // stale plan_id on the route cannot send it to the installment endpoint.
    expect(classifyReference("DLV-abc123", "42")).toBe("delivery");
  });

  it("classifies a non-deposit reference with a plan id as an installment", () => {
    expect(classifyReference("PAY-abc123", "42")).toBe("installment");
  });

  it("classifies a non-deposit reference without a plan id as an order", () => {
    expect(classifyReference("PAY-abc123")).toBe("order");
  });

  it("treats an empty plan id as no plan id", () => {
    expect(classifyReference("PAY-abc123", "")).toBe("order");
    expect(classifyReference("PAY-abc123", null)).toBe("order");
  });

  it("falls back to order for a missing reference with no plan id", () => {
    expect(classifyReference(null)).toBe("order");
    expect(classifyReference(undefined)).toBe("order");
    expect(classifyReference("")).toBe("order");
  });

  it("still routes a missing reference with a plan id to installment", () => {
    expect(classifyReference(null, "42")).toBe("installment");
  });

  it("does not mistake a reference that merely contains DEP- for a deposit", () => {
    expect(classifyReference("ORDER-DEP-1")).toBe("order");
  });

  it("does not mistake a reference that merely contains DLV- for a delivery payment", () => {
    expect(classifyReference("ORDER-DLV-1")).toBe("order");
  });
});

describe("isDepositReference", () => {
  it("matches the backend prefix", () => {
    expect(isDepositReference("DEP-xyz")).toBe(true);
  });

  it("is case-insensitive and tolerates surrounding whitespace", () => {
    expect(isDepositReference("dep-xyz")).toBe(true);
    expect(isDepositReference("  DEP-xyz  ")).toBe(true);
  });

  it("rejects other prefixes and empty values", () => {
    expect(isDepositReference("PAY-xyz")).toBe(false);
    expect(isDepositReference("")).toBe(false);
    expect(isDepositReference(null)).toBe(false);
    expect(isDepositReference(undefined)).toBe(false);
  });
});

describe("isDeliveryReference", () => {
  it("matches the backend prefix", () => {
    expect(isDeliveryReference("DLV-xyz")).toBe(true);
  });

  it("is case-insensitive and tolerates surrounding whitespace", () => {
    expect(isDeliveryReference("dlv-xyz")).toBe(true);
    expect(isDeliveryReference("  DLV-xyz  ")).toBe(true);
  });

  it("rejects other prefixes and empty values", () => {
    expect(isDeliveryReference("DEP-xyz")).toBe(false);
    expect(isDeliveryReference("PAY-xyz")).toBe(false);
    expect(isDeliveryReference("")).toBe(false);
    expect(isDeliveryReference(null)).toBe(false);
    expect(isDeliveryReference(undefined)).toBe(false);
  });
});
