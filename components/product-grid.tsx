import { Product } from "@/lib/api/publicApi";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: "#9CA3AF" },
});
