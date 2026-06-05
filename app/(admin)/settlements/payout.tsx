import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetPayoutHistoryQuery } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminPayoutManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"paid" | "pending">("paid");
  
  // Note: Backend might need status filter if it supports it, currently using general payout history
  const { data: response, isLoading, refetch } = useGetPayoutHistoryQuery();
  const payouts = response?.data || [];

  const [refreshing, setRefreshing] = useState(false);

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
        Payouts
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      
      <View className="flex-row px-[21px] py-4 gap-4">
        <Pressable
          onPress={() => setActiveTab("paid")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "paid" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${activeTab === "paid" ? "text-white" : "text-[#6B7280]"}`}>
            Paid
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("pending")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "pending" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${activeTab === "pending" ? "text-white" : "text-[#6B7280]"}`}>
            Pending
          </Text>
        </Pressable>
      </View>

      <Divider />

      <FlatList
        data={payouts.filter(p => activeTab === 'paid' ? p.status === 'successful' : p.status === 'pending')}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/withdrawals/${item.id}` as any)}
              className="p-[21px] flex-row items-center justify-between"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-1">
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                    <Text className="text-system-blue-light font-bold">{(item.vendor_name || 'V').substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text className="text-[14px] font-bold text-system-blue-dark">{item.vendor_name || 'Vendor'}</Text>
                </View>
                <Text className="text-[12px] text-gray-500">
                  {format(new Date(item.created_at), "MMM do, yyyy")}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-[16px] font-bold text-system-blue-dark">
                  {formatCurrency(item.amount)}
                </Text>
                <View className={`mt-1 px-3 py-1 rounded-full ${activeTab === 'paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-[10px] font-bold uppercase ${activeTab === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
                    {activeTab === 'paid' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <Divider height={1} className="opacity-50" />
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20 px-10">
            <MaterialIcons name="payments" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center">No {activeTab} payouts found.</Text>
          </View>
        )}
      />
      
      {isLoading && !refreshing && (
        <View className="absolute inset-0 bg-white/50 items-center justify-center">
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}
