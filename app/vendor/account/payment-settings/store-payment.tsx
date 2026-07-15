import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { 
  useGetPaymentSettingsQuery, 
  useUpdatePaymentSettingsMutation,
  useGetBanksQuery,
  useVerifyBankAccountMutation
} from "@/lib/api/vendorApi";
import { apiError } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VendorStorePaymentOption() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: response, isLoading } = useGetPaymentSettingsQuery();
  const { data: banksResponse, isLoading: isLoadingBanks } = useGetBanksQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdatePaymentSettingsMutation();
  const [verifyAccount, { isLoading: isVerifying }] = useVerifyBankAccountMutation();

  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);

  const banks = banksResponse?.data || [];

  useEffect(() => {
    if (response?.data) {
      setBankName(response.data.bank_name || "");
      setBankCode(response.data.bank_code || "");
      setAccountNumber(response.data.account_number || "");
      setAccountName(response.data.account_name || "");
      if (response.data.account_name) {
        setIsAccountVerified(true);
      }
    }
  }, [response]);

  const handleVerify = async () => {
    if (!accountNumber || accountNumber.length !== 10) {
      Toast.show({ type: "error", text1: "Please enter a valid 10-digit account number." });
      return;
    }
    if (!bankCode) {
      Toast.show({ type: "error", text1: "Please select a bank." });
      return;
    }

    try {
      const result = await verifyAccount({ 
        account_number: accountNumber, 
        bank_code: bankCode 
      }).unwrap();
      
      if (result.success) {
        setAccountName(result.data.account_name);
        setIsAccountVerified(true);
        Toast.show({ type: "success", text1: "Account verified successfully." });
      }
    } catch (err: any) {
      setIsAccountVerified(false);
      setAccountName("");
      Toast.show({ 
        type: "error", 
        text1: "Verification Failed", 
        text2: apiError(err, "Could not verify this account. Please check details.")
      });
    }
  };

  const handleUpdate = async () => {
    if (!bankName || !accountNumber || !accountName) {
      Toast.show({ type: "error", text1: "Please fill in all fields." });
      return;
    }

    if (!isAccountVerified) {
      Toast.show({ type: "error", text1: "Please verify your account details first." });
      return;
    }

    try {
      await updateSettings({ 
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber, 
        account_name: accountName 
      }).unwrap();
      Toast.show({ type: "success", text1: "Payment details updated successfully." });
      router.back();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Failed to update settings.")
      });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Payout Settings
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={11} />
      
      <ScrollView className="flex-1 px-[21px] pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-[18px] font-semibold text-system-blue-dark mb-6">Bank Details</Text>
        
        <View className="mb-6">
          <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Bank Name</Text>
          <Pressable 
            onPress={() => setShowBankPicker(true)}
            className="flex-row items-center justify-between border-b border-gray-200 py-3"
          >
            <Text className={`text-[16px] ${bankName ? 'text-system-blue-dark' : 'text-gray-400'}`}>
              {bankName || (isLoadingBanks ? "Loading banks..." : "Select Bank")}
            </Text>
            {isLoadingBanks ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#9CA3AF" />
            )}
          </Pressable>
        </View>

        <View className="mb-6">
          <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Account Number</Text>
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 border-b border-gray-200 py-3 text-[16px] text-system-blue-dark"
              placeholder="10-digit Account Number"
              keyboardType="numeric"
              maxLength={10}
              value={accountNumber}
              onChangeText={(text) => {
                setAccountNumber(text);
                setIsAccountVerified(false);
              }}
            />
            <Pressable 
              onPress={handleVerify} 
              disabled={isVerifying || accountNumber.length !== 10 || !bankCode}
              className={`px-4 py-2 rounded-lg ${isVerifying || accountNumber.length !== 10 || !bankCode ? 'bg-gray-100' : 'bg-system-blue-light/10'}`}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text className={`font-bold ${isVerifying || accountNumber.length !== 10 || !bankCode ? 'text-gray-400' : 'text-system-blue-light'}`}>
                  Verify
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View className="mb-10">
          <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Account Name</Text>
          <View className="border-b border-gray-200 py-3 flex-row items-center justify-between">
            <Text className={`text-[16px] ${accountName ? 'text-system-blue-dark' : 'text-gray-400'}`}>
              {accountName || "Verify account to see name"}
            </Text>
            {isAccountVerified && (
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
            )}
          </View>
          {isAccountVerified && (
            <Text className="text-[11px] text-gray-400 mt-2 italic">
              * Details verified via Paystack. Click Save to confirm.
            </Text>
          )}
        </View>

        <View className="gap-3 pb-10">
          <Button 
            onPress={handleUpdate} 
            isLoading={isUpdating}
            disabled={!isAccountVerified}
          >
            Save Changes
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            Discard
          </Button>
        </View>
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal visible={showBankPicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[30px] h-[60%]">
            <View className="p-6 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-[18px] font-bold text-system-blue-dark">Select Bank</Text>
              <Pressable onPress={() => setShowBankPicker(false)}>
                <MaterialIcons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>
            <FlatList
              data={banks}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setBankName(item.name);
                    setBankCode(item.code);
                    setShowBankPicker(false);
                    setIsAccountVerified(false);
                  }}
                  className="px-6 py-4 border-b border-gray-50 active:bg-gray-50"
                >
                  <Text className={`text-[16px] ${bankCode === item.code ? 'text-system-blue-light font-bold' : 'text-system-blue-dark'}`}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
