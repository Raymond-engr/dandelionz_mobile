import {
  useGetVendorOrdersSummaryQuery,
  useGetVendorOrdersListQuery,
} from "@/lib/api/vendorApi";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type OrderStatProps = {
  label: string;
  value: number;
  bgColor: string;
  isLoading?: boolean;
};

function OrderStat({ label, value, bgColor, isLoading }: OrderStatProps) {
  return (
    <View className={`${bgColor} rounded-[12px] p-4 w-[48%] mb-3`}>
      <Text className="text-[12px] font-normal text-gray-600 mb-1">{label}</Text>
      {isLoading ? (
        <View className="h-7 w-12 bg-gray-200/50 rounded animate-pulse" />
      ) : (
        <Text className="text-[24px] font-bold text-gray-900">{value}</Text>
      )}
    </View>
  );
}

export default function VendorOrdersScreen() {
  const router = useRouter();
  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useGetVendorOrdersSummaryQuery();
  const {
    data: listResponse,
    isLoading: isLoadingList,
    refetch: refetchList,
  } = useGetVendorOrdersListQuery({});

  const stats = summaryResponse?.data;
  const orders = listResponse?.data || [];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchList()]);
    setRefreshing(false);
  };

  const totalOrders =
    (stats?.pending || 0) +
    (stats?.paid || 0) +
    (stats?.shipped || 0) +
    (stats?.delivered || 0) +
    (stats?.canceled || 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-100 items-center">
          <Text className="text-lg font-semibold text-gray-900">Order</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#030482"
            />
          }
        >
          <Text className="text-sm text-gray-500 mb-6">
            Manage and track your customers order
          </Text>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between mb-6">
            <OrderStat
              label="Total Orders"
              value={totalOrders}
              bgColor="bg-purple-50"
              isLoading={isLoadingSummary}
            />
            <OrderStat
              label="Pending"
              value={stats?.pending || 0}
              bgColor="bg-yellow-50"
              isLoading={isLoadingSummary}
            />
            <OrderStat
              label="Delivered"
              value={stats?.delivered || 0}
              bgColor="bg-green-50"
              isLoading={isLoadingSummary}
            />
            <OrderStat
              label="Paid"
              value={stats?.paid || 0}
              bgColor="bg-blue-50"
              isLoading={isLoadingSummary}
            />
          </View>

          <Text className="text-[16px] font-semibold text-system-blue-dark mb-4">
            All Orders
          </Text>

          {isLoadingList && !refreshing ? (
            <ActivityIndicator size="large" color="#030482" className="mt-10" />
          ) : orders.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500">No orders found</Text>
            </View>
          ) : (
            <View className="gap-3">
              {orders.map((order: any) => (
                <TouchableOpacity
                  key={order.uuid}
                  onPress={() => router.push(`/vendor/order/${order.uuid}`)}
                  className="bg-gray-50 rounded-[12px] p-4"
                >
                  <View className="flex-row gap-3">
                    <View className="w-10 h-10 bg-system-blue-light rounded-full items-center justify-center">
                      <Text className="text-white font-semibold">
                        {order.customer.full_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <View className="flex-1">
                          <Text
                            className="text-sm font-semibold text-gray-900"
                            numberOfLines={1}
                          >
                            {order.customer.full_name}
                          </Text>
                          <Text
                            className="text-[10px] text-gray-500"
                            numberOfLines={1}
                          >
                            {order.customer.email}
                          </Text>
                        </View>
                        <View className="bg-gray-200 px-3 py-1 rounded-full ml-2">
                          <Text className="text-[10px] font-medium capitalize text-gray-700">
                            {order.status}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center mt-2">
                        <View>
                          <Text className="text-[10px] text-gray-500">
                            Order ID
                          </Text>
                          <Text className="text-xs font-medium text-gray-900">
                            {order.order_id}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm font-bold text-gray-900">
                            ₦{parseFloat(order.total_amount).toLocaleString()}
                          </Text>
                          <Text className="text-[10px] text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
