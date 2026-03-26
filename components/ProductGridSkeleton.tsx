import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "./skeleton";

function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton style={styles.image} borderRadius={8} />
      <Skeleton style={styles.title} />
      <Skeleton style={styles.price} />
      <Skeleton style={styles.badge} />
    </View>
  );
}

interface ProductGridSkeletonProps {
  columns?: number;
  count?: number;
}

export function ProductGridSkeleton({
  columns = 2,
  count = 6,
}: ProductGridSkeletonProps) {
  return (
    <View style={[styles.grid, columns === 1 && styles.gridSingle]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.col, columns === 1 && styles.colFull]}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  gridSingle: { flexDirection: "column" },
  col: { width: "47%" },
  colFull: { width: "100%" },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  image: { width: "100%", height: 140 },
  title: { height: 14, width: "80%" },
  price: { height: 18, width: "50%" },
  badge: { height: 22, width: 60, borderRadius: 50 },
});
