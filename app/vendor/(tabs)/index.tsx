import { useAppSelector } from "@/lib/hooks";
import {
  useGetVendorAnalyticsSelfQuery,
  useGetVendorProfileQuery,
  useGetVendorOrdersListQuery,
} from "@/lib/api/vendorApi";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

type StatCardProps = {
  label: string;
  value: string | number;
  change: string;
  isLoading?: boolean;
};

function StatCard({ label, value, change, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <View className="bg-white h-[95px] rounded-[12px] p-4 w-[48%] mb-3 justify-center items-center">
        <ActivityIndicator size="small" color="#030482" />
      </View>
    );
  }

  return (
    <View className="bg-white h-[95px] rounded-[12px] p-4 w-[48%] mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-[16px] font-normal text-system-blue-dark">{label}</Text>
        <View className="size-[29px] bg-gray-100 rounded-[6px] items-center justify-center">
           <View className="size-[12px] rounded-full bg-blue-500" />
        </View>
      </View>
      <Text className="text-[20px] font-semibold text-system-blue-dark">
        {value}
      </Text>
      <View className="flex-row items-center mt-1">
        <Text className="text-[10px] text-green-500 font-medium">{change}</Text>
      </View>
    </View>
  );
}

export default function VendorDashboard() {
  const router = useRouter();
  const { data: analyticsResponse, isLoading: analyticsLoading, refetch: refetchAnalytics } = useGetVendorAnalyticsSelfQuery();
  const { data: profileResponse, isLoading: profileLoading, refetch: refetchProfile } = useGetVendorProfileQuery();
  const { data: ordersResponse, isLoading: ordersLoading, refetch: refetchOrders } = useGetVendorOrdersListQuery({ limit: 5 });

  const profile = profileResponse?.data;
  const analytics = analyticsResponse?.data;
  const recentOrders = ordersResponse?.data || [];

  const vendorName = profile?.user?.full_name || profile?.store_name || "Vendor";

  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchAnalytics(), refetchProfile(), refetchOrders()]);
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 mb-6">
          <View>
            <Text className="text-[20px] font-medium text-gray-500/50">
              Welcome back,
            </Text>
            {profileLoading ? (
               <View className="h-8 w-32 bg-gray-100 rounded mt-1" />
            ) : (
              <Text className="text-[24px] font-semibold text-system-blue-dark">
                {vendorName.split(' ')[0]}
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.push("/vendor/account/notifications")}>
              <Ionicons name="notifications-outline" size={24} color="#000011" />
            </TouchableOpacity>
            <View className="w-[41px] h-[41px] bg-system-blue-light rounded-full items-center justify-center">
              <Text className="text-white font-semibold">
                {vendorName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid Background Framer */}
        <View className="bg-system-divider p-4 min-h-[242px] mb-6">
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              label="Total Balance"
              value={`₦${parseFloat(String(analytics?.total_balance || 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              change="+0.00%"
              isLoading={analyticsLoading}
            />
            <StatCard
              label="Total Orders"
              value={analytics?.total_orders || 0}
              change="+0.00%"
              isLoading={analyticsLoading}
            />
            <StatCard
              label="Product Sold"
              value={analytics?.total_products_sold || 0}
              change="+0.00%"
              isLoading={analyticsLoading}
            />
            <StatCard
              label="New Customer"
              value={analytics?.new_customers || 0}
              change="+0.00%"
              isLoading={analyticsLoading}
            />
          </View>
        </View>

        {/* Recent Orders */}
        <View className="px-4">
          <Text className="text-[16px] font-semibold text-system-blue-dark mb-4">
            Recent Orders
          </Text>
          {ordersLoading ? (
            <ActivityIndicator size="large" color="#030482" className="mt-4" />
          ) : recentOrders.length === 0 ? (
            <View className="bg-system-blue-light rounded-[12px] p-6 flex-row items-center justify-between">
              <Text className="text-white font-semibold text-lg">No Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push("/vendor/orders")} className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Ionicons name="add" size={24} color="#030482" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {recentOrders.map((order: any) => (
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
                       <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                            {order.customer.full_name}
                          </Text>
                          <View className="bg-gray-200 px-3 py-1 rounded-full">
                            <Text className="text-[10px] font-medium capitalize text-gray-700">{order.status}</Text>
                          </View>
                       </View>
                       <View className="flex-row justify-between items-center mt-2">
                          <View>
                            <Text className="text-[10px] text-gray-500">Order ID</Text>
                            <Text className="text-xs font-medium text-gray-900">{order.order_id}</Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-sm font-bold text-gray-900">₦{parseFloat(order.total_amount).toLocaleString()}</Text>
                            <Text className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</Text>
                          </View>
                       </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
