import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
    hasCompletePayoutDetails,
    useGetCustomerPaymentSettingsQuery,
    useGetCustomerWalletQuery,
    useRequestCustomerWithdrawalMutation,
} from "@/lib/api/customerApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { MIN_WITHDRAWAL, isWithdrawFormValid } from "@/lib/wallet";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CustomerWithdrawScreen() {
  const insets = useSafeAreaInsets();

  // Wallet
  const { data: walletData } = useGetCustomerWalletQuery();
  // Withdrawals draw from the withdrawable bucket only - deposited funds are spendable at
  // checkout but can never leave as a bank transfer, so showing the total here would
  // overstate what the server will actually let through.
  const balance =
    walletData?.data?.withdrawable_balance ?? walletData?.data?.balance ?? 0;
  // The server enforces the real minimum and reports it; MIN_WITHDRAWAL is the value shown
  // before the wallet response arrives.
  const minWithdrawal = walletData?.data?.min_withdrawal ?? MIN_WITHDRAWAL;

  // Saved payout details — the withdrawal request no longer carries bank data.
  const { data: settingsResponse, isLoading: isLoadingSettings } =
    useGetCustomerPaymentSettingsQuery();
  const settings = settingsResponse?.data;
  const payoutReady = hasCompletePayoutDetails(settings);

  // Withdrawal
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [requestWithdrawal, { isLoading: isWithdrawing }] =
    useRequestCustomerWithdrawalMutation();

  const numericAmount = parseFloat(amount) || 0;
  const canWithdraw = isWithdrawFormValid({
    amount: numericAmount,
    pin,
    balance,
    minimum: minWithdrawal,
  });

  const handleWithdraw = () => {
    if (!canWithdraw) return;

    Alert.alert(
      "Confirm Withdrawal",
      `Send ${formatCurrency(numericAmount)} to ${settings?.account_name} (${settings?.bank_name} ···${(settings?.account_number ?? "").slice(-4)})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          onPress: async () => {
            try {
              const res = await requestWithdrawal({
                amount: numericAmount,
                pin,
              }).unwrap();
              Toast.show({
                type: "success",
                text1: "Withdrawal requested",
                text2: res.message,
              });
              router.back();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Withdrawal failed",
                text2: apiError(err, "Please try again."),
              });
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </TouchableOpacity>
      <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
        Withdraw to Bank
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoadingSettings) {
    return (
      <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!payoutReady) {
    return (
      <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-[21px]">
          <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-5">
            <MaterialIcons
              name="account-balance"
              size={30}
              color={Colors.primary}
            />
          </View>
          <Text className="text-[18px] font-bold text-system-blue-dark text-center mb-2">
            Add your bank account
          </Text>
          <Text className="text-[14px] text-gray-500 text-center mb-6">
            Add and verify your bank account in Payment Settings before
            withdrawing.
          </Text>
          <Button
            onPress={() =>
              router.push("/account/payment-settings/payout-details" as any)
            }
          >
            Add Payout Details
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F7FA]"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {renderHeader()}

      <ScrollView
        contentContainerStyle={{ padding: 21, paddingBottom: insets.bottom + 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Balance chip */}
        <View className="bg-white rounded-2xl p-4 mb-5 flex-row items-center justify-between border border-gray-100">
          <Text className="text-[14px] text-gray-500">Available balance</Text>
          <Text className="text-[18px] font-bold text-system-blue-dark">
            {formatCurrency(balance)}
          </Text>
        </View>

        {/* Saved destination */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Destination
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 px-4 py-4 mb-6">
          <Text className="text-[15px] font-bold text-system-blue-dark">
            {settings?.account_name}
          </Text>
          <Text className="text-[13px] text-gray-500 mt-1">
            {settings?.bank_name} ···{(settings?.account_number ?? "").slice(-4)}
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push("/account/payment-settings/payout-details" as any)
            }
          >
            <Text className="text-[12px] text-system-blue-light mt-3">
              Change payout details →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Amount
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 mb-1">
          <Text className="text-[22px] font-bold text-system-blue-dark mr-2">
            ₦
          </Text>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-[22px] font-bold text-system-blue-dark py-4"
          />
        </View>
        <Text className="text-[12px] text-gray-400 mb-6">
          Minimum: {formatCurrency(minWithdrawal)} · Maximum:{" "}
          {formatCurrency(balance)}
        </Text>

        <Divider className="my-4" />

        {/* PIN */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Payment PIN
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 mb-1">
          <MaterialIcons name="lock-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="4-digit PIN"
            placeholderTextColor="#9CA3AF"
            maxLength={4}
            className="flex-1 text-[18px] text-system-blue-dark py-4 ml-3 tracking-widest"
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push("/account/wallet/set-pin" as any)}
        >
          <Text className="text-[12px] text-system-blue-light mb-6">
            Don&apos;t have a PIN? Set one here →
          </Text>
        </TouchableOpacity>

        {/* Withdraw button */}
        <Button
          onPress={handleWithdraw}
          disabled={!canWithdraw || isWithdrawing}
          className={`py-4 rounded-2xl items-center ${canWithdraw ? "bg-system-blue-light" : "bg-gray-200"}`}
        >
          {isWithdrawing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className={`text-[16px] font-bold ${canWithdraw ? "text-white" : "text-gray-400"}`}
            >
              Withdraw {amount ? formatCurrency(numericAmount) : ""}
            </Text>
          )}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
