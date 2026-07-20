import type { RecommendationType } from "./api/publicApi";

/**
 * How many products a recommendation row asks for.
 *
 * Eight fills the grid without a ragged trailing row, and matches the limit the
 * web app sends so both clients hit the same backend cache slice.
 */
export const RECOMMENDATION_LIMIT = 8;

export type RecommendationSurface = {
  type: RecommendationType;
  title: string;
};

/**
 * Which recommendation row the shop tab shows, and what to call it.
 *
 * Signed-out visitors have no interaction history, so `for-you` would just
 * return the trending list under a personalised heading. Asking for trending
 * explicitly — and labelling it honestly — avoids promising personalisation we
 * can't deliver.
 *
 * Deliberately named to match the web app's lib/recommendations.ts so the two
 * copies are greppable from one another: the titles below are duplicated there
 * by agreement, and changing one means changing both.
 */
export function shopRecommendationSurface(
  isAuthenticated: boolean,
): RecommendationSurface {
  return isAuthenticated
    ? { type: "for-you", title: "Recommended for you" }
    : { type: "trending", title: "Trending now" };
}
