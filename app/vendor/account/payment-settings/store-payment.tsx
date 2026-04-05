import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { 
  useGetPaymentSettingsQuery, 
  useUpdatePaymentSettingsMutation 
} from "@/lib/api/vendorApi";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const NIGERIAN_BANKS = [
  "United Bank for Africa PLC",
  "Access Bank",
  "GTBank",
  "First Bank",
  "Zenith Bank",
  "Union Bank",
  "Stanbic IBTC Bank",
  "Fidelity Bank",
  "Sterling Bank",
  "Wema Bank",
];

export default function VendorStorePaymentOption() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: response, isLoading } = useGetPaymentSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdatePaymentSettingsMutation();

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showBankPicker, setShowBankPicker] = useState(false);

  useEffect(() => {
    if (response?.data) {
      setBankName(response.data.bank_name || "");
      setAccountNumber(response.data.account_number || "");
      setAccountName(response.data.account_name || "");
    }
  }, [response]);

  const handleUpdate = async () => {
    if (!bankName || !accountNumber || !accountName) {
      Toast.show({ type: "error", text1: "Please fill in all fields." });
      return;
    }

    try {
      await updateSettings({ 
        bank_name: bankName, 
        account_number: accountNumber, 
        account_name: accountName 
      }).unwrap();
      Toast.show({ type: "success", text1: "Payment details updated successfully." });
      router.back();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to update settings." 
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
          <LoadingSpinner />
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
          <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Account Number</Text>
          <TextInput
            className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark"
            placeholder="10-digit Account Number"
            keyboardType="numeric"
            maxLength={10}
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
        </View>

        <View className="mb-6">
          <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Bank Name</Text>
          <Pressable 
            onPress={() => setShowBankPicker(true)}
            className="flex-row items-center justify-between border-b border-gray-200 py-3"
          >
            <Text className={`text-[16px] ${bankName ? 'text-system-blue-dark' : 'text-gray-400'}`}>
              {bankName || "Select Bank"}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        <View className="mb-10">
          <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Account Name</Text>
          <TextInput
            className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark"
            placeholder="Name on the Bank Account"
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        <View className="gap-3">
          <Button onPress={handleUpdate} isLoading={isUpdating}>
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
              data={NIGERIAN_BANKS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setBankName(item);
                    setShowBankPicker(false);
                  }}
                  className="px-6 py-4 border-b border-gray-50 active:bg-gray-50"
                >
                  <Text className={`text-[16px] ${bankName === item ? 'text-system-blue-light font-bold' : 'text-system-blue-dark'}`}>
                    {item}
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
