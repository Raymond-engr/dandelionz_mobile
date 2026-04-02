import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useGetVendorAnalyticsSelfQuery,
  useGetVendorProfileQuery,
  useGetVendorOrdersListQuery,
} from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCardSkeleton } from "@/components/StatCardSkeleton";
import { OrderListItemSkeleton } from "@/components/OrderListItemSkeleton";
import { formatCurrency } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <View className="bg-white rounded-[16px] p-4 w-[48%] mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <MaterialIcons name={icon} size={18} color={color} />
        </View>
      </View>
      <Text className="text-[20px] font-bold text-system-blue-dark">
        {value}
      </Text>
      <Text className="text-[12px] text-gray-400 font-bold uppercase tracking-tighter">
        {label}
      </Text>
    </View>
  );
}

export default function VendorDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const renderHeader = () => (
    <View 
      className="flex-row items-center justify-between px-[21px] py-4 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1">
        <Text className="text-[14px] text-gray-400 font-medium">Hello,</Text>
        <Text className="text-[24px] font-bold text-system-blue-dark">
          {vendorName.split(' ')[0]}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
          onPress={() => router.push("/vendor/account/notifications")}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
        >
          <MaterialIcons name="notifications-none" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push("/vendor/account/profile")}
          className="w-10 h-10 rounded-full bg-system-blue-light items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-[14px]">
            {vendorName.substring(0, 2).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}
      
      <Divider />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Overview Stats */}
        <View className="px-[21px] pt-6 bg-gray-50/30">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-4">Quick Overview</Text>
          
          {analyticsLoading && !refreshing ? (
            <StatCardSkeleton />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              <StatCard
                label="Wallet Balance"
                value={formatCurrency(analytics?.total_balance)}
                icon="account-balance-wallet"
                color={Colors.primary}
              />
              <StatCard
                label="Total Orders"
                value={analytics?.total_orders || 0}
                icon="shopping-bag"
                color="#9333ea"
              />
              <StatCard
                label="Products Sold"
                value={analytics?.total_products_sold || 0}
                icon="local-offer"
                color="#16a34a"
              />
              <StatCard
                label="New Customers"
                value={analytics?.new_customers || 0}
                icon="people"
                color="#ca8a04"
              />
            </View>
          )}
        </View>

        <Divider height={11} className="my-2" />

        {/* Recent Orders Section */}
        <View className="px-[21px] pt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[18px] font-bold text-system-blue-dark">Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/vendor/(tabs)/orders")}>
              <Text className="text-system-blue-light font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          {ordersLoading && !refreshing ? (
            <View className="pt-2">
              <OrderListItemSkeleton />
              <OrderListItemSkeleton />
            </View>
          ) : recentOrders.length === 0 ? (
            <View className="bg-blue-50/50 rounded-[20px] p-10 items-center border border-blue-100 border-dashed">
              <MaterialIcons name="receipt" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">No orders to display yet.</Text>
            </View>
          ) : (
            <View className="gap-4">
              {recentOrders.map((order: any) => (
                <TouchableOpacity
                  key={order.uuid}
                  onPress={() => router.push(`/vendor/order/${order.uuid}`)}
                  className="bg-white border border-gray-100 rounded-[16px] p-4 flex-row items-center shadow-sm"
                >
                  <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mr-4">
                    <MaterialIcons name="person" size={24} color="#9CA3AF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-system-blue-dark" numberOfLines={1}>
                      {order.customer.full_name}
                    </Text>
                    <Text className="text-[12px] text-gray-400 mt-0.5">{order.order_id}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[15px] font-bold text-system-blue-dark">
                      {formatCurrency(order.total_amount)}
                    </Text>
                    <View className="mt-1 bg-yellow-100 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-yellow-700">{order.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-[21px] mt-10">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-4">Quick Actions</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={() => router.push("/vendor/product/new")}
              className="flex-1 bg-system-blue-light rounded-[16px] p-4 items-center justify-center h-24 shadow-lg shadow-blue-900/20"
            >
              <MaterialIcons name="add-circle-outline" size={28} color="white" />
              <Text className="text-white font-bold mt-2">New Product</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push("/vendor/wallet/withdraw")}
              className="flex-1 bg-white border border-system-blue-light rounded-[16px] p-4 items-center justify-center h-24"
            >
              <MaterialIcons name="account-balance-wallet" size={28} color={Colors.primary} />
              <Text className="text-system-blue-light font-bold mt-2">Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
