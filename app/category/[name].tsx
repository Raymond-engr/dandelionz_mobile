import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  selectStandardEnvelope,
  useInfiniteList,
} from "@/hooks/use-infinite-list";
import {
  Product,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name: slug } = useLocalSearchParams<{ name: string }>();

  // Look up the real category name by slug instead of reformatting the slug
  // itself - a naive replace loses characters like "&" that don't survive
  // slugification, showing the raw encoded slug on screen instead.
  const { data: categories = [] } = useGetCategoriesQuery();
  const matchedCategory = (categories as any[]).find((c) => c.slug === slug);
  const displayName =
    matchedCategory?.name ??
    (slug
      ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Category");

  const {
    items: products,
    isInitialLoading,
    isFetchingMore,
    loadMore,
  } = useInfiniteList(
    useGetProductsQuery,
    { category: slug ?? "" },
    selectStandardEnvelope,
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
          {displayName}
        </Text>
        <View className="w-10" />
      </View>

      <Divider />

      {isInitialLoading ? (
        <View style={{ paddingTop: 20 }}>
          <ProductGridSkeleton count={6} />
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item: Product) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 21,
            gap: 12,
          }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
            paddingTop: 20,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: "48%" }}>
              <ProductCard product={item} />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 16 }}
                color={Colors.primary}
              />
            ) : null
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center p-20">
          <MaterialIcons name="inventory" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-4">
            No products found in this category.
          </Text>
        </View>
      )}
    </View>
  );
}
