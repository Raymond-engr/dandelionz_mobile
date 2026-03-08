import { CategorySlider } from "@/components/category-slider";
import { FilterModal } from "@/components/filter-modal";
import { HeroSlider } from "@/components/hero-slider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ProductGrid } from "@/components/product-grid";
import { SearchBar } from "@/components/search-bar";
import { useGetProductsQuery } from "@/lib/api/publicApi";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Filters {
  min_price?: number;
  max_price?: number;
  price?: number;
  ordering?: string;
  category?: string;
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetProductsQuery({
    search: search || undefined,
    ...filters,
  });

  const products = data?.results ?? data?.data ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchRow}>
          <SearchBar
            value={search}
            onChange={setSearch}
            showFilter
            onFilterPress={() => setFilterOpen(true)}
          />
        </View>

        <HeroSlider />
        <CategorySlider />

        {isLoading ? <LoadingSpinner /> : <ProductGrid products={products} />}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 },
  searchRow: { marginBottom: 20 },
});
