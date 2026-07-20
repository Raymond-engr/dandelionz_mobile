import type { RecommendationType } from "./api/publicApi";

export type PersonalizedFeed = {
  type: RecommendationType;
  title: string;
};

/**
 * Which recommendation feed a viewer gets on the shop tab.
 *
 * Signed-out visitors have no interaction history, so `for-you` would either
 * 401 or return the trending list under a personalised heading. Asking for
 * trending explicitly — and labelling it honestly — avoids promising
 * personalisation we can't deliver.
 */
export function personalizedFeed(isAuthenticated: boolean): PersonalizedFeed {
  return isAuthenticated
    ? { type: "for-you", title: "Recommended for you" }
    : { type: "trending", title: "Trending now" };
}
