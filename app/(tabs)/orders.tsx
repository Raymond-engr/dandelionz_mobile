import { OrderListItemSkeleton } from "@/components/OrderListItemSkeleton";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
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
        <Text className="text-[24px] font-bold text-system-blue-dark text-center">
          My Orders
        </Text>
      </View>

      {/* Filter tabs */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 21, gap: 10 }}
        >
          {STATUS_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full border ${
                activeTab === tab
                  ? "bg-system-blue-light border-system-blue-light"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  activeTab === tab ? "text-white" : "text-gray-500"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Divider height={1} />

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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#030482"
            />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center pt-20 px-10">
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text className="text-[18px] font-bold text-system-blue-dark mt-4">
                No orders found
              </Text>
              <Text className="text-[14px] text-gray-500 text-center mt-2">
                {activeTab === "All"
                  ? "You haven't placed any orders yet."
                  : `No ${activeTab.toLowerCase()} orders found.`}
              </Text>
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
                className="mx-[21px] mb-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:opacity-80"
              >
                {/* Order ID + Status */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className="text-[14px] font-bold text-system-blue-dark"
                    numberOfLines={1}
                    style={{ maxWidth: "60%" }}
                  >
                    #{item.order_id.slice(0, 8)}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: color.bg }}
                  >
                    <Text
                      className="text-[11px] font-bold uppercase"
                      style={{ color: color.text }}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Date */}
                <Text className="text-[12px] text-[#9CA3AF] mb-2">
                  {new Date(item.ordered_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>

                {/* Total + CTA */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-[18px] font-bold text-system-blue-dark">
                    ₦
                    {parseFloat(
                      item.total_with_delivery || "0",
                    ).toLocaleString()}
                  </Text>
                  <Text className="text-system-blue-light font-semibold text-[13px]">
                    View Receipt ›
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
