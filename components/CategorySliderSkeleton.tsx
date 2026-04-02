import React from "react";
import { ScrollView, View } from "react-native";
import { Skeleton } from "./ui/skeleton";

export function CategorySliderSkeleton() {
  return (
    <View className="mb-6">
      <View className="px-4 mb-4">
        <Skeleton className="h-6 w-32" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} className="mr-3 w-28 h-32 rounded-[12px] border border-gray-100 overflow-hidden bg-white shadow-sm">
            <Skeleton className="h-[70%] w-full rounded-none" />
            <View className="h-[30%] bg-gray-50 items-center justify-center p-2">
              <Skeleton className="h-2.5 w-3/4" />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
