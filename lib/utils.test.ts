import { apiError } from "./utils";

describe("apiError", () => {
  it("returns a friendly message for FETCH_ERROR instead of leaking the raw TypeError", () => {
    expect(
      apiError({
        status: "FETCH_ERROR",
        error: "TypeError: Network request failed",
      }),
    ).toBe("Network error. Check your connection and try again.");
  });

  it("returns a friendly message for TIMEOUT_ERROR", () => {
    expect(apiError({ status: "TIMEOUT_ERROR" })).toBe(
      "The request timed out. Please try again.",
    );
  });

  it("flattens a field-error dict into a prefixed, readable string", () => {
    expect(
      apiError({
        status: 400,
        data: { error: { name: ["category with this name already exists."] } },
      }),
    ).toBe("Name: category with this name already exists.");
  });

  it("skips the field-name prefix for non_field_errors", () => {
    expect(
      apiError({
        status: 400,
        data: { error: { non_field_errors: ["Something went wrong overall."] } },
      }),
    ).toBe("Something went wrong overall.");
  });

  it("joins multiple messages for a single field with a space", () => {
    expect(
      apiError({
        status: 400,
        data: { error: { name: ["This field is required.", "Too short."] } },
      }),
    ).toBe("Name: This field is required. Too short.");
  });

  it("never throws and always returns a string when called with undefined", () => {
    let result: string | undefined;
    expect(() => {
      result = apiError(undefined);
    }).not.toThrow();
    expect(typeof result).toBe("string");
    expect(result).toBe("Something went wrong");
  });

  it("returns a friendly message for a 413 payload-too-large status", () => {
    expect(apiError({ status: 413 })).toBe(
      "Your images are too large. Try fewer or smaller photos.",
    );
  });

  it("prioritizes err.data.error over err.data.message when both are present", () => {
    expect(
      apiError({
        data: { error: "from error field", message: "from message field" },
      }),
    ).toBe("from error field");
  });

  it("returns the custom fallback when nothing else matches", () => {
    expect(apiError({}, "Custom fallback")).toBe("Custom fallback");
  });
});
