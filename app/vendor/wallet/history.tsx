import { LoadingSpinner } from "@/components/loading-spinner";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { useGetTransactionHistoryQuery } from "@/lib/api/vendorApi";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIMIT = 20;

export default function VendorTransactionHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [offset, setOffset] = useState(0);

  // Was stuck on offset=0 forever - `page` state existed but nothing ever
  // advanced it, so this screen silently capped at the first 20
  // transactions no matter how many the vendor actually had.
  const { data, isLoading, isFetching, refetch } =
    useGetTransactionHistoryQuery({
      limit: LIMIT,
      offset,
    });

  const transactions = data?.results || [];
  const hasMore = !!data?.next;
  const isFetchingMore = isFetching && offset > 0;

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setOffset((o) => o + LIMIT);
    }
  }, [hasMore, isFetching]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setOffset(0);
    await refetch();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <Feather name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        History
      </Text>
      <View className="w-10" />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20 px-[21px]">
      <MaterialIcons name="history" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4">
        No transactions
      </Text>
      <Text className="text-[14px] text-[#6B7280] text-center mt-2 px-6">
        Your transaction history will appear here once you start earning.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => {
          const isCredit = item.type === "CREDIT";
          return (
            <View>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/vendor/wallet/receipt",
                    params: { id: item.id },
                  })
                }
                className="p-[21px] flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-[16px] font-bold text-system-blue-dark">
                    {item.description}
                  </Text>
                  <Text className="text-[12px] text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-[16px] font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}
                  >
                    {isCredit ? "+" : "-"} ₦
                    {parseFloat(item.amount).toLocaleString()}
                  </Text>
                  <View
                    className={`mt-1 px-2 py-0.5 rounded-full ${
                      item.status === "successful"
                        ? "bg-green-100"
                        : item.status === "pending"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        item.status === "successful"
                          ? "text-green-700"
                          : item.status === "pending"
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Divider height={1} className="opacity-50" />
            </View>
          );
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={Colors.primary}
            />
          ) : null
        }
      />

      {isLoading && !refreshing && (
        <View className="absolute inset-0 bg-white/50 items-center justify-center">
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}
