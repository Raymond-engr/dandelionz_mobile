import { useAppSelector } from "@/lib/hooks";
import { useGetDetailedAnalyticsQuery, AnalyticsQueryParams } from "@/lib/api/adminApi";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Line, Polyline, Circle } from "react-native-svg";
import { formatCurrency } from "@/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type StatCardProps = {
  label: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  iconBg: string;
  isLoading?: boolean;
};

function StatCard({ label, value, change, icon, iconBg, isLoading }: StatCardProps) {
  return (
    <View className="bg-white border border-gray-100 rounded-[12px] p-4 w-[48%] mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-[12px] font-normal text-gray-500">{label}</Text>
        <View className={`size-[32px] ${iconBg} rounded-[8px] items-center justify-center`}>
          {icon}
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color="#030482" />
      ) : (
        <Text className="text-[18px] font-bold text-gray-900 mb-1">{value}</Text>
      )}
      <Text className="text-[10px] text-green-500 font-medium">{change}</Text>
    </View>
  );
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<AnalyticsQueryParams>({ period: "annual" });
  const { data: analyticsResponse, isLoading, isError, refetch } = useGetDetailedAnalyticsQuery(filters);

  const analytics = analyticsResponse?.data;
  const salesData = analytics?.sales_chart_data || [];
  const maxValue = salesData.length > 0 ? Math.max(...salesData.map(d => parseFloat(d.sales || '0'))) : 0;

  const orderStats = analytics?.order_stats ? [
    { label: 'Completed', value: analytics.order_stats.completed, color: '#030482' },
    { label: 'Pending', value: analytics.order_stats.pending, color: '#8b5cf6' },
    { label: 'Cancelled', value: analytics.order_stats.cancelled, color: '#a78bfa' },
    { label: 'Returned', value: analytics.order_stats.returned, color: '#d1d5db' },
  ] : [];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-red-500 mb-4">Failed to load analytics</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-system-blue-light px-6 py-2 rounded-lg">
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Analytics</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#030482" />
        }
      >
        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard
            label="Total Sales"
            value={formatCurrency(analytics?.total_sales)}
            change="+0.00%"
            icon={<Feather name="trending-up" size={18} color="#16a34a" />}
            iconBg="bg-green-50"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Vendors"
            value={analytics?.total_vendors || 0}
            change="+0.00%"
            icon={<MaterialCommunityIcons name="store-outline" size={18} color="#2563eb" />}
            iconBg="bg-blue-50"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Orders"
            value={analytics?.total_orders || 0}
            change="+0.00%"
            icon={<Ionicons name="cart-outline" size={18} color="#ca8a04" />}
            iconBg="bg-yellow-50"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Users"
            value={analytics?.total_users || 0}
            change="+0.00%"
            icon={<Feather name="users" size={18} color="#9333ea" />}
            iconBg="bg-purple-50"
            isLoading={isLoading}
          />
        </View>

        {/* Sales Chart Section */}
        <View className="bg-white border border-gray-100 rounded-[12px] p-4 mb-6">
          <View className="mb-6">
            <Text className="text-[12px] text-gray-500 mb-1">Sales 2025</Text>
            <Text className="text-[24px] font-bold text-gray-900">
              {formatCurrency(analytics?.total_sales)}
            </Text>
            <Text className="text-[10px] text-green-500 font-medium">+0.5% vs LAST YEAR</Text>
          </View>

          {/* Period Selector Mini */}
          <View className="flex-row gap-2 mb-6 overflow-hidden">
            {(["weekly", "monthly", "annual"] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setFilters({ period: p })}
                className={`px-3 py-1 rounded-full border ${filters.period === p ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}
              >
                <Text className={`text-[10px] ${filters.period === p ? 'text-white' : 'text-gray-600'}`}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Line Chart Placeholder with SVG */}
          <View className="h-48 w-full">
            {isLoading ? (
               <ActivityIndicator size="large" color="#030482" style={{ marginTop: 60 }} />
            ) : salesData.length > 0 ? (
              <Svg height="180" width={SCREEN_WIDTH - 64}>
                {/* Horizontal Grid Lines */}
                {[0, 45, 90, 135, 180].map((y, i) => (
                  <Line key={i} x1="0" y1={y} x2={SCREEN_WIDTH - 64} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                ))}
                
                {/* Path */}
                <Polyline
                  points={salesData.map((d, i) => {
                    const x = (i * (SCREEN_WIDTH - 64)) / (salesData.length > 1 ? salesData.length - 1 : 1);
                    const y = 180 - (parseFloat(d.sales || '0') / (maxValue || 1)) * 160;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#030482"
                  strokeWidth="2"
                />

                {/* Points */}
                {salesData.map((d, i) => {
                  const x = (i * (SCREEN_WIDTH - 64)) / (salesData.length > 1 ? salesData.length - 1 : 1);
                  const y = 180 - (parseFloat(d.sales || '0') / (maxValue || 1)) * 160;
                  return (
                    <Circle key={i} cx={x} cy={y} r="4" fill="#030482" />
                  );
                })}
              </Svg>
            ) : (
               <View className="items-center justify-center flex-1">
                 <Text className="text-gray-400">No chart data available</Text>
               </View>
            )}
            <View className="flex-row justify-between mt-2">
               {salesData.map((d, i) => (
                 <Text key={i} className="text-[10px] text-gray-500">{d.period}</Text>
               ))}
            </View>
          </View>
        </View>

        {/* Order Statistics Donut Chart Section */}
        <View className="bg-white border border-gray-100 rounded-[12px] p-4">
          <Text className="text-sm font-semibold text-gray-900 mb-1">Statistics</Text>
          <Text className="text-base font-semibold text-gray-900 mb-4">Order</Text>

          <View className="items-center justify-center mb-6 relative">
            <Svg height="200" width="200" viewBox="0 0 200 200">
              <Circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="25" />
              {(() => {
                const total = orderStats.reduce((acc, curr) => acc + (curr.value || 0), 0);
                if (total === 0) return null;
                
                const circumference = 2 * Math.PI * 80;
                let currentOffset = 0;

                return orderStats.map((stat, i) => {
                  const percentage = (stat.value || 0) / total;
                  const strokeDasharray = `${percentage * circumference} ${circumference}`;
                  const strokeDashoffset = -currentOffset;
                  currentOffset += percentage * circumference;

                  return (
                    <Circle
                      key={i}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={stat.color}
                      strokeWidth="25"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 100 100)"
                    />
                  );
                });
              })()}
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
               <Text className="text-2xl font-bold text-gray-900">
                 {orderStats.reduce((acc, curr) => acc + (curr.value || 0), 0)}
               </Text>
               <Text className="text-[10px] text-gray-500">Total Orders</Text>
            </View>
          </View>

          {/* Legend */}
          <View className="gap-3">
             {orderStats.map((stat, idx) => (
               <View key={idx} className="flex-row items-center justify-between">
                 <View className="flex-row items-center gap-2">
                    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                    <Text className="text-sm text-gray-700">{stat.label}</Text>
                 </View>
                 <Text className="text-sm font-medium text-gray-600">{stat.value}</Text>
               </View>
             ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
