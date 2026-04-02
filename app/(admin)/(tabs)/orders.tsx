import { Divider } from "@/components/ui/divider";
import { OrderListItemSkeleton } from "@/components/OrderListItemSkeleton";
import { useGetAllOrdersQuery } from "@/lib/api/adminApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#D97706" },
  paid: { bg: "#DBEAFE", text: "#2563EB" },
  processing: { bg: "#DBEAFE", text: "#2563EB" },
  shipped: { bg: "#EDE9FE", text: "#7C3AED" },
  delivered: { bg: "#D1FAE5", text: "#059669" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function AdminOrders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data: orders = [], isLoading, refetch } = useGetAllOrdersQuery({ status });

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20">
      <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
      <Text className="text-[18px] font-bold text-system-blue-dark mt-4">No orders found</Text>
      <Text className="text-[14px] text-[#6B7280] text-center px-10 mt-2">
        There are no orders matching your current filter.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-[21px] py-4">
        <Text className="text-[24px] font-semibold text-system-blue-dark text-center">All Orders</Text>
      </View>

      <Divider />

      {/* Filter Chips */}
      <View className="py-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { label: "All", value: undefined },
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          contentContainerStyle={{ paddingHorizontal: 21, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setStatus(item.value)}
              className={`px-4 py-2 rounded-full border ${status === item.value ? "bg-system-blue-light border-system-blue-light" : "bg-white border-gray-200"}`}
            >
              <Text className={`text-[12px] font-semibold ${status === item.value ? "text-white" : "text-[#6B7280]"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Divider />

      {isLoading && !refreshing ? (
        <View className="pt-4 px-[21px]">
          <OrderListItemSkeleton />
          <OrderListItemSkeleton />
          <OrderListItemSkeleton />
          <OrderListItemSkeleton />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#030482" />
          }
          renderItem={({ item }) => {
            const s = item.status?.toLowerCase() || "pending";
            const color = STATUS_COLORS[s] || STATUS_COLORS.pending;
            
            return (
              <View>
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/orders/${item.order_id}` as any)}
                  className="p-[21px] flex-row justify-between items-center"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-[16px] font-bold text-system-blue-dark">#{item.order_id.slice(0, 8)}</Text>
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: color.bg }}>
                        <Text className="text-[10px] font-bold uppercase" style={{ color: color.text }}>{item.status}</Text>
                      </View>
                    </View>
                    <Text className="text-[14px] text-[#6B7280]" numberOfLines={1}>{item.customer.full_name}</Text>
                    <Text className="text-[12px] text-[#9CA3AF] mt-1">
                      {new Date(item.ordered_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="items-end gap-2">
                    <Text className="text-[16px] font-bold text-system-blue-light">{formatCurrency(item.total_price)}</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
                <Divider height={1} className="opacity-50" />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
