import {
  ProductImage,
  useAddProductReviewMutation,
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetCartQuery,
  useGetProductBySlugQuery,
  useGetProductReviewsQuery,
  useGetWishlistQuery,
  useRemoveFromCartMutation,
  useRemoveFromWishlistMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Product detail screen.
 *
 * Matches web app behaviour:
 *  ✓ Page is FULLY VISIBLE without authentication
 *  ✓ "Add to Cart" / wishlist redirect to login if not authenticated
 *  ✓ Review form shown only when authenticated (otherwise "Sign In" prompt)
 *  ✓ Variant selection works the same way as web
 *  ✓ Discount price display matches web
 */
export default function ProductDetailScreen() {
  // React Compiler incorrectly memoizes this component due to the
  // many hooks and conditional early returns, causing a blank render.
  // "use no memo" opts it out entirely.
  "use no memo";
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  // ─── Product data (no auth required) ────────────────────────────────────────
  const {
    data: response,
    isLoading,
    isError,
    refetch: refetchProduct,
  } = useGetProductBySlugQuery(slug, { skip: !slug });
  const product = response?.data;

  // Parse variants into { category → Set<value> }
  const variantOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    if (Array.isArray(product?.variants)) {
      product.variants.forEach((variantObj: any) => {
        Object.entries(variantObj).forEach(([key, value]) => {
          if (!options[key]) options[key] = new Set();
          options[key].add(value as string);
        });
      });
    }
    return options;
  }, [product?.variants]);

  // ─── Reviews (no auth required to read) ─────────────────────────────────────
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useGetProductReviewsQuery(slug, { skip: !slug });
  const [addProductReview, { isLoading: isSubmittingReview }] =
    useAddProductReviewMutation();

  // ─── Wishlist / Cart (auth-gated, skip when not logged in) ──────────────────
  const { data: wishlistItems = [] } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const cartItems = cartResponse?.data?.items || [];

  const isInWishlist = product
    ? wishlistItems.some(
        (item: any) => item.product_details?.slug === product.slug,
      )
    : false;

  const isInCart = product
    ? cartItems.some((item: any) => {
        if (item.product_details?.slug !== product.slug) return false;
        if (Object.keys(variantOptions).length > 0) {
          return (
            JSON.stringify(item.selected_variants) ===
            JSON.stringify(selectedVariants)
          );
        }
        return true;
      })
    : false;

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [removeFromCart, { isLoading: isRemovingFromCart }] =
    useRemoveFromCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation();

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleVariantSelect = (category: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [category]: value }));
  };

  const handleToggleCart = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (!product?.slug) return;

    if (Object.keys(variantOptions).length > 0) {
      const missing = Object.keys(variantOptions).filter(
        (v) => !selectedVariants[v],
      );
      if (missing.length > 0) {
        Toast.show({
          type: "error",
          text1: "Selection Required",
          text2: `Please select ${missing.join(", ")}`,
        });
        return;
      }
    }

    try {
      if (isInCart) {
        await removeFromCart({
          slug: product.slug,
          selected_variants: selectedVariants,
        }).unwrap();
        Toast.show({ type: "success", text1: "Removed from cart" });
      } else {
        await addToCart({
          slug: product.slug,
          quantity,
          selected_variants: selectedVariants,
        }).unwrap();
        Toast.show({ type: "success", text1: "Added to cart" });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.data?.error || "Failed to update cart",
      });
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (!product?.slug) return;
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.slug).unwrap();
        Toast.show({ type: "success", text1: "Removed from wishlist" });
      } else {
        await addToWishlist({ slug: product.slug }).unwrap();
        Toast.show({ type: "success", text1: "Added to wishlist" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to update wishlist" });
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (userRating === 0) {
      Toast.show({ type: "error", text1: "Please select a rating" });
      return;
    }
    if (!userComment.trim()) {
      Toast.show({ type: "error", text1: "Please enter a comment" });
      return;
    }
    try {
      await addProductReview({
        slug,
        rating: userRating,
        comment: userComment,
      }).unwrap();
      Toast.show({ type: "success", text1: "Review submitted successfully" });
      setUserRating(0);
      setUserComment("");
      refetchProduct();
      refetchReviews();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.data?.message || "Failed to submit review",
      });
    }
  };

  // ─── Loading / Error states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#030482" />
      </SafeAreaView>
    );
  }

  if (!product && !isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center p-6"
        edges={["top"]}
      >
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          Product Not Found
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          We couldn&apos;t find the product you&apos;re looking for.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          className="bg-system-blue-light px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!product) return null;

  // ─── Image list ──────────────────────────────────────────────────────────────
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img: ProductImage) => img.image_url)
      : [product.image || ""];

  const discount = product.discount ?? 0;
  const price = parseFloat(product.price || "0");
  const displayPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Product Description
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Images ─────────────────────────────────────────────────────────── */}
        <View className="p-4">
          <View className="w-full aspect-square bg-gray-50 rounded-[20px] overflow-hidden mb-4">
            <Image
              source={
                images[selectedImage]
                  ? { uri: images[selectedImage] }
                  : undefined
              }
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              placeholder={require("@/assets/images/icon.png")}
            />
          </View>
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {images.map((img: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedImage(idx)}
                  className={`w-20 h-20 bg-gray-50 rounded-[12px] overflow-hidden border-2 ${
                    selectedImage === idx
                      ? "border-system-blue-light"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    source={img ? { uri: img } : undefined}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Info ───────────────────────────────────────────────────────────── */}
        <View className="px-4">
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            {product.name}
          </Text>

          {/* Variants */}
          {Object.keys(variantOptions).length > 0 && (
            <View className="mb-6 gap-4">
              {Object.entries(variantOptions).map(([category, valueSet]) => (
                <View key={category}>
                  <Text className="text-base font-semibold text-gray-900 mb-2 capitalize">
                    Select {category}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {Array.from(valueSet).map((value) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => handleVariantSelect(category, value)}
                        className={`px-4 py-2 border rounded-[8px] ${
                          selectedVariants[category] === value
                            ? "border-system-blue-light bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            selectedVariants[category] === value
                              ? "text-system-blue-light font-semibold"
                              : "text-gray-600"
                          }`}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <Text className="text-base text-gray-500 leading-6 mb-4">
            {product.description}
          </Text>
          {product.store_name && (
            <Text className="text-base font-medium text-system-blue-light mb-4">
              Store: {product.store_name}
            </Text>
          )}

          {/* Price + Rating row — matches web layout */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xs text-gray-400 mb-1">Amount</Text>
              <Text className="text-[28px] font-bold text-system-blue-light">
                ₦
                {displayPrice.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </Text>
              {discount > 0 && (
                <View className="flex-row items-center gap-2 mt-1">
                  <Text className="text-sm text-gray-400 line-through">
                    ₦{price.toLocaleString()}
                  </Text>
                  <View className="bg-red-50 px-2 py-0.5 rounded">
                    <Text className="text-[10px] font-bold text-red-600">
                      -{discount}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View className="flex-row items-center bg-yellow-50 px-3 py-1 rounded-full">
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text className="text-sm font-semibold text-gray-900 ml-1">
                {product.rating || "0.0"}
              </Text>
            </View>
          </View>

          {/* Action buttons — wishlist + cart */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={handleToggleWishlist}
              disabled={isAddingToWishlist || isRemovingFromWishlist}
              className={`w-12 h-12 border rounded-[12px] items-center justify-center ${
                isInWishlist ? "border-red-100 bg-red-50" : "border-gray-200"
              }`}
            >
              <Ionicons
                name={isInWishlist ? "heart" : "heart-outline"}
                size={24}
                color={isInWishlist ? "#ef4444" : "#666"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleCart}
              disabled={
                isAddingToCart || isRemovingFromCart || !product.in_stock
              }
              className={`flex-1 h-12 rounded-[12px] flex-row items-center justify-center gap-2 ${
                isInCart ? "bg-red-50" : "bg-system-blue-light"
              } ${!product.in_stock ? "opacity-50" : ""}`}
            >
              <Ionicons
                name="cart-outline"
                size={20}
                color={isInCart ? "#ef4444" : "#fff"}
              />
              <Text
                className={`font-semibold ${
                  isInCart ? "text-red-500" : "text-white"
                }`}
              >
                {isAddingToCart
                  ? "Adding..."
                  : isRemovingFromCart
                    ? "Removing..."
                    : isInCart
                      ? "Remove from Cart"
                      : product.in_stock
                        ? "Add to Cart"
                        : "Out of Stock"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Reviews ──────────────────────────────────────────────────────── */}
          <View className="border-t border-gray-100 pt-6">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Reviews ({reviews?.length || 0})
            </Text>

            {/* Write a review — authenticated only (same as web) */}
            {isAuthenticated ? (
              <View className="bg-gray-50 p-4 rounded-[12px] mb-6">
                <Text className="font-medium mb-3 text-gray-900">
                  Write a Review
                </Text>
                <View className="flex-row gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setUserRating(s)}>
                      <Ionicons
                        name={s <= userRating ? "star" : "star-outline"}
                        size={24}
                        color={s <= userRating ? "#fbbf24" : "#d1d5db"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  multiline
                  numberOfLines={3}
                  placeholder="Share your thoughts about this product..."
                  className="bg-white border border-gray-200 rounded-[8px] p-3 mb-3 text-gray-900"
                  value={userComment}
                  onChangeText={setUserComment}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="bg-system-blue-light py-2 px-4 rounded-[8px] self-start"
                >
                  <Text className="text-white font-medium">
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Unauthenticated prompt — matches web app */
              <View className="bg-gray-50 p-4 rounded-[12px] mb-6 items-center">
                <Text className="text-gray-500 mb-2 text-sm">
                  Please sign in to write a review.
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text className="text-system-blue-light font-semibold text-sm">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Review list — visible to everyone */}
            {isLoadingReviews ? (
              <ActivityIndicator color="#030482" />
            ) : reviews && reviews.length > 0 ? (
              <View className="gap-4">
                {reviews.map((r: any) => (
                  <View key={r.id} className="border-b border-gray-100 pb-4">
                    <View className="flex-row justify-between mb-1">
                      <Text className="font-medium text-gray-900">
                        {r.customer_name || "Anonymous"}
                      </Text>
                      <Text className="text-[10px] text-gray-400">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : ""}
                      </Text>
                    </View>
                    <View className="flex-row mb-2 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name="star"
                          size={12}
                          color={s <= r.rating ? "#fbbf24" : "#d1d5db"}
                        />
                      ))}
                    </View>
                    <Text className="text-gray-600 text-sm">{r.comment}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 italic text-sm">
                No reviews yet. Be the first to review!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
