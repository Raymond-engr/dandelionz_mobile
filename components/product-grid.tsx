import { Product } from "@/lib/api/publicApi";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProductCard } from "./product-card";

interface Props {
  products: Product[];
  hideAddToCart?: boolean;
}

// Every call site nests this inside another vertical ScrollView (shop tab,
// search results, search trending, category page), so this was always
// rendered with scrollEnabled={false} - the FlatList that used to live here
// never actually virtualized anything; it eagerly rendered every item while
// still paying FlatList/VirtualizedList's own bookkeeping on top of the
// ScrollView it sat inside. A plain wrapping view does the same layout for
// less overhead.
export function ProductGrid({ products, hideAddToCart = false }: Props) {
  if (!products || products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No products found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {products.map((item) => (
        <View key={item.id} style={styles.item}>
          <ProductCard product={item} hideAddToCart={hideAddToCart} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { width: "48%" },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
