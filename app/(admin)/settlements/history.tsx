import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetAllPaymentsQuery } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminTransactionHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: response, isLoading, refetch } = useGetAllPaymentsQuery();
  const transactions = response?.data || [];

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
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        History
      </Text>
      <View className="w-10" />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20 px-[21px]">
      <MaterialIcons name="history" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4">No transactions</Text>
      <Text className="text-[14px] text-[#6B7280] text-center mt-2">
        There are no transaction records at the moment.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <View>
            <View className="p-[21px] flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                    <MaterialIcons name="receipt-long" size={16} color={Colors.primary} />
                  </View>
                  <Text className="text-[14px] font-bold text-system-blue-dark" numberOfLines={1}>
                    {item.order_uuid.slice(0, 8)}...
                  </Text>
                </View>
                <Text className="text-[12px] text-gray-500">{item.payment_method}</Text>
                <Text className="text-[11px] text-gray-400 mt-1">
                  {format(new Date(item.created_at), "MMM do, yyyy")}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-[16px] font-bold text-system-blue-dark">
                  ₦{formatCurrency(item.amount)}
                </Text>
                <View className={`mt-1 px-2 py-0.5 rounded-full ${item.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`text-[10px] font-bold uppercase ${item.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
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
