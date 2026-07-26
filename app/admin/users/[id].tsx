import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiError } from "@/lib/utils";
import {
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
  useGetCustomerRefundProfileQuery,
  useReviewRefundFlagMutation,
} from "@/lib/api/adminApi";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Toast from "react-native-toast-message";

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [action, setAction] = useState<"suspend" | "activate">("suspend");
  const [reason, setReason] = useState("");

  const { data: userResponse, isLoading, error, refetch } = useGetUserDetailsQuery(id!);
  const user = userResponse?.data;

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();

  const {
    data: refundResponse,
    isLoading: isRefundLoading,
    refetch: refetchRefund,
  } = useGetCustomerRefundProfileQuery(id!);
  const refund = refundResponse?.data;

  const [reviewRefundFlag, { isLoading: isReviewing }] = useReviewRefundFlagMutation();

  const handleReviewRefundFlag = () => {
    if (!refund) return;
    Alert.alert(
      "Mark as reviewed?",
      "This clears the review flag until this customer refunds more orders. It does not block, restrict, or penalise the customer in any way.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark reviewed",
          onPress: async () => {
            try {
              await reviewRefundFlag(refund.uuid).unwrap();
              Toast.show({
                type: "success",
                text1: "Marked reviewed",
                text2: "This customer's refund flag has been cleared.",
              });
              refetchRefund();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: apiError(err, "Failed to mark as reviewed"),
              });
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (user) {
      setAction(user.status === "ACTIVE" ? "suspend" : "activate");
    }
  }, [user]);

  const handleAction = async () => {
    if (!user) return;
    if (!reason.trim()) {
      Toast.show({ type: "error", text1: "Error", text2: "Please provide a reason for this action." });
      return;
    }

    try {
      await updateUserStatus({ uuid: user.uuid, action, reason }).unwrap();
      Toast.show({ 
        type: "success", 
        text1: "Success", 
        text2: `User successfully ${action === "suspend" ? "suspended" : "activated"}` 
      });
      setReason("");
      refetch();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Failed to update user status")
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-system-red text-center mb-4">Failed to load user details.</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const initials = user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-4">
      <Text className="text-[14px] text-[#00001180] mb-1">{label}</Text>
      <Text className="text-[16px] font-medium text-system-blue-dark">{value || "N/A"}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Feather name="chevron-left" size={32} color="#030482" />
        </TouchableOpacity>
        <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
          User Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Profile Info */}
        <View className="flex-row items-center p-[21px]">
          <View className="w-[91px] h-[91px] rounded-full bg-system-blue-light items-center justify-center">
            <Text className="text-white text-[32px] font-bold">{initials}</Text>
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-[20px] font-bold text-system-blue-dark mb-1">
              {user.full_name || "Unnamed User"}
            </Text>
            <Text className="text-[14px] text-[#00001180] mb-3">{user.email}</Text>
            <View className="flex-row gap-2">
              <View className={`px-3 py-1 rounded-full ${user.status === 'ACTIVE' ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'}`}>
                <Text className={`text-[12px] font-bold ${user.status === 'ACTIVE' ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                  {user.status === 'ACTIVE' ? "Active" : "Suspended"}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-[#dbeafe]">
                <Text className="text-[12px] font-bold text-[#1d4ed8]">{user.role}</Text>
              </View>
            </View>
          </View>
        </View>

        <Divider height={11} />

        {/* Stats Grid */}
        <View className="p-[21px] flex-row gap-4">
          <View className="flex-1 bg-[rgba(77,255,151,0.1)] p-4 rounded-xl border border-[rgba(77,255,151,0.2)]">
            <Text className="text-[12px] text-[#207d47] font-bold uppercase mb-1">Total Spend</Text>
            <Text className="text-[20px] font-bold text-system-blue-dark">{formatCurrency(user.total_spend)}</Text>
          </View>
          <View className="flex-1 bg-[rgba(3,4,130,0.1)] p-4 rounded-xl border border-[rgba(3,4,130,0.2)]">
            <Text className="text-[12px] text-[#030482] font-bold uppercase mb-1">Total Orders</Text>
            <Text className="text-[20px] font-bold text-system-blue-dark">{user.total_orders || '0'}</Text>
          </View>
        </View>

        <Divider height={11} />

        {/* Personal Information */}
        <View className="p-[21px]">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-5">Personal Information</Text>
          <InfoField label="Email Address" value={user.email} />
          <InfoField label="Phone Number" value={user.phone_number} />
          <InfoField label="Registration Date" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ""} />
          <InfoField label="Address" value={user.address || ""} />
        </View>

        <Divider height={11} />

        {/* Refund history (review-only signal; never blocks the customer) */}
        <View className="p-[21px]">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[18px] font-bold text-system-blue-dark">
              Refund history
            </Text>
            {refund?.needs_review && (
              <View className="flex-row items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                <Ionicons name="flag" size={13} color="#b45309" />
                <Text className="text-[11px] font-bold text-amber-700 ml-1.5">
                  Flagged for review
                </Text>
              </View>
            )}
          </View>
          <Text className="text-[13px] text-[#00001180] mb-5">
            Review signal only — this never blocks or restricts the customer.
          </Text>

          {isRefundLoading ? (
            <ActivityIndicator color="#030482" style={{ marginVertical: 12 }} />
          ) : refund ? (
            <>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-[#F5F7FA] p-4 rounded-xl border border-gray-100">
                  <Text className="text-[11px] text-[#6B7280] font-bold uppercase mb-1">
                    Paid orders
                  </Text>
                  <Text className="text-[20px] font-bold text-system-blue-dark">
                    {refund.paid_orders}
                  </Text>
                </View>
                <View className="flex-1 bg-[#F5F7FA] p-4 rounded-xl border border-gray-100">
                  <Text className="text-[11px] text-[#6B7280] font-bold uppercase mb-1">
                    Refunds
                  </Text>
                  <Text className="text-[20px] font-bold text-system-blue-dark">
                    {refund.refund_count}
                  </Text>
                </View>
                <View
                  className={`flex-1 p-4 rounded-xl border ${
                    refund.needs_review
                      ? "bg-amber-50 border-amber-200"
                      : "bg-[#F5F7FA] border-gray-100"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold uppercase mb-1 ${
                      refund.needs_review ? "text-amber-700" : "text-[#6B7280]"
                    }`}
                  >
                    Refund rate
                  </Text>
                  <Text
                    className={`text-[20px] font-bold ${
                      refund.needs_review ? "text-amber-700" : "text-system-blue-dark"
                    }`}
                  >
                    {(refund.refund_rate * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              {refund.needs_review ? (
                <>
                  <Text className="text-[13px] text-[#6B7280] leading-5 mt-4">
                    This customer refunds a high share of their paid orders
                    (threshold: {refund.thresholds.min_orders}+ orders,{" "}
                    {refund.thresholds.min_refunds}+ refunds, over{" "}
                    {(refund.thresholds.rate * 100).toFixed(0)}%). Review their
                    orders and mark reviewed once you have looked into it.
                  </Text>
                  <TouchableOpacity
                    onPress={handleReviewRefundFlag}
                    disabled={isReviewing}
                    className={`h-[55px] rounded-[12px] items-center justify-center mt-4 ${
                      isReviewing ? "bg-gray-300" : "bg-system-blue-light"
                    }`}
                  >
                    {isReviewing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-[16px] font-bold">
                        Mark reviewed
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <Text className="text-[13px] text-[#6B7280] leading-5 mt-4">
                  {refund.reviewed_count > 0
                    ? `No action needed. Reviewed ${refund.reviewed_count} time${
                        refund.reviewed_count === 1 ? "" : "s"
                      } so far.`
                    : "No action needed — this customer's refund activity is within normal range."}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-[14px] text-[#6B7280]">
              No refund data available for this customer.
            </Text>
          )}
        </View>

        <Divider height={11} />

        {/* Account Management */}
        <View className="p-[21px]">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-2">Account Management</Text>
          <Text className="text-[14px] text-[#00001180] mb-5">
            {user.status === "ACTIVE"
              ? "Suspending this user will prevent them from logging in and performing any activities."
              : "Activating this user will restore their access to the platform."}
          </Text>

          <View className="mb-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Reason for action
            </Text>
            <TextInput
              placeholder="Provide a reason..."
              value={reason}
              onChangeText={setReason}
              className="bg-[#F5F7FA] p-4 rounded-xl border border-gray-100 min-h-[120px] text-[15px] text-system-blue-dark"
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            onPress={handleAction}
            disabled={isUpdating || !reason.trim()}
            className={`h-[55px] rounded-[12px] items-center justify-center ${
              isUpdating || !reason.trim() 
                ? "bg-gray-300" 
                : (user.status === "ACTIVE" ? "bg-red-600" : "bg-system-blue-light")
            }`}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-[16px] font-bold">
                {user.status === "ACTIVE" ? "Suspend User" : "Activate User"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Suspension History */}
        {user.suspension_history && user.suspension_history.length > 0 && (
          <>
            <Divider height={11} />
            <View className="p-[21px]">
              <Text className="text-[18px] font-bold text-system-blue-dark mb-5">Activity History</Text>
              {user.suspension_history.map((item: any) => (
                <View key={item.id} className="bg-[#F5F7FA] p-4 rounded-xl border border-gray-50 mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className={`px-2 py-0.5 rounded ${item.action === 'SUSPEND' ? 'bg-red-100' : 'bg-green-100'}`}>
                      <Text className={`text-[10px] font-bold ${item.action === 'SUSPEND' ? 'text-red-700' : 'text-green-700'}`}>
                        {item.action}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Text className="text-[14px] text-system-blue-dark leading-5 mb-2 italic">&quot;{item.reason}&quot;</Text>
                  <Text className="text-[11px] text-[#6B7280]">Admin: {item.admin_email}</Text>
                </View>
              )).reverse()}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
