import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PinInput } from "@/components/ui/pin-input";
import { Colors } from "@/constants/theme";
import { 
  useGetPaymentSettingsQuery, 
  useUpdatePaymentSettingsMutation, 
  useSetPaymentPINMutation,
  useRequestPINResetMutation
} from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VendorPaymentSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: settingsData, isLoading, refetch } = useGetPaymentSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdatePaymentSettingsMutation();
  const [setPIN, { isLoading: isSettingPIN }] = useSetPaymentPINMutation();
  const [requestReset, { isLoading: isResetting }] = useRequestPINResetMutation();

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [showPinForm, setShowPinPinForm] = useState(false);

  useEffect(() => {
    if (settingsData?.data) {
      setBankName(settingsData.data.bank_name || "");
      setAccountNumber(settingsData.data.account_number || "");
      setAccountName(settingsData.data.account_name || "");
    }
  }, [settingsData]);

  const handleUpdateBank = async () => {
    if (!bankName || !accountNumber || !accountName) {
      Toast.show({ type: "error", text1: "Please fill in all bank details." });
      return;
    }
    try {
      await updateSettings({ 
        bank_name: bankName, 
        account_number: accountNumber,
        account_name: accountName 
      }).unwrap();
      Toast.show({ type: "success", text1: "Bank details updated successfully!" });
      refetch();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to update bank details" 
      });
    }
  };

  const handleSetPIN = async () => {
    const p = pin.join("");
    const cp = confirmPin.join("");

    if (p.length !== 4 || cp.length !== 4) {
      Toast.show({ type: "error", text1: "PIN must be 4 digits." });
      return;
    }
    if (p !== cp) {
      Toast.show({ type: "error", text1: "PINs do not match." });
      return;
    }
    try {
      await setPIN({ pin: p, confirm_pin: cp }).unwrap();
      Toast.show({ type: "success", text1: "Payment PIN set successfully!" });
      setShowPinPinForm(false);
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      refetch();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to set PIN" 
      });
    }
  };

  const handleForgotPIN = async () => {
    Alert.alert(
      "Reset PIN",
      "Are you sure you want to request a PIN reset? Instructions will be sent to your email.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Request Reset", 
          onPress: async () => {
            try {
              await requestReset().unwrap();
              Toast.show({ type: "success", text1: "PIN reset request sent!" });
            } catch (err: any) {
              Toast.show({ 
                type: "error", 
                text1: "Error", 
                text2: err?.data?.message || "Failed to request reset" 
              });
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Payment Settings
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  const hasPin = settingsData?.data?.has_pin;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={11} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Bank Details Section */}
        <View className="p-[21px]">
          <Text className="text-[20px] font-semibold text-system-blue-dark mb-6">Withdrawal Details</Text>
          
          <View className="mb-6">
            <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Bank Name</Text>
            <TextInput
              className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark"
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. GTBank"
            />
          </View>

          <View className="mb-6">
            <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Account Number</Text>
            <TextInput
              className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark"
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="10-digit number"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View className="mb-8">
            <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Account Name</Text>
            <TextInput
              className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark"
              value={accountName}
              onChangeText={setAccountName}
              placeholder="e.g. John Doe"
            />
          </View>

          <Button onPress={handleUpdateBank} isLoading={isUpdating}>
            Save Bank Details
          </Button>
        </View>

        <Divider height={11} />

        {/* PIN Management Section */}
        <View className="p-[21px]">
          <Text className="text-[20px] font-semibold text-system-blue-dark mb-6">Security PIN</Text>
          
          <View className="flex-row items-center justify-between mb-6 bg-blue-50/50 p-4 rounded-[12px]">
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-system-blue-dark">
                Payment PIN Status
              </Text>
              <Text className="text-[13px] text-gray-500 mt-1">
                {hasPin ? "Your PIN is active and secure." : "You haven't set a payment PIN yet."}
              </Text>
            </View>
            <View className={`w-3 h-3 rounded-full ${hasPin ? 'bg-green-500' : 'bg-red-500'}`} />
          </View>

          {(!hasPin || showPinForm) ? (
            <View className="mb-6 bg-white border border-gray-100 p-4 rounded-[12px]">
              <Text className="text-[14px] font-semibold text-system-blue-dark mb-6 text-center">
                {hasPin ? "Change PIN" : "Create New PIN"}
              </Text>
              
              <View className="mb-6">
                <Text className="text-[12px] text-gray-400 mb-4 uppercase text-center">Enter 4-Digit PIN</Text>
                <PinInput value={pin} onChange={setPin} />
              </View>

              <View className="mb-8">
                <Text className="text-[12px] text-gray-400 mb-4 uppercase text-center">Confirm PIN</Text>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </View>

              <View className="gap-3">
                <Button onPress={handleSetPIN} isLoading={isSettingPIN}>
                  {hasPin ? "Update PIN" : "Save PIN"}
                </Button>
                {hasPin && (
                  <Button variant="outline" onPress={() => setShowPinPinForm(false)}>
                    Cancel
                  </Button>
                )}
              </View>
            </View>
          ) : (
            <View className="gap-4">
              <Button variant="outline" onPress={() => setShowPinPinForm(true)}>
                Change Payment PIN
              </Button>
              <Pressable onPress={handleForgotPIN} className="py-2 items-center">
                <Text className="text-system-blue-light font-semibold">Forgot PIN?</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
