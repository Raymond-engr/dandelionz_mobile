import { personalizedFeed } from "./recommendations";

describe("personalizedFeed", () => {
  it("asks for the personalised feed when signed in", () => {
    expect(personalizedFeed(true)).toEqual({
      type: "for-you",
      title: "Recommended for you",
    });
  });

  it("falls back to trending when signed out", () => {
    expect(personalizedFeed(false)).toEqual({
      type: "trending",
      title: "Trending now",
    });
  });

  it("never labels the signed-out feed as personalised", () => {
    expect(personalizedFeed(false).title).not.toMatch(/for you/i);
  });
});
