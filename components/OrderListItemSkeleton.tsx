import React from "react";
import { View } from "react-native";
import { Skeleton } from "./ui/skeleton";

export function OrderListItemSkeleton() {
  return (
    <View className="bg-gray-50 rounded-[12px] p-4 mb-3 mx-4">
      <View className="flex-row items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <View className="flex-1">
          <View className="flex-row justify-between mb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </View>
          <View className="flex-row justify-between items-end mt-2">
            <View className="gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </View>
            <View className="items-end gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-12" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
