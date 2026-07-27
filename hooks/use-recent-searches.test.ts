import { MAX_RECENT, addTerm, parseStoredRecents } from "./use-recent-searches";

describe("parseStoredRecents", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(parseStoredRecents(null)).toEqual([]);
    expect(parseStoredRecents("")).toEqual([]);
  });

  it("parses a stored string array", () => {
    expect(parseStoredRecents('["sneakers","boots"]')).toEqual([
      "sneakers",
      "boots",
    ]);
  });

  it("degrades to empty rather than throwing on corrupt JSON", () => {
    expect(parseStoredRecents("{not json")).toEqual([]);
  });

  it("ignores a stored value that is not an array", () => {
    expect(parseStoredRecents('{"a":1}')).toEqual([]);
  });

  it("drops non-string entries", () => {
    expect(parseStoredRecents('["sneakers",5,null,"boots"]')).toEqual([
      "sneakers",
      "boots",
    ]);
  });
});

describe("addTerm", () => {
  it("puts the newest term first", () => {
    expect(addTerm(["boots"], "sneakers")).toEqual(["sneakers", "boots"]);
  });

  it("trims surrounding whitespace", () => {
    expect(addTerm([], "  sneakers  ")).toEqual(["sneakers"]);
  });

  it("ignores blank terms", () => {
    expect(addTerm(["boots"], "   ")).toEqual(["boots"]);
    expect(addTerm(["boots"], "")).toEqual(["boots"]);
  });

  it("moves an existing term to the front instead of duplicating it", () => {
    expect(addTerm(["boots", "sneakers"], "sneakers")).toEqual([
      "sneakers",
      "boots",
    ]);
  });

  it("dedupes case-insensitively but keeps the newest casing", () => {
    expect(addTerm(["Sneakers"], "sneakers")).toEqual(["sneakers"]);
  });

  it("caps the history length", () => {
    const full = Array.from({ length: MAX_RECENT }, (_, i) => `term-${i}`);

    const result = addTerm(full, "newest");

    expect(result).toHaveLength(MAX_RECENT);
    expect(result[0]).toBe("newest");
    expect(result).not.toContain(`term-${MAX_RECENT - 1}`);
  });
});
