import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import {
    useGetCustomerWalletQuery,
    useInitializeWalletDepositMutation,
} from "@/lib/api/customerApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { MAX_DEPOSIT, MIN_DEPOSIT, isDepositAmountValid } from "@/lib/wallet";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
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

const QUICK_PICKS = [1000, 2000, 5000, 10000];

export default function CustomerDepositScreen() {
  const insets = useSafeAreaInsets();

  const { data: walletData } = useGetCustomerWalletQuery();
  const spendable =
    walletData?.data?.spendable_balance ?? walletData?.data?.balance ?? 0;

  const [amount, setAmount] = useState("");
  const [initializeDeposit, { isLoading: isInitializing }] =
    useInitializeWalletDepositMutation();

  const numericAmount = parseFloat(amount);
  const check = isDepositAmountValid(numericAmount);
  // Nothing typed yet is not an error worth shouting about — only show the
  // reason once the user has actually entered something.
  const showReason = amount.length > 0 && !check.valid;

  const handleContinue = async () => {
    if (!check.valid) return;

    try {
      const res = await initializeDeposit({ amount: numericAmount }).unwrap();

      if (!res.data?.authorization_url) {
        Toast.show({
          type: "error",
          text1: "Could not start top-up",
          text2: "Please try again.",
        });
        return;
      }

      router.push({
        pathname: "/checkout/webview" as any,
        params: {
          url: res.data.authorization_url,
          reference: res.data.reference,
        },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not start top-up",
        text2: apiError(err, "Please try again."),
      });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F7FA]"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          Fund Wallet
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 21, paddingBottom: insets.bottom + 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current spendable balance */}
        <View className="bg-white rounded-2xl p-4 mb-5 flex-row items-center justify-between border border-gray-100">
          <Text className="text-[14px] text-gray-500">Spendable balance</Text>
          <Text className="text-[18px] font-bold text-system-blue-dark">
            {formatCurrency(spendable)}
          </Text>
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
        {showReason ? (
          <Text className="text-[12px] text-red-500 mb-5">{check.reason}</Text>
        ) : (
          <Text className="text-[12px] text-gray-400 mb-5">
            Minimum: {formatCurrency(MIN_DEPOSIT)} · Maximum:{" "}
            {formatCurrency(MAX_DEPOSIT)}
          </Text>
        )}

        {/* Quick picks */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          {QUICK_PICKS.map((value) => {
            const selected = numericAmount === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => setAmount(String(value))}
                className={`px-4 py-2 rounded-full border ${
                  selected
                    ? "bg-system-blue-light border-system-blue-light"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    selected ? "text-white" : "text-gray-600"
                  }`}
                >
                  {formatCurrency(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spendable-only notice */}
        <View className="bg-blue-50 rounded-xl p-3 flex-row items-start gap-2 mb-6">
          <MaterialIcons
            name="info-outline"
            size={16}
            color="#3B82F6"
            style={{ marginTop: 1 }}
          />
          <Text className="text-[12px] text-blue-700 flex-1">
            Money you add here can be spent at checkout but cannot be withdrawn
            to a bank. Only refunds and earnings can be withdrawn.
          </Text>
        </View>

        {/* Continue */}
        <Button
          onPress={handleContinue}
          disabled={!check.valid || isInitializing}
          className={`py-4 rounded-2xl items-center ${check.valid ? "bg-system-blue-light" : "bg-gray-200"}`}
        >
          {isInitializing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className={`text-[16px] font-bold ${check.valid ? "text-white" : "text-gray-400"}`}
            >
              Continue to Payment
            </Text>
          )}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
