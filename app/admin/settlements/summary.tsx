import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetSettlementSummaryQuery } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

function SummaryCard({ label, value, icon, color }: SummaryCardProps) {
  const displayValue = (typeof value === 'number') ? value : formatCurrency(value);

  return (
    <View className="bg-white border border-gray-100 rounded-[12px] p-[21px] mb-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">{label}</Text>
        <View className={`w-12 h-12 rounded-full items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
      </View>
      <Text className="text-[28px] font-bold text-system-blue-dark">
        {displayValue}
      </Text>
    </View>
  );
}

export default function AdminSettlementSummary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: response, isLoading, isError, refetch } = useGetSettlementSummaryQuery();

  const summary = response?.data;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Summary
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />
      
      <ScrollView 
        className="flex-1 bg-gray-50/30"
        contentContainerStyle={{ padding: 21, paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <SummaryCard 
          label="Total Revenue" 
          value={summary?.total_revenue || "0"} 
          icon="payments" 
          color="#16a34a" 
        />
        
        <SummaryCard 
          label="Total Payouts" 
          value={summary?.total_payouts || "0"} 
          icon="account-balance-wallet" 
          color={Colors.primary} 
        />
        
        <SummaryCard 
          label="Pending Settlements" 
          value={summary?.pending_settlements || "0"} 
          icon="pending-actions" 
          color="#ca8a04" 
        />
        
        <SummaryCard 
          label="Upcoming Payouts" 
          value={summary?.upcoming_payouts || 0} 
          icon="schedule" 
          color="#9333ea" 
        />

        <View className="mt-4 p-6 bg-blue-50/50 rounded-[12px] border border-blue-100">
           <Text className="text-[16px] font-semibold text-system-blue-dark mb-2">Financial Insights</Text>
           <Text className="text-[14px] text-gray-600 leading-5">
             You have {summary?.upcoming_payouts || 0} payout requests scheduled for the next 24 hours. Ensure vendor KYC is fully verified before processing.
           </Text>
        </View>
      </ScrollView>
    </View>
  );
}
