import React from "react";
import { View } from "react-native";
import { Skeleton } from "./ui/skeleton";

function ProductCardSkeleton() {
  return (
    <View className="bg-[#F9FAFB] rounded-[12px] p-3 gap-2">
      <Skeleton className="w-full h-[140px] rounded-[8px]" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-6 w-[60px] rounded-full" />
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
    <View className={`flex-row flex-wrap px-4 gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className={columns === 1 ? "w-full" : "w-[47%]"}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
}
