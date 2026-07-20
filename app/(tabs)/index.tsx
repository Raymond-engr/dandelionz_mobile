import { CategorySlider } from "@/components/category-slider";
import { FilterModal } from "@/components/filter-modal";
import { HeroSlider } from "@/components/hero-slider";
import { ProductGrid } from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { RecommendationRow } from "@/components/recommendation-row";
import { SearchBar } from "@/components/search-bar";
import { useGetProductsQuery } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { personalizedFeed } from "@/lib/recommendations";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Filters {
  min_price?: number;
  max_price?: number;
  price?: number;
  ordering?: string;
  category?: string;
}

export default function ShopScreen() {
  "use no memo";
  console.log("[Shop] Rendering ShopScreen");
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const feed = personalizedFeed(isAuthenticated);

  const { data, isLoading, refetch } = useGetProductsQuery(filters);

  const products = data?.data ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        <View className="px-4 mb-6 pt-4">
          {/* Tapping opens the dedicated search screen; this bar never filters
              the shop grid in place. */}
          <SearchBar
            value=""
            onChange={() => {}}
            onPress={() => router.push("/search")}
            showFilter
            onFilterPress={() => setFilterOpen(true)}
          />
        </View>

        <HeroSlider />
        <CategorySlider />

        {/* Signed-in users get their own feed; everyone else gets trending
            under an honest heading. Renders nothing when the feed is empty. */}
        <RecommendationRow title={feed.title} type={feed.type} />

        <View className="px-4 mb-4">
          <Text className="text-[20px] font-bold text-system-blue-dark">
            New Arrivals
          </Text>
        </View>

        {isLoading && !refreshing ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductGrid products={products} />
        )}
      </ScrollView>

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </View>
  );
}
