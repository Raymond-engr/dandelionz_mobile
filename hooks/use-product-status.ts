import { publicApi } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";

/**
 * Whether `slug` is in the signed-in customer's cart.
 *
 * Uses RTK Query's `selectFromResult` so the calling component only re-renders
 * when *this product's* isInCart/cartItem actually changes - not on every
 * cart mutation anywhere in the app. Previously every ProductCard called
 * useGetCartQuery directly and re-scanned the full items array on every
 * render; that cost was always there but stayed invisible with one grid on
 * screen. Once recommendation rows started mounting several ProductCards per
 * screen at once, every add/remove-from-cart started re-rendering and
 * re-scanning all of them.
 */
export function useCartStatus(slug: string | undefined) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return publicApi.endpoints.getCart.useQuery(undefined, {
    skip: !isAuthenticated,
    selectFromResult: ({ data }) => {
      const items = data?.data?.items ?? [];
      const cartItem = items.find((i) => i.product_details?.slug === slug);
      return { isInCart: !!cartItem, cartItem };
    },
  });
}

export function useWishlistStatus(slug: string | undefined) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return publicApi.endpoints.getWishlist.useQuery(undefined, {
    skip: !isAuthenticated,
    selectFromResult: ({ data }) => ({
      isInWishlist: (data ?? []).some(
        (i: any) => i.product_details?.slug === slug,
      ),
    }),
  });
}
