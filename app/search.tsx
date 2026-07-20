import { FilterModal } from "@/components/filter-modal";
import { ProductGrid } from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { SearchBar } from "@/components/search-bar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import {
  useGetProductsQuery,
  useGetSearchSuggestionsQuery,
} from "@/lib/api/publicApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Filters {
  min_price?: number;
  max_price?: number;
  price?: number;
  ordering?: string;
  category?: string;
}

// Below this the suggestions endpoint returns nothing anyway, so don't ask.
const MIN_SUGGESTION_LENGTH = 2;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  // `query` tracks the input; `submitted` tracks what we're actually showing
  // results for. Keeping them separate is what lets suggestions appear while
  // typing without the results grid thrashing underneath.
  const [query, setQuery] = useState(params.q ?? "");
  const [submitted, setSubmitted] = useState(params.q ?? "");
  const [filters, setFilters] = useState<Filters>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();

  const debouncedQuery = useDebouncedValue(query, 300);
  const showSuggestions = query !== submitted;

  const { data: suggestionData } = useGetSearchSuggestionsQuery(debouncedQuery, {
    skip: !showSuggestions || debouncedQuery.trim().length < MIN_SUGGESTION_LENGTH,
  });

  // debouncedQuery lags query by 300ms, so suggestionData can still describe the
  // previous term. Treat it as absent until it catches up, otherwise the panel
  // briefly lists results for what the user typed before.
  const suggestionsReady = debouncedQuery.trim() === query.trim();

  const { data: resultData, isFetching } = useGetProductsQuery(
    { search: submitted || undefined, ...filters },
    { skip: !submitted },
  );

  const products = resultData?.data ?? [];
  const suggestions = suggestionsReady ? suggestionData?.data : undefined;

  const runSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setQuery(trimmed);
      setSubmitted(trimmed);
      addRecent(trimmed);
    },
    [addRecent],
  );

  const renderSuggestions = () => {
    // No panel at all beats an empty one flashing while the debounce settles.
    if (!suggestions) {
      return (
        <View className="items-center py-10">
          <ActivityIndicator color="#030482" />
        </View>
      );
    }

    const hasAny =
      (suggestions.categories?.length ?? 0) + (suggestions.products?.length ?? 0) > 0;

    if (!hasAny) {
      return (
        <View className="items-center px-8 py-10">
          <Text className="text-center text-[14px] text-gray-500">
            No suggestions. Press search to look for “{query.trim()}”.
          </Text>
        </View>
      );
    }

    return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {suggestions?.categories?.map((category) => (
        <Pressable
          key={`category-${category.slug}`}
          className="flex-row items-center px-4 py-3 border-b border-gray-100"
          onPress={() => router.push(`/category/${category.slug}`)}
        >
          <Ionicons name="grid-outline" size={18} color="#6B7280" />
          <Text className="ml-3 text-[15px] text-gray-900">{category.name}</Text>
          <Text className="ml-2 text-[13px] text-gray-400">in Categories</Text>
        </Pressable>
      ))}

      {suggestions?.products?.map((product) => (
        <Pressable
          key={`product-${product.slug}`}
          className="flex-row items-center px-4 py-3 border-b border-gray-100"
          onPress={() => router.push(`/product/${product.slug}`)}
        >
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <Text className="ml-3 flex-1 text-[15px] text-gray-900" numberOfLines={1}>
            {product.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
    );
  };

  const renderRecent = () => (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-[15px] font-semibold text-gray-900">
          Recent searches
        </Text>
        <Pressable onPress={clearRecent}>
          <Text className="text-[13px] text-system-blue-dark">Clear all</Text>
        </Pressable>
      </View>

      {recent.map((term) => (
        <Pressable
          key={term}
          className="flex-row items-center px-4 py-3 border-b border-gray-100"
          onPress={() => runSearch(term)}
        >
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text className="ml-3 flex-1 text-[15px] text-gray-900">{term}</Text>
          <Pressable hitSlop={8} onPress={() => removeRecent(term)}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </Pressable>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderResults = () => {
    if (isFetching) {
      return <ProductGridSkeleton count={4} />;
    }

    if (products.length === 0) {
      return (
        <View className="items-center px-8 py-16">
          <Ionicons name="search-outline" size={44} color="#D1D5DB" />
          <Text className="mt-4 text-[16px] font-semibold text-gray-900">
            No results for “{submitted}”
          </Text>
          <Text className="mt-1 text-center text-[14px] text-gray-500">
            Try a different spelling or a more general term.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="px-4 py-3 text-[13px] text-gray-500">
          {products.length} {products.length === 1 ? "result" : "results"} for “
          {submitted}”
        </Text>
        <ProductGrid products={products} />
      </ScrollView>
    );
  };

  const renderBody = () => {
    if (showSuggestions) {
      return query.trim().length >= MIN_SUGGESTION_LENGTH
        ? renderSuggestions()
        : renderRecent();
    }
    return submitted ? renderResults() : renderRecent();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => runSearch(query)}
            autoFocus={!params.q}
            showFilter={Boolean(submitted)}
            onFilterPress={() => setFilterOpen(true)}
          />
        </View>
      </View>

      {renderBody()}

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </View>
  );
}
