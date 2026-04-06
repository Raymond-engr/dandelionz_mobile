import { useGetAnalyticsQuery } from "@/lib/api/adminApi";
import { useAppSelector } from "@/lib/hooks";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  isLoading?: boolean;
};

function StatCard({
  label,
  value,
  icon,
  iconBg,
  isLoading,
  change = "+0.00%",
}: StatCardProps & { change?: string }) {
  return (
    <View className="bg-white h-[110px] rounded-[12px] p-4 w-[48%] mb-4 justify-between border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center">
        <Text className="text-[14px] font-medium text-gray-500">{label}</Text>
        <View
          className="w-[29px] h-[29px] rounded-[6px] items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </View>
      </View>
      <View>
        {isLoading ? (
          <ActivityIndicator size="small" color="#030482" />
        ) : (
          <>
            <Text className="text-[20px] font-bold text-system-blue-dark">
              {value}
            </Text>
            <Text className="text-[12px] text-green-600 font-medium mt-1">
              {change}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  // Default to "annual" to match the analytics page behaviour
  const [period, setPeriod] = useState<"weekly" | "monthly" | "annual">(
    "annual",
  );
  const {
    data: analyticsResponse,
    isLoading,
    refetch,
  } = useGetAnalyticsQuery({ period });

  const analytics = analyticsResponse?.data;
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        {/* Header & Bell */}
        <View className="px-4 pt-6 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-[16px] text-gray-500 mb-1">
              Welcome back,
            </Text>
            <Text className="text-[24px] font-bold text-system-blue-dark">
              Admin
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(admin)/account/notifications" as any)}
            className="w-10 h-10 items-center justify-center bg-[#F5F7FA] rounded-full"
          >
            <Ionicons name="notifications-outline" size={22} color="#030482" />
            {unreadCount > 0 && (
              <View className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Top Filter Tabs */}
        <View className="px-4 mb-6">
          <View className="flex-row bg-gray-100 p-1 rounded-xl">
            {(["weekly", "monthly", "annual"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  period === p ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-[13px] font-bold ${period === p ? "text-system-blue-dark" : "text-gray-500"}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-4">
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              label="Total Revenue"
              value={`₦${parseFloat(analytics?.total_revenue || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<Feather name="trending-up" size={14} color="#16a34a" />}
              iconBg="#DCFCE7"
              isLoading={isLoading}
              change="+0.00%"
            />
            <StatCard
              label="Total Vendors"
              value={analytics?.total_vendors || 0}
              icon={
                <MaterialCommunityIcons
                  name="store-outline"
                  size={16}
                  color="#2563eb"
                />
              }
              iconBg="#DBEAFE"
              isLoading={isLoading}
              change="+0.00%"
            />
            <StatCard
              label="Total Orders"
              value={analytics?.total_orders || 0}
              icon={<Ionicons name="cart-outline" size={16} color="#ca8a04" />}
              iconBg="#FEF3C7"
              isLoading={isLoading}
              change="+0.00%"
            />
            <StatCard
              label="Pending Orders"
              value={analytics?.pending_orders || 0}
              icon={<Feather name="clock" size={14} color="#9333ea" />}
              iconBg="#F3E8FF"
              isLoading={isLoading}
              change="+0.00%"
            />
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(admin)/(tabs)/orders")}
              className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                  <Feather name="package" size={20} color="#2563eb" />
                </View>
                <Text className="text-[16px] font-medium text-system-blue-dark">
                  Manage Orders
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(admin)/(tabs)/vendor")}
              className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                  <MaterialCommunityIcons
                    name="store-outline"
                    size={20}
                    color="#16a34a"
                  />
                </View>
                <Text className="text-[16px] font-medium text-system-blue-dark">
                  Manage Vendors
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
