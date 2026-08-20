import { LoadingSpinner } from "@/components/loading-spinner";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  selectStandardEnvelope,
  useInfiniteList,
} from "@/hooks/use-infinite-list";
import { useGetAllPaymentsQuery } from "@/lib/api/adminApi";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminTransactionHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Was a single unpaginated useGetAllPaymentsQuery() - every payment ever
  // processed on the platform, in one response, ever-growing.
  const {
    items: transactions,
    isInitialLoading: isLoading,
    isFetchingMore,
    loadMore,
    refresh,
  } = useInfiniteList(useGetAllPaymentsQuery, {}, selectStandardEnvelope);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
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
      <Text className="text-[14px] text-[#6B7280] text-center mt-2">
        There are no transaction records at the moment.
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
        renderItem={({ item }) => (
          <View>
            <View className="p-[21px] flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                    <MaterialIcons
                      name="receipt-long"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <Text
                    className="text-[14px] font-bold text-system-blue-dark"
                    numberOfLines={1}
                  >
                    {item.order_uuid
                      ? `${item.order_uuid.slice(0, 8)}...`
                      : "No UUID"}
                  </Text>
                </View>
                <Text className="text-[12px] text-gray-500">
                  {item.payment_method || "Unknown Method"}
                </Text>
                <Text className="text-[11px] text-gray-400 mt-1">
                  {item.created_at
                    ? format(new Date(item.created_at), "MMM do, yyyy")
                    : "No Date"}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[16px] font-bold text-system-blue-dark">
                  {formatCurrency(item.amount || "0")}
                </Text>
                <View
                  className={`mt-1 px-2 py-0.5 rounded-full ${item.status === "success" ? "bg-green-100" : "bg-red-100"}`}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase ${item.status === "success" ? "text-green-700" : "text-red-700"}`}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
            <Divider height={1} className="opacity-50" />
          </View>
        )}
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
