"use client";
import { getCategoryImage } from "@/constants/categories";
import { useGetCategoriesQuery } from "@/lib/api/publicApi";
import { Image } from "expo-image";
import { router } from "expo-router"; // imperative — no useNavigation() context needed
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CategorySliderSkeleton } from "./CategorySliderSkeleton";

/**
 * Category slider — matches web app behaviour:
 *  1. Local asset image (always available, preferred)
 *  2. API image URL (fallback when no local asset)
 *  3. Emoji placeholder (last resort)
 *
 * Images are blank on mobile when source is null/undefined;
 * expo-image silently shows nothing. This component ensures
 * there is always something to show.
 */
export function CategorySlider() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  // Track which categories had their primary source fail so we can fall back
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

  if (isLoading) return <CategorySliderSkeleton />;
  if (!categories.length) return null;

  return (
    <View className="mb-6">
      <Text className="text-[20px] font-bold text-system-blue-dark mb-4 px-4">
        Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {(categories as any[]).map((cat) => {
          // Prefer local asset (web app does the same via hardcoded map)
          const localImage = getCategoryImage(cat.name);
          const hasFailed = failedIds.has(cat.id);

          // Build the source: local → API URI → null
          let imageSource: any = null;
          if (localImage) {
            imageSource = localImage;
          } else if (cat.image && !hasFailed) {
            imageSource = { uri: cat.image };
          }

          const handleError = () => {
            // If the API URI failed, mark it so we show the placeholder
            setFailedIds((prev) => new Set(prev).add(cat.id));
          };

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
                {/* Image area — top 70% */}
                <View
                  style={{ height: "70%" }}
                  className="bg-blue-50 items-center justify-center"
                >
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      onError={handleError}
                    />
                  ) : (
                    /* Placeholder when no image is available */
                    <View className="w-full h-full items-center justify-center bg-blue-50">
                      <Text style={{ fontSize: 30 }}>🛍️</Text>
                    </View>
                  )}
                </View>

                {/* Label area — bottom 30% */}
                <View
                  style={{ height: "30%" }}
                  className="bg-system-blue-light items-center justify-center px-1"
                >
                  <Text
                    className="text-[11px] font-bold text-white text-center"
                    numberOfLines={2}
                  >
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
