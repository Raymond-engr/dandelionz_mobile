import React from "react";
import { View } from "react-native";
import { Skeleton } from "./ui/skeleton";

export function StatCardSkeleton() {
  return (
    <View className="flex-row flex-wrap justify-between">
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} className="bg-white rounded-[16px] p-4 w-[48%] mb-4 border border-gray-100">
          <View className="flex-row justify-between items-start mb-3">
            <Skeleton className="w-8 h-8 rounded-full" />
          </View>
          <Skeleton className="h-6 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </View>
      ))}
    </View>
  );
}
