import { OrderListItemSkeleton } from "@/components/OrderListItemSkeleton";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { useGetCustomerOrdersQuery } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_TABS = [
  "All",
  "Pending",
  "Paid",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#D97706" },
  paid: { bg: "#DBEAFE", text: "#2563EB" },
  shipped: { bg: "#EDE9FE", text: "#7C3AED" },
  delivered: { bg: "#D1FAE5", text: "#059669" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  // Always fetch all orders — filter client-side
  // (the API status filter uses uppercase but is unreliable cross-backend)
  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useGetCustomerOrdersQuery({}, { skip: !isAuthenticated });

  const allOrders = Array.isArray(ordersResponse) ? ordersResponse : [];

  // Client-side filter
  const orders =
    activeTab === "All"
      ? allOrders
      : allOrders.filter(
          (item) => item.status?.toLowerCase() === activeTab.toLowerCase(),
        );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-8 gap-4"
        style={{ paddingTop: insets.top }}
      >
        <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
        <Text className="text-[20px] font-bold text-system-blue-dark text-center">
          Sign in to view your orders
        </Text>
        <Text className="text-[14px] text-[#6B7280] text-center mb-4">
          Keep track of your purchases and order status
        </Text>
        <Button onPress={() => router.push("/(auth)/login")}>Login</Button>
        <Button
          variant="outline"
          onPress={() => router.push("/(auth)/register")}
        >
          Create Account
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-[21px] py-4 border-b border-gray-100">
        <Text className="text-[24px] font-bold text-system-blue-dark">
          My Orders
        </Text>
      </View>

      {/* Filter tabs */}
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 21, gap: 8 }}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full border ${
                  isActive
                    ? "bg-system-blue-light border-system-blue-light"
                    : "bg-white border-gray-100"
                } shadow-sm`}
                style={isActive ? { elevation: 2 } : {}}
              >
                <Text
                  className={`text-[13px] font-bold ${
                    isActive ? "text-white" : "text-[#6B7280]"
                  }`}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Divider height={1} className="opacity-50" />

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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#030482"
            />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center pt-20 px-10">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
              </View>
              <Text className="text-[18px] font-bold text-system-blue-dark">
                No orders found
              </Text>
              <Text className="text-[14px] text-gray-500 text-center mt-2 mb-8">
                {activeTab === "All"
                  ? "You haven't placed any orders yet."
                  : `You have no ${activeTab.toLowerCase()} orders.`}
              </Text>
              <Button
                variant="outline"
                fullWidth={false}
                className="px-8"
                onPress={() => router.push("/(tabs)")}
              >
                Start Shopping
              </Button>
            </View>
          )}
          renderItem={({ item }) => {
            const statusKey = item.status?.toLowerCase() || "pending";
            const color = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/order-receipt" as any,
                    params: { id: item.order_id },
                  })
                }
                className="mx-[21px] mb-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm active:opacity-90 overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 15,
                  elevation: 2,
                }}
              >
                {/* Status Indicator Bar */}
                <View
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: color.text }}
                />

                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-[12px] font-bold text-[#9CA3AF] uppercase mb-1">
                      Order ID
                    </Text>
                    <Text className="text-[15px] font-bold text-system-blue-dark">
                      #{item.order_id.slice(0, 8).toUpperCase()}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: color.bg }}
                  >
                    <Text
                      className="text-[10px] font-black uppercase"
                      style={{ color: color.text }}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] text-[#6B7280]">
                      Ordered on{" "}
                      {new Date(item.ordered_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <Text className="text-[16px] font-bold text-system-blue-dark mt-0.5">
                      ₦
                      {parseFloat(
                        item.total_with_delivery || "0",
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                  <Text className="text-[12px] text-[#9CA3AF]">
                    {item.items_count || 1}{" "}
                    {item.items_count === 1 ? "item" : "items"}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-system-blue-light font-bold text-[13px] mr-1">
                      View Details
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#007BFF"
                    />
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
