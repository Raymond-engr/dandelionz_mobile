import { Button } from "@/components/ui/button";
import {
  useAddToCartMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFocused = useIsFocused();

  const {
    data: wishlistItems = [],
    isLoading,
    refetch,
  } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const redirected = React.useRef(false);

  useEffect(() => {
    if (isFocused) redirected.current = false;
    if (!isAuthenticated && isFocused && !redirected.current) {
      redirected.current = true;
      AsyncStorage.setItem("redirect_after_login", "/(tabs)/wishlist");
      router.replace("/(tabs)");
      router.push("/(auth)/login");
    }
  }, [isAuthenticated, isFocused, router]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  /**
   * Handles adding to cart — or navigating to product detail for variant selection.
   * Matches web app ProductCard behaviour exactly.
   */
  const handleAddToCart = async (product: any) => {
    // If the product has variants, redirect to product page ("Select Options")
    const hasVariants =
      product.variants &&
      (Array.isArray(product.variants)
        ? product.variants.length > 0
        : Object.keys(product.variants).length > 0);

    if (hasVariants) {
      router.push(`/product/${product.slug}` as any);
      return;
    }

    try {
      await addToCart({
        slug: product.slug,
        quantity: 1,
        selected_variants: {},
      }).unwrap();
      Toast.show({ type: "success", text1: "Added to cart" });
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: err?.data?.error || "Failed to add to cart" 
      });
    }
  };

  const handleRemove = async (slug: string) => {
    try {
      await removeFromWishlist(slug).unwrap();
      Toast.show({ type: "success", text1: "Removed from wishlist" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to remove from wishlist" });
    }
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4 mb-2">
        Your wishlist is empty
      </Text>
      <Text className="text-[14px] text-[#6B7280] text-center mb-8">
        Save products you love to your wishlist
      </Text>
      <Button onPress={() => router.push("/(tabs)")} className="px-8">
        Browse Products
      </Button>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-[21px] py-4 border-b border-gray-100 items-center">
        <Text className="text-[24px] font-bold text-system-blue-dark">
          Wishlist
        </Text>
      </View>

      <FlatList
        data={wishlistItems as any[]}
        keyExtractor={(item: any) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{
          paddingVertical: 16,
          gap: 12,
          paddingBottom: 100,
        }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }: { item: any }) => {
          const product = item.product_details ?? {};
          const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0].image_url : null);
          const price = parseFloat(product.price ?? "0");
          const discount = product.discount ?? 0;
          const displayPrice =
            discount > 0 ? price * (1 - discount / 100) : price;

          const hasVariants =
            product.variants &&
            (Array.isArray(product.variants)
              ? product.variants.length > 0
              : Object.keys(product.variants).length > 0);

          return (
            <Pressable
              onPress={() => router.push(`/product/${product.slug}` as any)}
              className="flex-1 bg-white rounded-xl overflow-hidden border border-[#F3F4F6]"
            >
              {/* Image */}
              <View className="relative aspect-square bg-[#F3F4F6]">
                {productImage ? (
                  <Image
                    source={{ uri: productImage }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}

                {/* Remove from wishlist button */}
                <TouchableOpacity
                  onPress={() => handleRemove(product.slug)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm"
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="heart" size={18} color="#FF4D4D" />
                </TouchableOpacity>

                {/* Discount badge */}
                {discount > 0 && (
                  <View className="absolute top-2 left-2 bg-system-red px-2 py-0.5 rounded-md">
                    <Text className="text-white text-[10px] font-bold">
                      -{discount}%
                    </Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View className="p-3 gap-1">
                <Text
                  className="text-[13px] font-medium text-system-blue-dark"
                  numberOfLines={2}
                >
                  {product.name}
                </Text>

                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-bold text-system-blue-light">
                    ₦{displayPrice.toLocaleString()}
                  </Text>
                  {discount > 0 && (
                    <Text className="text-[11px] text-gray-400 line-through">
                      ₦{price.toLocaleString()}
                    </Text>
                  )}
                </View>

                {/* Add to Cart / Select Options button */}
                <TouchableOpacity
                  onPress={() => handleAddToCart(product)}
                  disabled={isAddingToCart}
                  className="bg-[#F5F7FA] py-2 rounded-lg items-center mt-1 active:opacity-70"
                >
                  <Text className="text-[12px] font-semibold text-system-blue-light">
                    {hasVariants ? "Select Options" : "Add to Cart"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
