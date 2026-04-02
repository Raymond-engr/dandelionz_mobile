import { Divider } from "@/components/ui/divider";
import { OrderListItemSkeleton } from "@/components/OrderListItemSkeleton";
import { useGetCustomerOrdersQuery } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
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

const STATUS_TABS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [activeTab, setActiveTab] = useState("All");

  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useGetCustomerOrdersQuery(
    activeTab === "All" ? {} : { status: activeTab.toLowerCase() },
    { skip: !isAuthenticated },
  );

  const orders = Array.isArray(ordersResponse) ? ordersResponse : [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8 gap-4">
        <Text className="text-[18px] font-semibold text-system-blue-dark">
          Log in to see your orders
        </Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          className="bg-system-blue-light px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-[21px] py-4">
        <Text className="text-[24px] font-bold text-system-blue-dark text-center">
          My Orders
        </Text>
      </View>

      <Divider />

      {/* Tabs */}
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 21, gap: 12 }}
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
                className={`text-[14px] font-medium ${
                  activeTab === tab ? "text-white" : "text-gray-500"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading && !refreshing ? (
        <View className="pt-4">
          <OrderListItemSkeleton />
          <OrderListItemSkeleton />
          <OrderListItemSkeleton />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-20 px-10">
              <Text className="text-[16px] text-[#6B7280] text-center">
                You haven&apos;t placed any orders yet.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/order-receipt" as any,
                  params: { id: item.order_id },
                })
              }
              className="mx-[21px] mb-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[14px] font-bold text-system-blue-dark">
                  #{item.order_id}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.status === "Delivered" ? "bg-green-50" : "bg-blue-50"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      item.status === "Delivered"
                        ? "text-green-600"
                        : "text-system-blue-light"
                    }`}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-[12px] text-[#6B7280] mb-1">
                    {new Date(item.ordered_at).toLocaleDateString()}
                  </Text>
                  <Text className="text-[16px] font-bold text-system-blue-dark">
                    ₦{parseFloat(item.total_with_delivery).toLocaleString()}
                  </Text>
                </View>
                <Text className="text-system-blue-light font-semibold text-[14px]">
                  View Receipt ›
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
