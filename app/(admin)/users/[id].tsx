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
import {
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
} from "@/lib/api/adminApi";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [action, setAction] = useState<"suspend" | "activate">("suspend");
  const [reason, setReason] = useState("");

  const { data: userResponse, isLoading, error, refetch } = useGetUserDetailsQuery(id!);
  const user = userResponse?.data;

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();

  useEffect(() => {
    if (user) {
      setAction(user.status === "ACTIVE" ? "suspend" : "activate");
    }
  }, [user]);

  const handleAction = async () => {
    if (!user) return;
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for this action.");
      return;
    }

    try {
      await updateUserStatus({ uuid: user.uuid, action, reason }).unwrap();
      Alert.alert("Success", `User successfully ${action === "suspend" ? "suspended" : "activated"}`);
      setReason("");
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to update user status");
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

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
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
