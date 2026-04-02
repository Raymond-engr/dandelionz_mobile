import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import {
    useGetPaymentSettingsQuery,
    useGetWalletBalanceQuery,
} from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";

export default function WithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: walletData, isLoading: walletLoading } = useGetWalletBalanceQuery();
  const { data: paymentData, isLoading: paymentLoading } = useGetPaymentSettingsQuery();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (walletData?.data?.withdrawable_balance !== undefined) {
      setAmount(walletData.data.withdrawable_balance.toString());
    }
  }, [walletData]);

  const isLoading = walletLoading || paymentLoading;
  const payment = paymentData?.data;

  const handleProceed = () => {
    setError("");
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!payment?.bank_name || !payment?.account_number) {
      setError("Please complete bank details in Payment Settings.");
      return;
    }
    if (val > (walletData?.data?.withdrawable_balance ?? 0)) {
      setError("Amount exceeds withdrawable balance.");
      return;
    }
    
    // Convert to query string for navigation
    const params = new URLSearchParams({
      amount,
      bankName: payment.bank_name ?? "",
      accountNumber: payment.account_number ?? "",
      accountName: payment.account_name ?? "",
    }).toString();
    
    router.push(`/vendor/wallet/confirm-pin?${params}`);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/vendor/(tabs)/wallet");
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={handleBack} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Withdraw
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <Divider />

        <ScrollView
          className="flex-1 px-[21px]"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View className="bg-red-50 p-4 rounded-[12px] mb-6 border border-red-100 mt-4">
              <Text className="text-red-600 text-[13px]">{error}</Text>
            </View>
          )}

          <View className="bg-system-blue-light rounded-[16px] p-8 mt-6 mb-8 shadow-lg shadow-blue-900/20">
            <Text className="text-white/80 text-[14px] font-medium mb-2 uppercase tracking-widest">Available Balance</Text>
            <Text className="text-white text-[32px] font-bold">
              {formatCurrency(walletData?.data?.withdrawable_balance)}
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Amount to Withdraw</Text>
            <View className="flex-row items-center border-b border-gray-200 py-2">
              <Text className="text-[24px] font-bold text-system-blue-dark mr-2">₦</Text>
              <TextInput
                className="flex-1 text-[24px] font-bold text-system-blue-dark"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>

          <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Destination Bank</Text>
          <View className="bg-gray-50/50 rounded-[16px] p-6 border border-gray-100">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-500">Bank Name</Text>
              <Text className="font-bold text-system-blue-dark">{payment?.bank_name || "—"}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-500">Account Number</Text>
              <Text className="font-bold text-system-blue-dark">{payment?.account_number || "—"}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-500">Account Name</Text>
              <Text className="font-bold text-system-blue-dark text-right flex-1 ml-4">{payment?.account_name || "—"}</Text>
            </View>
            
            <Pressable
              onPress={() => router.push("/vendor/account/payment-settings")}
              className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="edit" size={16} color={Colors.primary} />
              <Text className="text-system-blue-light font-bold">Edit Bank Details</Text>
            </Pressable>
          </View>

          {!payment?.has_pin && (
            <View className="mt-8 bg-yellow-50 p-4 rounded-[12px] border border-yellow-100 flex-row items-center gap-3">
              <MaterialIcons name="warning" size={24} color="#ca8a04" />
              <View className="flex-1">
                <Text className="text-[13px] text-yellow-800 font-medium">Payment PIN Required</Text>
                <Pressable onPress={() => router.push("/vendor/account/payment-settings")}>
                  <Text className="text-[12px] text-system-blue-light font-bold mt-1">Setup PIN now →</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View className="mt-10">
            <Button 
              onPress={handleProceed}
              disabled={!payment?.has_pin || parseFloat(amount) <= 0}
            >
              Proceed to Confirmation
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
