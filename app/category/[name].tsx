import { Divider } from "@/components/ui/divider";
import { ProductGrid } from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Colors } from "@/constants/theme";
import { useGetProductsQuery } from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();

  const displayName = name
    ? name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Category";

  const { data, isLoading } = useGetProductsQuery({
    category: name ?? "",
  });

  const products = data?.data ?? [];

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
          {displayName}
        </Text>
        <View className="w-10" />
      </View>

      <Divider />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ProductGridSkeleton count={6} />
        ) : products.length > 0 ? (
          <View className="px-[21px]">
             <ProductGrid products={products} />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center p-20">
            <MaterialIcons name="inventory" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4">
              No products found in this category.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
