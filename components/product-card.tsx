import { Colors } from "@/constants/theme";
import {
    Product,
    useAddToCartMutation,
    useAddToWishlistMutation,
    useGetCartQuery,
    useGetWishlistQuery,
    useRemoveFromCartMutation,
    useRemoveFromWishlistMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  product: Product;
  hideAddToCart?: boolean;
}

export function ProductCard({ product, hideAddToCart = false }: Props) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: wishlistResponse } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToCart, { isLoading: addingCart }] = useAddToCartMutation();
  const [removeFromCart, { isLoading: removingCart }] =
    useRemoveFromCartMutation();
  const [addToWishlist, { isLoading: addingWish }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removingWish }] =
    useRemoveFromWishlistMutation();

  const cartItems = cartResponse?.data?.items || [];
  const wishlistItems = wishlistResponse || [];
  const isInCart = cartItems.some(
    (i: any) => i.product_details?.slug === product.slug,
  );
  const isInWishlist = wishlistItems.some(
    (i: any) => i.product_details?.slug === product.slug,
  );
  const discount = product.discount ?? 0;
  const price = parseFloat(product.price || "0");
  const displayPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (!product.slug) return;
    try {
      if (isInWishlist) await removeFromWishlist(product.slug).unwrap();
      else await addToWishlist({ slug: product.slug }).unwrap();
    } catch {}
  };

  const handleCart = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (!product.slug) return;
    try {
      if (isInCart) await removeFromCart(product.slug).unwrap();
      else await addToCart({ slug: product.slug, quantity: 1 }).unwrap();
    } catch {}
  };

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.slug || product.id}`)}
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>No Image</Text>
          </View>
        )}
        <Pressable
          onPress={handleWishlist}
          style={styles.wishBtn}
          disabled={addingWish || removingWish}
        >
          <Svg
            width={16}
            height={16}
            viewBox="0 0 23 22"
            fill={isInWishlist ? "#EF4444" : "none"}
          >
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isInWishlist ? 0 : 1.5}
              stroke={isInWishlist ? "#EF4444" : "#4B5563"}
              fill={isInWishlist ? "#EF4444" : "none"}
              d="M11.5 22L10.1639 20.7291C8.15723 18.803 6.4978 17.1479 5.18559 15.7638C3.87338 14.3794 2.83354 13.1474 2.06607 12.0677C1.29859 10.9882 0.76243 10.0034 0.457579 9.11322C0.152526 8.22328 0 7.3202 0 6.40401C0 4.58633 0.579237 3.06453 1.73771 1.83859C2.89639 0.612863 4.33469 0 6.05263 0C7.10942 0 8.1081 0.261497 9.04868 0.784491C9.98926 1.30748 10.8064 2.0575 11.5 3.03454C12.1936 2.0575 13.0107 1.30748 13.9513 0.784491C14.8919 0.261497 15.8906 0 16.9474 0C18.6653 0 20.1036 0.612863 21.2623 1.83859C22.4208 3.06453 23 4.58633 23 6.40401C23 7.3202 22.8475 8.22328 22.5424 9.11322C22.2376 10.0034 21.7014 10.9882 20.9339 12.0677C20.1665 13.1474 19.1285 14.3794 17.8202 15.7638C16.512 17.1479 14.8506 18.803 12.8361 20.7291L11.5 22Z"
            />
          </Svg>
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>
              ₦
              {displayPrice.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </Text>
            {discount > 0 && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text style={styles.originalPrice}>
                  ₦{price.toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discount}%</Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.ratingWrap}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{product.rating ?? "0.0"}</Text>
          </View>
        </View>

        {!hideAddToCart && (
          <Pressable
            onPress={handleCart}
            disabled={addingCart || removingCart}
            style={[styles.cartBtn, isInCart && styles.cartBtnActive]}
          >
            <Text
              style={[styles.cartBtnText, isInCart && styles.cartBtnTextActive]}
            >
              {addingCart
                ? "Adding..."
                : removingCart
                  ? "Removing..."
                  : isInCart
                    ? "Remove from Cart"
                    : "Add to Cart"}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imageWrap: {
    position: "relative",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  wishBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: "500", color: "#111827", marginBottom: 4 },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 4,
  },
  price: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  originalPrice: {
    fontSize: 11,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { fontSize: 10, fontWeight: "700", color: "#DC2626" },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingStar: { color: "#FBBF24", fontSize: 12 },
  ratingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 2,
  },
  cartBtn: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cartBtnActive: { backgroundColor: "#FEF2F2" },
  cartBtnText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
  cartBtnTextActive: { color: "#DC2626" },
});
