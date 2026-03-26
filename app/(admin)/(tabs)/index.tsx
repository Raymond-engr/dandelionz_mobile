import { useAppSelector } from "@/lib/hooks";
import { useGetAnalyticsQuery } from "@/lib/api/adminApi";
import { useRouter } from "expo-router";
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
import { Bell } from "lucide-react-native"; // Wait, I check if lucide-react-native is there.
// If not, I'll use @expo/vector-icons
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { LoadingSpinner } from "@/components/loading-spinner";

type StatCardProps = {
  label: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  isLoading?: boolean;
};

function StatCard({ label, value, change, icon, isLoading }: StatCardProps) {
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
          {icon}
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

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);
  const [period, setPeriod] = React.useState<
    "weekly" | "monthly" | "annual" | "custom"
  >("weekly");

  const { data: analyticsResponse, isLoading, isError, refetch } =
    useGetAnalyticsQuery({ period });

  const analytics = analyticsResponse?.data;

  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
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
            <Text className="text-[24px] font-semibold text-system-blue-dark">
              {user?.full_name?.split(" ")[0] || "Admin"}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.push("/(admin)/analytics")}>
              <Ionicons name="stats-chart-outline" size={24} color="#030482" />
            </TouchableOpacity>
            <TouchableOpacity className="relative">
              <Ionicons name="notifications-outline" size={24} color="#000011" />
              {unreadCount > 0 && (
                <View className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Selector */}
        <View className="px-4 mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {(["weekly", "monthly", "annual"] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full border mr-2 ${
                  period === p
                    ? "bg-gray-900 border-gray-900"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-xs ${
                    period === p ? "text-white" : "text-gray-600"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid Background Framer */}
        <View className="bg-system-divider p-4 min-h-[242px]">
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              label="Total Revenue"
              value={isLoading ? "..." : `₦${parseFloat(analytics?.total_revenue || "0").toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              change="+0.00%"
              icon={<Feather name="users" size={16} color="#16a34a" />}
              isLoading={isLoading}
            />
            <StatCard
              label="Total Vendors"
              value={isLoading ? "..." : analytics?.total_vendors || 0}
              change="+0.00%"
              icon={
                <MaterialCommunityIcons
                  name="store-outline"
                  size={18}
                  color="#2563eb"
                />
              }
              isLoading={isLoading}
            />
            <StatCard
              label="Total Orders"
              value={isLoading ? "..." : analytics?.total_orders || 0}
              change="+0.00%"
              icon={
                <Ionicons name="cart-outline" size={18} color="#ca8a04" />
              }
              isLoading={isLoading}
            />
            <StatCard
              label="Pending Orders"
              value={isLoading ? "..." : analytics?.pending_orders || 0}
              change="+0.00%"
              icon={<Feather name="package" size={16} color="#9333ea" />}
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
