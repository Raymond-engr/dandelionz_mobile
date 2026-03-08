import { Product } from "@/lib/api/publicApi";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ProductCard } from "./product-card";

interface Props {
  products: Product[];
  hideAddToCart?: boolean;
}

export function ProductGrid({ products, hideAddToCart = false }: Props) {
  if (!products || products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No products found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <ProductCard product={item} hideAddToCart={hideAddToCart} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  item: { flex: 1, maxWidth: "48%" },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
