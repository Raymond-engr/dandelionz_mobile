import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { useGetAllVendorsQuery, Vendor } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCardSkeleton } from "@/components/StatCardSkeleton";

export default function AdminVendors() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: vendorsResponse, isLoading, refetch } = useGetAllVendorsQuery();
  const vendors = vendorsResponse?.data || [];
  
  const activeVendors = vendors.filter((v) => v.is_active).length;
  const suspendedVendors = vendors.filter((v) => !v.is_active).length;

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const renderHeader = () => (
    <View>
      <View className="px-[21px] py-4">
        <Text className="text-[24px] font-semibold text-system-blue-dark text-center">Manage Vendors</Text>
      </View>
      
      <Divider />

      <View className="p-4">
        <Text className="text-[16px] text-system-blue-dark font-normal mb-4">
          Approve, suspend and deactivate your vendors
        </Text>

        {/* Total Vendors Card */}
        <View className="bg-system-blue-light h-[101px] rounded-[12px] p-4 mb-4 flex-row items-center justify-between shadow-sm">
          <View>
            <Text className="text-[14px] text-white opacity-90 mb-1">Total Vendors</Text>
            {isLoading ? (
              <View className="h-10 w-16 bg-white/20 rounded" />
            ) : (
              <Text className="text-[32px] font-bold text-white">{vendors.length}</Text>
            )}
          </View>
          <MaterialIcons name="storefront" size={48} color="white" style={{ opacity: 0.8 }} />
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[rgba(77,255,151,0.25)] rounded-[12px] p-4">
            <Text className="text-[14px] text-[#207d47] font-medium mb-1">Active Vendors</Text>
            {isLoading ? (
              <View className="h-8 w-12 bg-green-200/50 rounded" />
            ) : (
              <Text className="text-[24px] font-bold text-[#000011]">{activeVendors}</Text>
            )}
          </View>
          <View className="flex-1 bg-[rgba(255,77,77,0.25)] rounded-[12px] p-4">
            <Text className="text-[14px] text-[#760303] font-medium mb-1">Suspended Vendors</Text>
            {isLoading ? (
              <View className="h-8 w-12 bg-red-200/50 rounded" />
            ) : (
              <Text className="text-[24px] font-bold text-[#000011]">{suspendedVendors}</Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[18px] font-bold text-system-blue-dark">All Vendors</Text>
          <TouchableOpacity>
            <MaterialIcons name="filter-list" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Divider height={11} />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20 px-[21px]">
      <MaterialIcons name="storefront" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4">No vendors found</Text>
      <Text className="text-[14px] text-[#6B7280] text-center mt-2">
        There are currently no registered vendors on the platform.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.user_uuid}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => {
          const initials = item.store_name?.slice(0, 2).toUpperCase() || "V";
          
          return (
            <View>
              <TouchableOpacity
                onPress={() => router.push(`/(admin)/vendor/${item.user_uuid}` as any)}
                className="p-[21px] flex-row items-center bg-white"
              >
                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
                  <Text className="text-system-blue-light font-bold text-[16px]">{initials}</Text>
                </View>
                
                <div className="flex-1 ml-4 min-w-0">
                  <Text className="text-[16px] font-bold text-system-blue-dark" numberOfLines={1}>
                    {item.store_name}
                  </Text>
                  <Text className="text-[13px] text-[#6B7280]" numberOfLines={1}>{item.email}</Text>
                  <View className="flex-row items-center mt-1 gap-2">
                    <View className={`px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Text className={`text-[10px] font-bold ${item.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {item.is_active ? 'Active' : 'Suspended'}
                      </Text>
                    </View>
                    {!item.is_verified_vendor && (
                      <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-yellow-700">Pending KYC</Text>
                      </View>
                    )}
                  </View>
                </div>
                
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
              <Divider height={11} className="opacity-100" />
            </View>
          );
        }}
      />
      
      {isLoading && !refreshing && (
        <View className="absolute inset-0 bg-white/50 items-center justify-center">
          <StatCardSkeleton />
        </View>
      )}
    </View>
  );
}
