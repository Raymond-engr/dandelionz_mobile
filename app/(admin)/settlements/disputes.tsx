import { LoadingSpinner } from "@/components/loading-spinner";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useGetAllDisputesQuery,
  useResolveDisputeMutation,
} from "@/lib/api/adminApi";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type DisputeStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function AdminDisputesManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<DisputeStatus>("PENDING");

  const {
    data: response,
    isLoading,
    refetch,
  } = useGetAllDisputesQuery({ status: activeTab });
  const [resolveDispute] = useResolveDisputeMutation();
  const disputes = response?.data || [];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleResolve = async (id: string, action: "APPROVE" | "REJECT") => {
    Alert.alert(
      "Resolve Dispute",
      `Are you sure you want to ${action.toLowerCase()} this dispute?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          onPress: async () => {
            try {
              await resolveDispute({
                id,
                action,
                admin_note: `Admin ${action.toLowerCase()}d this dispute.`,
              }).unwrap();
              Toast.show({
                type: "success",
                text1: `Dispute ${action.toLowerCase()}d successfully.`,
              });
              refetch();
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Failed to resolve dispute.",
              });
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Disputes
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}

      <View className="flex-row px-[21px] py-4 gap-2">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <Pressable
            key={status}
            onPress={() => setActiveTab(status)}
            className={`flex-1 py-3 rounded-full items-center ${activeTab === status ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
          >
            <Text
              className={`text-[12px] font-bold ${activeTab === status ? "text-white" : "text-[#6B7280]"}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Divider />

      <FlatList
        data={disputes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View>
            <View className="p-[21px]">
              <View className="flex-row justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-system-blue-dark">
                    Order: {item.order_id}
                  </Text>
                  <Text className="text-[12px] text-gray-500 mt-1">
                    Customer: {item.customer_name}
                  </Text>
                  <Text className="text-[12px] text-gray-500">
                    Vendor: {item.vendor_name}
                  </Text>
                </View>
                <View className="items-end">
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      item.status === "APPROVED"
                        ? "bg-green-100"
                        : item.status === "REJECTED"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase ${
                        item.status === "APPROVED"
                          ? "text-green-700"
                          : item.status === "REJECTED"
                            ? "text-red-700"
                            : "text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-bold text-system-blue-dark mt-1">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              </View>

              <Text className="text-[11px] text-gray-400">
                {format(new Date(item.created_at), "MMM do, yyyy")}
              </Text>

              <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                <Text className="text-[12px] text-gray-600 italic">
                  &quot;{item.reason}&quot;
                </Text>
              </View>

              {activeTab === "PENDING" && (
                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    onPress={() => handleResolve(item.id, "APPROVE")}
                    className="flex-1 bg-green-600 py-3 rounded-xl items-center"
                  >
                    <Text className="text-white text-[13px] font-bold">
                      Approve
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleResolve(item.id, "REJECT")}
                    className="flex-1 bg-red-600 py-3 rounded-xl items-center"
                  >
                    <Text className="text-white text-[13px] font-bold">
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Divider height={1} className="opacity-50" />
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20 px-10">
            <MaterialIcons name="gavel" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center">
              No {activeTab.toLowerCase()} disputes found.
            </Text>
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
