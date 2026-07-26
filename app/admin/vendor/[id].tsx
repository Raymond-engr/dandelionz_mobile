import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetVendorDetailsQuery,
  useApproveVendorMutation,
  useVerifyVendorKYCMutation,
  useSuspendVendorMutation,
  useSetVendorCommissionMutation,
} from "@/lib/api/adminApi";
import { apiError } from "@/lib/utils";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { Divider } from "@/components/ui/divider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import Toast from "react-native-toast-message";

export default function VendorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: vendorResponse, isLoading, error, refetch } = useGetVendorDetailsQuery(id!);
  const vendor = vendorResponse?.data;

  const [approveVendor, { isLoading: isApproving }] = useApproveVendorMutation();
  const [verifyKYC, { isLoading: isVerifying }] = useVerifyVendorKYCMutation();
  const [suspendVendor, { isLoading: isSuspending }] = useSuspendVendorMutation();
  const [setVendorCommission, { isLoading: isSavingCommission }] = useSetVendorCommissionMutation();

  const [action, setAction] = useState("");
  // Held as a percent string (e.g. "8") for the operator; converted to a decimal for the API.
  const [commissionInput, setCommissionInput] = useState("");

  useEffect(() => {
    if (vendor?.commission_rate != null && vendor.commission_rate !== "") {
      setCommissionInput(String(Math.round(parseFloat(vendor.commission_rate) * 100 * 100) / 100));
    } else {
      setCommissionInput("");
    }
  }, [vendor?.commission_rate]);

  const handleSaveCommission = async (clear = false) => {
    if (!vendor) return;
    let value: number | null = null;
    if (!clear && commissionInput.trim() !== "") {
      const pct = parseFloat(commissionInput);
      if (isNaN(pct) || pct < 0 || pct > 10) {
        Toast.show({ type: "error", text1: "Enter a commission between 0 and 10%." });
        return;
      }
      value = Math.round(pct * 10) / 1000; // percent -> decimal, 3 dp
    }
    try {
      const res = await setVendorCommission({ uuid: id!, commission_rate: value }).unwrap();
      Toast.show({
        type: "success",
        text1: value === null ? "Reset to platform default" : "Commission updated",
        text2: `Now ${res.data.effective_rate_label}.`,
      });
      refetch();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: apiError(err, "Could not update commission.") });
    }
  };

  const availableActions = React.useMemo(() => {
    if (!vendor) return [];
    const actions = [];
    if (!vendor.is_active) actions.push("Approve Vendor");
    if (vendor.is_active) actions.push("Suspend Vendor");
    if (vendor.is_active) actions.push("Reject Vendor");
    if (!vendor.is_verified_vendor) actions.push("Verify KYC");
    return actions;
  }, [vendor]);

  useEffect(() => {
    if (availableActions.length > 0 && !action) {
      setAction(availableActions[0]);
    }
  }, [availableActions]);

  const handleConfirmAction = async () => {
    if (!vendor) return;

    try {
      if (action === "Approve Vendor") {
        await approveVendor({ user_uuid: id!, approve: true }).unwrap();
        Toast.show({ type: "success", text1: "Vendor approved successfully" });
      } else if (action === "Suspend Vendor") {
        await approveVendor({ user_uuid: id!, approve: false }).unwrap();
        Toast.show({ type: "success", text1: "Vendor suspended successfully" });
      } else if (action === "Reject Vendor") {
        await approveVendor({ user_uuid: id!, approve: false }).unwrap();
        Toast.show({ type: "success", text1: "Vendor rejected successfully" });
      } else if (action === "Verify KYC") {
        await verifyKYC({ user_uuid: id!, approve: true }).unwrap();
        Toast.show({ type: "success", text1: "Vendor KYC verified successfully" });
      }
      refetch();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Failed to perform action")
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

  if (error || !vendor) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-red-500 mb-4">Failed to load vendor details.</Text>
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="bg-system-blue-light px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isProcessing = isApproving || isVerifying || isSuspending;

  const InfoField = ({ label, value }: { label: string; value: string | undefined }) => (
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
          Vendor Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Profile Info */}
        <View className="flex-row items-center p-[21px]">
          <View className="w-[91px] h-[91px] rounded-full bg-system-blue-light items-center justify-center">
            <Text className="text-white text-[32px] font-bold">
              {vendor.store_name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-[20px] font-bold text-system-blue-dark mb-1">
              {vendor.store_name}
            </Text>
            <Text className="text-[14px] text-[#00001180] mb-3">{vendor.email}</Text>
            <View className="flex-row gap-2">
              <View className={`px-3 py-1 rounded-full ${vendor.is_active ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'}`}>
                <Text className={`text-[12px] font-bold ${vendor.is_active ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                  {vendor.is_active ? "Active" : "Suspended"}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${vendor.is_verified_vendor ? 'bg-[#dbeafe]' : 'bg-[#fef9c3]'}`}>
                <Text className={`text-[12px] font-bold ${vendor.is_verified_vendor ? 'text-[#1d4ed8]' : 'text-[#a16207]'}`}>
                  {vendor.is_verified_vendor ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Divider height={11} />

        {/* Business Information */}
        <View className="p-[21px]">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-5">Business Information</Text>
          <InfoField label="Full Name" value={vendor.full_name} />
          <InfoField label="Phone Number" value={vendor.phone_number} />
          <InfoField label="Reg. Number" value={vendor.business_registration_number} />
          <InfoField label="Joined Date" value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ""} />
          <InfoField label="Address" value={vendor.address} />
        </View>

        <Divider height={11} />

        {/* Payment Details */}
        <View className="p-[21px]">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-5">Payment Details</Text>
          <InfoField label="Bank Name" value={vendor.bank_name} />
          <InfoField label="Account Number" value={vendor.account_number} />
          {vendor.recipient_code && <InfoField label="Recipient Code" value={vendor.recipient_code} />}
        </View>

        <Divider height={11} />

        {/* Commission */}
        <View className="p-[21px]">
          <Text className="text-[18px] font-bold text-system-blue-dark mb-2">Commission</Text>
          <Text className="text-[13px] text-[#00001180] mb-4">
            Platform commission on this vendor&apos;s sales. Currently{" "}
            <Text className="font-bold text-system-blue-dark">
              {vendor.commission_rate != null && vendor.commission_rate !== ""
                ? `${(parseFloat(vendor.commission_rate) * 100).toString()}% (custom)`
                : "10% (platform default)"}
            </Text>
            . A per-product override, where set, takes precedence. Maximum 10%.
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center border border-gray-300 rounded-[12px] px-4 h-[55px]">
              <TextInput
                value={commissionInput}
                onChangeText={setCommissionInput}
                keyboardType="decimal-pad"
                placeholder="Default (10)"
                placeholderTextColor="#9CA3AF"
                editable={!isSavingCommission}
                className="flex-1 text-[16px] text-system-blue-dark"
              />
              <Text className="text-[16px] text-gray-400 ml-1">%</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleSaveCommission(false)}
              disabled={isSavingCommission}
              className={`h-[55px] px-5 rounded-[12px] items-center justify-center ${isSavingCommission ? "bg-gray-300" : "bg-system-blue-light"}`}
            >
              {isSavingCommission ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[15px] font-bold">Save</Text>
              )}
            </TouchableOpacity>
          </View>
          {vendor.commission_rate != null && vendor.commission_rate !== "" && (
            <TouchableOpacity onPress={() => handleSaveCommission(true)} disabled={isSavingCommission} className="mt-3">
              <Text className="text-[14px] font-bold text-system-blue-light">Reset to platform default</Text>
            </TouchableOpacity>
          )}
        </View>

        <Divider height={11} />

        {/* Actions Section */}
        {availableActions.length > 0 && (
          <View className="p-[21px]">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Choose Action
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-6">
              {availableActions.map((act) => (
                <TouchableOpacity
                  key={act}
                  onPress={() => setAction(act)}
                  className={`px-4 py-2.5 rounded-lg border ${
                    action === act 
                      ? "bg-white border-system-blue-light" 
                      : "bg-[#F5F7FA] border-transparent"
                  }`}
                >
                  <Text className={`text-[13px] font-bold ${action === act ? "text-system-blue-light" : "text-[#00001180]"}`}>
                    {act}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleConfirmAction}
              disabled={isProcessing}
              className={`h-[55px] rounded-[12px] items-center justify-center ${isProcessing ? "bg-gray-300" : "bg-system-blue-light"}`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[16px] font-bold">Confirm Action</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}