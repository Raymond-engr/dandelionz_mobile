import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetAllWithdrawalsQuery } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";

export default function AdminWithdrawalList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending");

  const { data: response, isLoading, refetch } = useGetAllWithdrawalsQuery({
    status: activeTab === "pending" ? "pending" : "successful",
  });
  const withdrawals = response?.data || [];

  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Withdrawals
      </Text>
      <View className="w-10" />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20 px-[21px]">
      <MaterialIcons name="account-balance-wallet" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4">No withdrawals</Text>
      <Text className="text-[14px] text-[#6B7280] text-center mt-2">
        There are no {activeTab} withdrawal requests at the moment.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      
      {/* Tabs */}
      <View className="flex-row px-[21px] py-4 gap-4">
        <Pressable
          onPress={() => setActiveTab("pending")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "pending" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${activeTab === "pending" ? "text-white" : "text-[#6B7280]"}`}>
            Pending
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("processed")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "processed" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${activeTab === "processed" ? "text-white" : "text-[#6B7280]"}`}>
            Processed
          </Text>
        </Pressable>
      </View>

      <Divider />

      <FlatList
        data={withdrawals}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onPress={() => router.push(`/admin/withdrawals/${item.id}` as any)}
              className="p-[21px] flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-system-blue-dark">
                  {formatCurrency(item.amount || "0")}
                </Text>
                <Text className="text-[13px] text-gray-500 mt-1">
                  {item.requestor_name || 'Unknown'} ({item.requestor_type || 'N/A'})
                </Text>
                <Text className="text-[11px] text-gray-400 mt-1">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No Date'} • {item.bank_name || 'No Bank'}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View className={`px-2 py-1 rounded-full mr-2 ${
                  item.status === 'pending' ? 'bg-yellow-100' : 
                  item.status === 'successful' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Text className={`text-[10px] font-bold ${
                    item.status === 'pending' ? 'text-yellow-700' : 
                    item.status === 'successful' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            <Divider height={1} className="opacity-50" />
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
