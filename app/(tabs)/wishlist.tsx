import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
    useAddToCartMutation,
    useGetWishlistQuery,
    useRemoveFromWishlistMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFocused = useIsFocused();

  const { data: wishlistItems = [], isLoading } = useGetWishlistQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const redirected = React.useRef(false);

  useEffect(() => {
    if (isFocused) {
      redirected.current = false;
    }
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

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <Text className="text-[64px] mb-5 text-system-blue-light">♡</Text>
      <Text className="text-[20px] font-bold text-system-blue-dark mb-2">Your wishlist is empty</Text>
      <Text className="text-[14px] text-[#6B7280] text-center mb-8">
        Save products you love to your wishlist
      </Text>
      <Button onPress={() => router.push("/(tabs)")} className="px-8">
        Browse Products
      </Button>
    </View>
  );

  const handleAddToCart = async (product: any) => {
    if (product.variants && Object.keys(product.variants).length > 0) {
      router.push(`/product/${product.slug}`);
      return;
    }
    try {
      await addToCart({ 
        slug: product.slug, 
        quantity: 1,
        selected_variants: {} 
      }).unwrap();
      Alert.alert("Success", "Added to cart");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.error || "Failed to add to cart");
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <FlatList
        data={wishlistItems as any[]}
        keyExtractor={(item: any) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }: { item: any }) => {
          const product = item.product_details ?? {};
          const price = parseFloat(product.price ?? "0");
          const discount = product.discount ?? 0;
          const displayPrice =
            discount > 0 ? price * (1 - discount / 100) : price;

          return (
            <View className="flex-1 bg-white rounded-xl overflow-hidden border border-[#F3F4F6]">
              <View className="relative aspect-square bg-[#F3F4F6]">
                {product.image ? (
                  <Image
                    source={{ uri: product.image }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-[#9CA3AF] text-[10px]">No Image</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => removeFromWishlist(product.slug).unwrap()}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm"
                >
                  <Text className="text-[16px] text-system-red">♥</Text>
                </Pressable>
              </View>

              <View className="p-3 gap-1">
                <Text className="text-[13px] font-medium text-system-blue-dark" numberOfLines={1}>
                  {product.name}
                </Text>
                <Text className="text-[15px] font-bold text-system-blue-light">
                  ₦{displayPrice.toLocaleString()}
                </Text>
                <Pressable
                  onPress={() => handleAddToCart(product)}
                  className="bg-[#F5F7FA] py-2 rounded-lg items-center mt-1"
                >
                  <Text className="text-[12px] font-semibold text-system-blue-light">Add to Cart</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
