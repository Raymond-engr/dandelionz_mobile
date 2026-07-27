import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import {
    useGetRefundableBalanceQuery,
    useRequestDepositRefundMutation,
} from "@/lib/api/customerApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { isRefundAmountValid } from "@/lib/wallet";
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

/**
 * Returning deposited funds to the card that paid.
 *
 * This is the only way deposited money leaves the wallet without being spent — top-ups are
 * never withdrawable to a bank, which is what stops the wallet turning a stolen card into a
 * bank transfer. It is also the route out of a closure blocked by a deposited balance.
 */
export default function CustomerRefundScreen() {
  const insets = useSafeAreaInsets();

  const { data, isLoading } = useGetRefundableBalanceQuery();
  const [requestRefund, { isLoading: isSubmitting }] =
    useRequestDepositRefundMutation();

  const [amount, setAmount] = useState("");

  const refundable = parseFloat(data?.data?.refundable_amount ?? "0") || 0;
  const spendable = parseFloat(data?.data?.spendable_balance ?? "0") || 0;
  const deposits = data?.data?.deposits ?? [];

  // The two can differ: a top-up with no recorded Paystack transaction id cannot go back
  // to source, so it counts towards the spendable balance but not towards this.
  const hasUnrefundable = spendable > refundable;

  const numericAmount = parseFloat(amount);
  const check = isRefundAmountValid(numericAmount, { refundable });
  const showReason = amount.length > 0 && !check.valid;

  const handleSubmit = async () => {
    if (!check.valid) return;

    try {
      const res = await requestRefund({ amount: numericAmount }).unwrap();
      Toast.show({
        type: "success",
        text1: "Refund requested",
        text2: res.message ?? "It will appear on your card in a few working days.",
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not start refund",
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
          Refund to Card
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 21, paddingBottom: insets.bottom + 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Refundable balance */}
            <View className="bg-white rounded-2xl p-4 mb-5 border border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] text-gray-500">
                  Available to refund
                </Text>
                <Text className="text-[18px] font-bold text-system-blue-dark">
                  {formatCurrency(refundable)}
                </Text>
              </View>
              {hasUnrefundable && (
                <Text className="text-[12px] text-gray-400 mt-2">
                  Your deposited balance is {formatCurrency(spendable)}. The
                  difference is from older top-ups that can no longer be sent
                  back to a card — contact support about those.
                </Text>
              )}
            </View>

            {refundable <= 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-gray-100">
                <MaterialIcons name="credit-card-off" size={32} color="#9CA3AF" />
                <Text className="text-[15px] font-semibold text-gray-600 mt-3 text-center">
                  Nothing to refund
                </Text>
                <Text className="text-[13px] text-gray-400 mt-1 text-center">
                  Only money you added yourself can go back to a card. Earnings
                  and refunds are withdrawn to your bank instead.
                </Text>
              </View>
            ) : (
              <>
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
                  <TouchableOpacity
                    onPress={() => setAmount(String(refundable))}
                    className="px-3 py-1 rounded-full bg-gray-100"
                  >
                    <Text className="text-[12px] font-semibold text-gray-600">
                      All
                    </Text>
                  </TouchableOpacity>
                </View>
                {showReason ? (
                  <Text className="text-[12px] text-red-500 mb-5">
                    {check.reason}
                  </Text>
                ) : (
                  <Text className="text-[12px] text-gray-400 mb-5">
                    Up to {formatCurrency(refundable)}
                  </Text>
                )}

                {/* Which top-ups it comes from */}
                {deposits.length > 0 && (
                  <View className="bg-white rounded-2xl p-4 mb-5 border border-gray-100">
                    <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Refunded from
                    </Text>
                    {deposits.map((d) => (
                      <View
                        key={d.reference}
                        className="flex-row items-center justify-between py-1.5"
                      >
                        <Text className="text-[13px] text-gray-500">
                          {d.paid_at
                            ? new Date(d.paid_at).toLocaleDateString()
                            : d.reference}
                        </Text>
                        <Text className="text-[13px] font-semibold text-system-blue-dark">
                          {formatCurrency(parseFloat(d.refundable_amount))}
                        </Text>
                      </View>
                    ))}
                    <Text className="text-[11px] text-gray-400 mt-2">
                      Your most recent top-ups are used first.
                    </Text>
                  </View>
                )}

                {/* What to expect */}
                <View className="bg-blue-50 rounded-xl p-3 flex-row items-start gap-2 mb-6">
                  <MaterialIcons
                    name="info-outline"
                    size={16}
                    color="#3B82F6"
                    style={{ marginTop: 1 }}
                  />
                  <Text className="text-[12px] text-blue-700 flex-1">
                    The money goes back to the card you paid with — it cannot be
                    sent to a bank account. Your balance drops straight away, but
                    your bank usually takes a few working days to show it.
                  </Text>
                </View>

                <Button
                  onPress={handleSubmit}
                  disabled={!check.valid || isSubmitting}
                  className={`py-4 rounded-2xl items-center ${
                    check.valid ? "bg-system-blue-light" : "bg-gray-200"
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      className={`text-[16px] font-bold ${
                        check.valid ? "text-white" : "text-gray-400"
                      }`}
                    >
                      Refund to Card
                    </Text>
                  )}
                </Button>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
