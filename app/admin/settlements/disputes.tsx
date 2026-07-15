import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import {
  useGetAdminRefundsQuery,
  useProcessAdminRefundMutation,
  RefundRequest,
} from "@/lib/api/adminApi";
import { apiError } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS = {
  PENDING: { bg: "#FEF3C7", text: "#D97706", label: "Pending" },
  APPROVED: { bg: "#D1FAE5", text: "#059669", label: "Approved" },
  REJECTED: { bg: "#FEE2E2", text: "#DC2626", label: "Rejected" },
};

export default function RefundDisputesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [refreshing, setRefreshing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);

  const queryParam = filter === "ALL" ? undefined : { status: filter as any };
  const { data, isLoading, refetch } = useGetAdminRefundsQuery(queryParam);
  const [processRefund, { isLoading: isProcessing }] = useProcessAdminRefundMutation();

  const refunds = data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = (refund: RefundRequest) => {
    Alert.alert(
      "Approve Refund",
      `Credit ₦${parseFloat(refund.amount).toLocaleString()} to ${refund.customer_name}'s wallet?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await processRefund({ refund_id: refund.id, action: "APPROVE" }).unwrap();
              Toast.show({ type: "success", text1: "Refund approved and wallet credited." });
              refetch();
            } catch (err: any) {
              Toast.show({ type: "error", text1: apiError(err, "Failed to approve refund.") });
            }
          },
        },
      ]
    );
  };

  const handleReject = async (refundId: number) => {
    if (!rejectionReason.trim()) {
      Toast.show({ type: "error", text1: "Please provide a rejection reason." });
      return;
    }
    try {
      await processRefund({
        refund_id: refundId,
        action: "REJECT",
        rejection_reason: rejectionReason,
      }).unwrap();
      Toast.show({ type: "success", text1: "Refund rejected. Customer notified." });
      setActiveRejectId(null);
      setRejectionReason("");
      refetch();
    } catch (err: any) {
      Toast.show({ type: "error", text1: apiError(err, "Failed to reject refund.") });
    }
  };

  const renderItem = ({ item }: { item: RefundRequest }) => {
    const color = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING;
    const isRejectingThis = activeRejectId === item.id;

    return (
      <View className="mx-[21px] mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-[15px] font-bold text-system-blue-dark" numberOfLines={1}>
              #{item.order_id.slice(0, 8)}
            </Text>
            <Text className="text-[12px] text-gray-500 mt-0.5">{item.customer_name}</Text>
            <Text className="text-[11px] text-gray-400">{item.customer_email}</Text>
          </View>
          <View>
            <View className="px-3 py-1 rounded-full mb-2" style={{ backgroundColor: color.bg }}>
              <Text className="text-[11px] font-bold" style={{ color: color.text }}>
                {color.label}
              </Text>
            </View>
            <Text className="text-[18px] font-bold text-system-blue-dark text-right">
              {formatCurrency(item.amount)}
            </Text>
          </View>
        </View>

        {item.reason ? (
          <Text className="text-[13px] text-gray-500 mb-3 italic">"{item.reason}"</Text>
        ) : null}

        <Text className="text-[11px] text-gray-400 mb-3">
          Requested {new Date(item.created_at).toLocaleDateString("en-NG", {
            day: "numeric", month: "short", year: "numeric",
          })}
          {item.processed_at ? ` · Processed ${new Date(item.processed_at).toLocaleDateString("en-NG", {
            day: "numeric", month: "short",
          })}` : ""}
        </Text>

        {item.status === "PENDING" && (
          <View>
            {isRejectingThis ? (
              <View className="gap-2">
                <TextInput
                  placeholder="Rejection reason (required)..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-system-blue-dark min-h-[70px]"
                  textAlignVertical="top"
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => { setActiveRejectId(null); setRejectionReason(""); }}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl items-center"
                  >
                    <Text className="text-gray-500 text-[13px] font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReject(item.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 bg-red-500 rounded-xl items-center"
                  >
                    <Text className="text-white text-[13px] font-bold">
                      {isProcessing ? "Rejecting…" : "Confirm Reject"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleApprove(item)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-system-blue-light rounded-xl items-center"
                >
                  <Text className="text-white text-[13px] font-bold">Approve & Credit Wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveRejectId(item.id)}
                  className="flex-1 py-2.5 border-2 border-red-200 rounded-xl items-center bg-red-50"
                >
                  <Text className="text-red-600 text-[13px] font-bold">Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          Refund Requests
        </Text>
        <View className="w-10">
          {data?.pending_count ? (
            <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{data.pending_count}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="flex-row px-[21px] py-3 gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`flex-1 py-2 rounded-full items-center border ${
              filter === f
                ? "bg-system-blue-light border-system-blue-light"
                : "bg-white border-gray-200"
            }`}
          >
            <Text className={`text-[11px] font-bold ${filter === f ? "text-white" : "text-gray-500"}`}>
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Divider />

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={refunds}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center pt-20 px-10">
              <MaterialIcons name="receipt-long" size={64} color="#D1D5DB" />
              <Text className="text-[18px] font-bold text-system-blue-dark mt-4">No refund requests</Text>
              <Text className="text-[14px] text-gray-500 text-center mt-2">
                {filter === "PENDING"
                  ? "No pending refunds at the moment."
                  : `No ${filter.toLowerCase()} refunds found.`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
