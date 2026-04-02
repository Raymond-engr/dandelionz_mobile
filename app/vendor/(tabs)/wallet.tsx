import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { Colors } from "@/constants/theme";
import { useGetWalletBalanceQuery } from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";

function StatCard({
  label,
  value,
  bg,
  textColor = "text-system-blue-dark",
}: {
  label: string;
  value: string;
  bg: string;
  textColor?: string;
}) {
  return (
    <View className={`w-[48%] rounded-[12px] p-4 mb-3 h-[100px] justify-end ${bg}`}>
      <Text className={`text-[12px] mb-1 ${textColor === 'text-white' ? 'text-white/80' : 'text-gray-500'}`}>
        {label}
      </Text>
      <Text className={`text-[18px] font-bold ${textColor}`}>
        {value}
      </Text>
    </View>
  );
}

export default function VendorWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: walletData,
    isLoading,
    error,
    refetch,
  } = useGetWalletBalanceQuery();
  const stats = walletData?.data;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        style={{ paddingTop: insets.top }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View className="px-[21px] py-4">
          <Text className="text-[24px] font-bold text-system-blue-dark">Wallet</Text>
          <Text className="text-[14px] text-gray-500 mt-1">
            Manage your earnings and withdrawals
          </Text>
        </View>

        {/* Withdrawable Balance Card */}
        <View className="mx-[21px] bg-system-blue-light rounded-[16px] p-6 mb-4 shadow-lg shadow-blue-900/20">
          <Text className="text-white/80 text-[14px] font-medium mb-2 uppercase tracking-widest">Withdrawable Amount</Text>
          {isLoading ? (
            <Skeleton className="h-10 w-48 bg-white/20 rounded-md" />
          ) : (
            <Text className="text-white text-[32px] font-bold">
              {formatCurrency(stats?.withdrawable_balance)}
            </Text>
          )}
        </View>

        {/* Withdraw Button */}
        <Pressable
          onPress={() => router.push("/vendor/wallet/withdraw")}
          className="mx-[21px] bg-[#F5F7FA] rounded-[12px] h-[58px] flex-row items-center justify-center gap-3 mb-6"
        >
          <MaterialIcons name="file-download" size={24} color={Colors.primary} />
          <Text className="text-[18px] font-semibold text-system-blue-light">Withdraw Earnings</Text>
        </Pressable>

        <Divider height={11} className="mb-6" />

        {/* Overview */}
        <View className="px-[21px]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-bold text-system-blue-dark">Overview</Text>
            <Pressable onPress={() => router.push("/vendor/wallet/history" as any)}>
              <Text className="text-system-blue-light font-semibold">View History</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <StatCard
              label="Available Balance"
              value={formatCurrency(stats?.available_balance)}
              bg="bg-green-50"
            />
            <StatCard
              label="Total Earnings"
              value={formatCurrency(stats?.total_earnings)}
              bg="bg-blue-900"
              textColor="text-white"
            />
            <StatCard
              label="Pending Balance"
              value={formatCurrency(stats?.pending_balance)}
              bg="bg-yellow-50"
            />
            <StatCard
              label="This Month"
              value={formatCurrency(stats?.this_month_earnings)}
              bg="bg-purple-50"
            />
            <StatCard
              label="Total Withdrawals"
              value={String(stats?.total_withdrawals ?? 0)}
              bg="bg-gray-50"
            />
            <StatCard
              label="Pending Orders"
              value={String(stats?.pending_order_count ?? 0)}
              bg="bg-orange-50"
            />
          </View>

          <View className="flex-row justify-between mt-2">
            <StatCard
              label="Total Credits"
              value={formatCurrency(stats?.total_credits)}
              bg="bg-indigo-50"
            />
            <StatCard
              label="Total Debits"
              value={formatCurrency(stats?.total_debits)}
              bg="bg-red-50"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
