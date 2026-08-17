import { LoadingSpinner } from "@/components/loading-spinner";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  selectStandardEnvelope,
  useInfiniteList,
} from "@/hooks/use-infinite-list";
import {
  useGetVendorOrdersListQuery,
  useGetVendorOrdersSummaryQuery,
} from "@/lib/api/vendorApi";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OrderStatProps = {
  label: string;
  value: number;
  bg: string;
};

function OrderStat({ label, value, bg }: OrderStatProps) {
  return (
    <View
      className={`w-[48%] rounded-[12px] p-4 mb-3 h-[90px] justify-end ${bg}`}
    >
      <Text className="text-[12px] text-gray-500 mb-1 uppercase font-bold tracking-tighter">
        {label}
      </Text>
      <Text className="text-[22px] font-bold text-system-blue-dark">
        {value}
      </Text>
    </View>
  );
}

export default function VendorOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useGetVendorOrdersSummaryQuery();
  const {
    items: orders,
    isInitialLoading,
    isFetchingMore,
    loadMore,
    refresh,
  } = useInfiniteList(useGetVendorOrdersListQuery, {}, selectStandardEnvelope);

  const stats = summaryResponse?.data;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refresh()]);
    setRefreshing(false);
  };

  const totalOrders =
    (stats?.pending || 0) +
    (stats?.paid || 0) +
    (stats?.shipped || 0) +
    (stats?.delivered || 0) +
    (stats?.canceled || 0);

  const renderHeader = () => (
    <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top }}>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center">
        Orders
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View className="px-[21px] py-6">
      <Text className="text-[14px] text-gray-500 mb-6 text-center">
        Manage and track your customer orders in real-time
      </Text>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between mb-4">
        <OrderStat label="Total Orders" value={totalOrders} bg="bg-purple-50" />
        <OrderStat
          label="Pending"
          value={stats?.pending || 0}
          bg="bg-yellow-50"
        />
        <OrderStat
          label="Delivered"
          value={stats?.delivered || 0}
          bg="bg-green-50"
        />
        <OrderStat label="Paid" value={stats?.paid || 0} bg="bg-blue-50" />
      </View>

      <Divider height={11} className="mt-2 -mx-[21px]" />

      <Text className="text-[18px] font-bold text-system-blue-dark mt-6">
        Order History
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}

      <Divider />

      {isInitialLoading && !refreshing ? (
        <View style={{ paddingTop: 40 }}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order: any) => order.uuid}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 21 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <MaterialIcons name="shopping-bag" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4">
                No orders received yet.
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item: order }) => (
            <TouchableOpacity
              onPress={() => router.push(`/vendor/order/${order.uuid}`)}
              className="bg-white border border-gray-100 rounded-[16px] p-4 shadow-sm"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-system-blue-light/10 rounded-full items-center justify-center mr-3">
                  <MaterialIcons
                    name="person-outline"
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[15px] font-bold text-system-blue-dark"
                    numberOfLines={1}
                  >
                    {order.customer.full_name}
                  </Text>
                  <Text className="text-[12px] text-gray-400">
                    {order.order_id}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    order.status === "PAID" ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      order.status === "PAID"
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end pt-3 border-t border-gray-50">
                <View>
                  <Text className="text-[11px] text-gray-400 uppercase font-bold">
                    Total Amount
                  </Text>
                  <Text className="text-[16px] font-bold text-system-blue-light">
                    {formatCurrency(order.total_amount)}
                  </Text>
                </View>
                <Text className="text-[11px] text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
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
      )}
    </View>
  );
}
