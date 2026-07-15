import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetWithdrawalDetailQuery, useApproveWithdrawalMutation, useRejectWithdrawalMutation } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiError, formatCurrency } from "@/lib/utils";
import Toast from "react-native-toast-message";

export default function AdminWithdrawalDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetWithdrawalDetailQuery(id || "");
  const withdrawal = response?.data;

  const [approve, { isLoading: isApproving }] = useApproveWithdrawalMutation();
  const [reject, { isLoading: isRejecting }] = useRejectWithdrawalMutation();

  const handleApprove = async () => {
    Alert.alert(
      "Approve Withdrawal",
      "Are you sure you want to approve this withdrawal request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Approve", 
          onPress: async () => {
            try {
              await approve({ withdrawal_id: id! }).unwrap();
              Toast.show({ type: "success", text1: "Withdrawal approved successfully." });
              router.back();
            } catch (err: any) {
              Toast.show({ 
                type: "error", 
                text1: "Error", 
                text2: apiError(err, "Failed to approve withdrawal.")
              });
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    Alert.prompt(
      "Reject Withdrawal",
      "Please enter the reason for rejection:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: async (reason?: string) => {
            if (!reason) {
              Toast.show({ type: "error", text1: "A reason is required to reject a withdrawal." });
              return;
            }
            try {
              await reject({ withdrawal_id: id!, reason }).unwrap();
              Toast.show({ type: "success", text1: "Withdrawal rejected." });
              router.back();
            } catch (err: any) {
              Toast.show({ 
                type: "error", 
                text1: "Error", 
                text2: apiError(err, "Failed to reject withdrawal.")
              });
            }
          }
        }
      ],
      "plain-text"
    );
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Request Details
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

  if (isError || !withdrawal) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-[21px]">
          <Text className="text-red-500 text-center mb-4 text-[16px]">
            Failed to load withdrawal details.
          </Text>
          <Button variant="outline" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Summary Card */}
        <View className="px-[21px] py-8 items-center bg-gray-50/30">
          <Text className="text-[14px] text-gray-500 uppercase tracking-widest mb-2">Amount</Text>
          <Text className="text-[36px] font-bold text-system-blue-dark">
            {formatCurrency(withdrawal.amount)}
          </Text>
          <View className={`mt-4 px-4 py-1.5 rounded-full ${
            withdrawal.status === 'pending' ? 'bg-yellow-100' : 
            withdrawal.status === 'successful' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Text className={`text-[12px] font-bold ${
              withdrawal.status === 'pending' ? 'text-yellow-700' : 
              withdrawal.status === 'successful' ? 'text-green-700' : 'text-red-700'
            }`}>
              {withdrawal.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Divider height={11} />

        {/* Requestor Info */}
        <View className="p-[21px]">
          <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-4">Requestor</Text>
          <View className="bg-white border border-gray-100 rounded-[12px] p-4">
            <View className="flex-row justify-between py-2 border-b border-gray-50">
              <Text className="text-[14px] text-gray-500">Name</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">{withdrawal.requestor_name}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-50">
              <Text className="text-[14px] text-gray-500">Email</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">{withdrawal.requestor_email}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[14px] text-gray-500">User Type</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">{withdrawal.requestor_type}</Text>
            </View>
          </View>
        </View>

        {/* Bank Info */}
        <View className="p-[21px] pt-0">
          <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-4">Bank Details</Text>
          <View className="bg-white border border-gray-100 rounded-[12px] p-4">
            <View className="flex-row justify-between py-2 border-b border-gray-50">
              <Text className="text-[14px] text-gray-500">Bank Name</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">{withdrawal.bank_name}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-50">
              <Text className="text-[14px] text-gray-500">Account Number</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">{withdrawal.account_number}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[14px] text-gray-500">Account Name</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">{withdrawal.account_name}</Text>
            </View>
          </View>
        </View>

        {/* Reference & Date */}
        <View className="px-[21px] pb-8">
           <Text className="text-[12px] text-gray-400 text-center">
             Ref: {withdrawal.reference} • Requested on {new Date(withdrawal.created_at).toLocaleString()}
           </Text>
        </View>

        {withdrawal.status === "pending" && (
          <View className="px-[21px] mt-4 gap-4">
             <Divider height={1} className="mb-4 opacity-30" />
             <Button 
               onPress={handleApprove} 
               isLoading={isApproving}
               className="bg-green-600"
             >
               Approve Withdrawal
             </Button>
             <Button 
               onPress={handleReject} 
               isLoading={isRejecting}
               variant="outline"
               className="border-red-500"
             >
               <Text className="text-red-500">Reject Request</Text>
             </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
