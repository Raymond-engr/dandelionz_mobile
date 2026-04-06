import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useGetWishlistQuery } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const {
    data: wishlistItems = [],
    isLoading,
    refetch,
  } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });

  // Inline auth check — consistent with account.tsx and cart.tsx
  if (!isAuthenticated) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-8 gap-4"
        style={{ paddingTop: insets.top }}
      >
        <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
        <Text className="text-[20px] font-bold text-system-blue-dark text-center">
          Sign in to view your wishlist
        </Text>
        <Text className="text-[14px] text-[#6B7280] text-center mb-4">
          Save your favourite products here
        </Text>
        <Button onPress={() => router.push("/(auth)/login")}>Login</Button>
        <Button
          variant="outline"
          onPress={() => router.push("/(auth)/register")}
        >
          Create Account
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

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
          const product = {
            ...item.product_details,
            id: item.product,
            slug: item.product_details?.slug,
            image:
              item.product_details?.image ||
              item.product_details?.images?.[0]?.image_url,
          };

          return (
            <View className="flex-1">
              <ProductCard product={product as any} />
            </View>
          );
        }}
      />
    </View>
  );
}
