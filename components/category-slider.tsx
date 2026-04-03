import { Colors } from "@/constants/theme";
import { getCategoryImage } from "@/constants/categories";
import { useGetCategoriesQuery } from "@/lib/api/publicApi";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CategorySliderSkeleton } from "./CategorySliderSkeleton";

export function CategorySlider() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  if (isLoading) return <CategorySliderSkeleton />;
  if (categories.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="text-[20px] font-bold text-system-blue-dark mb-4 px-4">Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {categories.map((cat: any) => {
          const categoryImage = cat.image ? { uri: cat.image } : getCategoryImage(cat.name);

          return (
            <Pressable
              key={cat.id}
              onPress={() =>
                router.push(
                  `/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
                )
              }
            >
              <View className="w-28 h-32 rounded-[12px] overflow-hidden border border-gray-100 bg-white shadow-sm">
                <View className="h-[70%] bg-white">
                  <Image
                    source={categoryImage}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                </View>
                <View className="h-[30%] bg-system-blue-light items-center justify-center px-1">
                  <Text className="text-[11px] font-bold text-white text-center" numberOfLines={2}>
                    {cat.name}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
