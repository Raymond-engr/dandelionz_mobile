import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterModal } from "@/components/filter-modal";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ProductGrid } from "@/components/product-grid";
import { SearchBar } from "@/components/search-bar";
import { Colors } from "@/constants/theme";
import { useGetProductsQuery } from "@/lib/api/publicApi";

interface Filters {
  min_price?: number;
  max_price?: number;
  ordering?: string;
}

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const displayName = name
    ? name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Category";

  const { data, isLoading } = useGetProductsQuery({
    category__name: name ?? "",
    search: search || undefined,
    ...filters,
  });

  const products = data?.results ?? data?.data ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backBtn}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchRow}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={`Search in ${displayName}`}
            showFilter
            onFilterPress={() => setFilterOpen(true)}
          />
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Text style={styles.resultCount}>
              {products.length} product{products.length !== 1 ? "s" : ""}
            </Text>
            <ProductGrid products={products} />
          </>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { fontSize: 24, color: Colors.primary, width: 32 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 },
  searchRow: { marginBottom: 16 },
  resultCount: { fontSize: 13, color: "#9CA3AF", marginBottom: 12 },
});
