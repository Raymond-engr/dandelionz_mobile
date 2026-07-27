import { shopRecommendationSurface } from "./recommendations";

describe("shopRecommendationSurface", () => {
  it("asks for the personalised feed when signed in", () => {
    expect(shopRecommendationSurface(true)).toEqual({
      type: "for-you",
      title: "Recommended for you",
    });
  });

  it("falls back to trending when signed out", () => {
    expect(shopRecommendationSurface(false)).toEqual({
      type: "trending",
      title: "Trending now",
    });
  });

  it("never labels the signed-out feed as personalised", () => {
    expect(shopRecommendationSurface(false).title).not.toMatch(/for you/i);
  });
});
