import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { PinInput } from "@/components/ui/pin-input";
import { Colors } from "@/constants/theme";
import {
  useAdminRequestWithdrawalMutation,
  useGetWalletStatsQuery,
} from "@/lib/api/adminApi";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AdminWithdrawEarnings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: statsResponse, isLoading: isLoadingStats } =
    useGetWalletStatsQuery();
  const [requestWithdrawal, { isLoading: isRequesting }] =
    useAdminRequestWithdrawalMutation();

  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);

  const walletStats = statsResponse?.data;
  const MIN_WITHDRAWAL = 1000;

  const handleWithdraw = async () => {
    const fullPin = pin.join("");
    const withdrawAmount = parseFloat(amount);

    if (!amount || fullPin.length < 4 || isNaN(withdrawAmount)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both amount and your 4-digit PIN.",
      });
      return;
    }

    if (withdrawAmount < MIN_WITHDRAWAL) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: `Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL)}`,
      });
      return;
    }

    if (
      withdrawAmount >
      parseFloat(walletStats?.withdrawable_balance?.toString() || "0")
    ) {
      Toast.show({ type: "error", text1: "Insufficient balance." });
      return;
    }

    try {
      await requestWithdrawal({ amount, pin: fullPin }).unwrap();
      Toast.show({
        type: "success",
        text1: "Withdrawal request submitted successfully.",
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.data?.message || "Failed to submit withdrawal request.",
      });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Withdraw
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoadingStats) {
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

      <ScrollView
        className="flex-1 px-[21px] pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-system-blue-light rounded-[16px] p-8 mb-8 shadow-lg shadow-blue-900/20">
          <Text className="text-white/80 text-[14px] font-medium mb-2 uppercase tracking-widest text-center">
            Available for Withdrawal
          </Text>
          <Text className="text-white text-[32px] font-bold text-center">
            {formatCurrency(walletStats?.withdrawable_balance)}
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-[14px] font-semibold text-system-blue-dark mb-4 text-center">
            Amount to Withdraw
          </Text>
          <View className="flex-row items-center border-b border-gray-200 px-4 h-[55px]">
            <Text className="text-[24px] font-bold text-system-blue-dark mr-2">
              ₦
            </Text>
            <TextInput
              className="flex-1 text-[24px] font-bold text-system-blue-dark"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <Text className="text-[12px] text-gray-400 mt-2 text-center">
            Minimum withdrawal: {formatCurrency(MIN_WITHDRAWAL)}
          </Text>
        </View>

        <View className="mb-10 items-center">
          <Text className="text-[14px] font-semibold text-system-blue-dark mb-4">
            Payment PIN
          </Text>
          <PinInput value={pin} onChange={setPin} />
          <Text className="text-[12px] text-gray-400 mt-4 text-center">
            Enter your 4-digit secure payment PIN
          </Text>
        </View>

        <Button onPress={handleWithdraw} isLoading={isRequesting}>
          Confirm Withdrawal
        </Button>

        <Pressable
          className="mt-6 py-2"
          onPress={() =>
            router.push("/(admin)/payment-settings/forgot-pin" as any)
          }
        >
          <Text className="text-system-blue-light text-center font-semibold">
            Forgot PIN?
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
