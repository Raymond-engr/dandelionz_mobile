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
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

type TabStatus = 'successful' | 'pending' | 'processing' | 'failed' | 'cancelled';

export default function AdminVendorSettlements() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabStatus>('successful');
  
  const { data: response, isLoading, refetch } = useGetAllWithdrawalsQuery({ 
    status: activeTab,
    type: 'vendor'
  });
  const settlements = response?.data || [];

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
        Vendor Settlements
      </Text>
      <View className="w-10" />
    </View>
  );

  const TabButton = ({ status, label, colorClass }: { status: TabStatus, label: string, colorClass: string }) => (
    <Pressable
      onPress={() => setActiveTab(status)}
      className={`px-4 py-2 rounded-full mr-2 ${activeTab === status ? colorClass : 'bg-gray-100'}`}
    >
      <Text className={`text-[12px] font-bold ${activeTab === status ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-[21px]">
          <TabButton status="successful" label="Successful" colorClass="bg-green-600" />
          <TabButton status="pending" label="Pending" colorClass="bg-yellow-600" />
          <TabButton status="processing" label="Processing" colorClass="bg-blue-600" />
          <TabButton status="failed" label="Failed" colorClass="bg-red-600" />
          <TabButton status="cancelled" label="Cancelled" colorClass="bg-gray-600" />
        </ScrollView>
      </View>

      <Divider />

      <FlatList
        data={settlements}
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
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-10 h-10 bg-system-blue-light rounded-full items-center justify-center">
                    <Text className="text-white font-bold">{item.requestor_name.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-bold text-system-blue-dark">{item.requestor_name}</Text>
                    <Text className="text-[11px] text-gray-400 font-mono">{item.reference}</Text>
                  </View>
                </View>
                <Text className="text-[12px] text-gray-500">
                  {format(new Date(item.created_at), "MMM do, yyyy")}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-[16px] font-bold text-system-blue-dark">
                  ₦{formatCurrency(item.amount)}
                </Text>
                <View className={`mt-1 px-2 py-0.5 rounded-full ${
                  activeTab === 'successful' ? 'bg-green-100' : 
                  activeTab === 'pending' ? 'bg-yellow-100' : 
                  activeTab === 'processing' ? 'bg-blue-100' : 
                  activeTab === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <Text className={`text-[10px] font-bold uppercase ${
                    activeTab === 'successful' ? 'text-green-700' : 
                    activeTab === 'pending' ? 'text-yellow-700' : 
                    activeTab === 'processing' ? 'text-blue-700' : 
                    activeTab === 'failed' ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <Divider height={1} className="opacity-50" />
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20 px-10">
            <MaterialIcons name="money-off" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center">No {activeTab} settlements found.</Text>
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
