import {
  useGetRecommendationsQuery,
  type RecommendationType,
} from "@/lib/api/publicApi";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ProductCard } from "./product-card";

const CARD_WIDTH = 160;
const DEFAULT_LIMIT = 8;

interface Props {
  title: string;
  type: RecommendationType;
  /** Product slug to find neighbours for. Only used by `related`. */
  product?: string;
  /** Category slug to scope to. Only used by `trending`. */
  category?: string;
  limit?: number;
  /**
   * Spacing for the outer wrapper. Lives here rather than on a wrapper the
   * caller supplies, so that when the row renders nothing the caller isn't left
   * with a stray margin where the section would have been.
   */
  className?: string;
}

/**
 * A horizontally scrollable strip of recommended products.
 *
 * Renders nothing at all — no header, no skeleton — until there is something to
 * show. Recommendations are supplementary, so a heading over an empty or
 * loading strip is worse than the section simply not existing: it reads as
 * broken, and a skeleton that resolves to zero results would shift the page
 * underneath the user for no payoff. Failures are treated the same as empty.
 */
export function RecommendationRow({
  title,
  type,
  product,
  category,
  limit = DEFAULT_LIMIT,
  className = "mb-6",
}: Props) {
  const { data } = useGetRecommendationsQuery({
    type,
    product,
    category,
    limit,
  });

  const products = data?.data ?? [];

  if (products.length === 0) return null;

  return (
    <View className={className}>
      <View className="px-4 mb-3">
        <Text className="text-[20px] font-bold text-system-blue-dark">
          {title}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {products.map((item) => (
          <View key={item.id} style={{ width: CARD_WIDTH }}>
            <ProductCard product={item} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
