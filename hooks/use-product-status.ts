import { Cart, CartItem, publicApi } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { createSelector } from "@reduxjs/toolkit";

type CartQueryData = { success: boolean; data: Cart } | undefined;
type WishlistQueryData = any[] | undefined;

// createSelector's memoization cache lives on this selector instance, shared
// by every component that calls it. As long as the RTK Query cache entry's
// data reference is unchanged (i.e. the cart hasn't actually changed), all
// subscribers reuse the same cached Map instead of each re-scanning the raw
// items array. The Map is rebuilt once per cart update, not once per mounted
// ProductCard.
const selectCartItemsBySlug = createSelector(
  (data: CartQueryData) => data?.data?.items,
  (items): Map<string, CartItem> => {
    const map = new Map<string, CartItem>();
    (items ?? []).forEach((i) => {
      if (i.product_details?.slug) map.set(i.product_details.slug, i);
    });
    return map;
  },
);

const selectWishlistSlugs = createSelector(
  (data: WishlistQueryData) => data,
  (items): Set<string> => {
    const set = new Set<string>();
    (items ?? []).forEach((i: any) => {
      if (i.product_details?.slug) set.add(i.product_details.slug);
    });
    return set;
  },
);

/**
 * Whether slug is in the signed-in customer's cart, without subscribing the
 * caller to the whole cart list.
 *
 * selectFromResult runs RTK Query's own shallow-equality check on the
 * returned shape, so a component using this hook only re-renders when *its
 * own* isInCart/cartItem actually changes - not on every cart mutation
 * anywhere in the app. Combined with the shared Map above, a cart update now
 * costs one O(n) rebuild total plus O(1) lookups per card, instead of every
 * mounted ProductCard independently re-scanning the full array.
 */
export function useCartStatus(slug: string | undefined) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return publicApi.endpoints.getCart.useQuery(undefined, {
    skip: !isAuthenticated,
    selectFromResult: ({ data }) => {
      const map = selectCartItemsBySlug(data);
      const cartItem = slug ? map.get(slug) : undefined;
      return { isInCart: !!cartItem, cartItem };
    },
  });
}

export function useWishlistStatus(slug: string | undefined) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return publicApi.endpoints.getWishlist.useQuery(undefined, {
    skip: !isAuthenticated,
    selectFromResult: ({ data }) => {
      const set = selectWishlistSlugs(data);
      return { isInWishlist: !!slug && set.has(slug) };
    },
  });
}
