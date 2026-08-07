import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/ui/checkout-progress";
import { Divider } from "@/components/ui/divider";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetCartQuery,
  useInitializeInstallmentCheckoutMutation,
} from "@/lib/api/publicApi";
import { apiError, formatCurrency } from "@/lib/utils";
import Toast from "react-native-toast-message";

type InstallmentDuration = '1_month' | '3_months' | '6_months' | '8_months';

const DURATION_OPTIONS: { value: InstallmentDuration; label: string; description: string }[] = [
    { value: '1_month', label: '1 Month Plan', description: '4 weekly payments over 1 month' },
    { value: '3_months', label: '3 Months Plan', description: 'Split payment over 3 months' },
    { value: '6_months', label: '6 Months Plan', description: 'Split payment over 6 months' },
    { value: '8_months', label: '8 Months Plan', description: 'Split payment over 8 months' },
];

// Advisory checkpoint count per duration, mirroring InstallmentPlan.DURATION_INSTALLMENTS on
// the backend - used only to prefill a sensible default amount.
const DURATION_CHECKPOINTS: Record<InstallmentDuration, number> = {
  '1_month': 4,
  '3_months': 3,
  '6_months': 6,
  '8_months': 8,
};

export default function CheckoutInstallments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState<InstallmentDuration>('3_months');
  const [amount, setAmount] = useState("");
  const hasEditedAmount = useRef(false);

  const { data: cartData } = useGetCartQuery();
  const cartTotal = parseFloat(cartData?.data?.total || "0");

  const [initializeInstallment, { isLoading }] = useInitializeInstallmentCheckoutMutation();

  // Prefill with the advisory per-month amount for the selected duration; the customer is
  // free to change it before proceeding. Stops touching the field once they've typed into
  // it themselves, so switching duration to compare plans doesn't wipe out their input.
  useEffect(() => {
    if (cartTotal <= 0 || hasEditedAmount.current) return;
    const advisory = cartTotal / DURATION_CHECKPOINTS[duration];
    setAmount(advisory.toFixed(2));
  }, [cartTotal, duration]);

  const handleNext = async () => {
    const parsedAmount = parseFloat(amount);
    if (amount && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      Toast.show({ type: "error", text1: "Enter a valid amount" });
      return;
    }
    if (cartTotal > 0 && parsedAmount > cartTotal) {
      Toast.show({
        type: "error",
        text1: "Amount exceeds order total",
        text2: `Your order total is ${formatCurrency(cartTotal)}.`,
      });
      return;
    }

    try {
      const result = await initializeInstallment({
        duration,
        ...(amount ? { amount: parsedAmount } : {}),
      }).unwrap();

      if (result.data?.authorization_url) {
        const data = result.data as any;
        router.push({
          pathname: "/checkout/webview" as any,
          params: { 
            url: data.authorization_url, 
            reference: data.first_installment_reference, 
            plan_id: String(data.installment_plan_id)
          }
        });
      } else {
        Toast.show({ type: "error", text1: "Could not initialize installment plan. Please try again." });
      }
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Failed to initialize installment plan.")
      });
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-[21px] py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000011" />
        </TouchableOpacity>
        <Text className="text-[24px] font-semibold text-system-blue-light">Checkout</Text>
        <View className="w-6" />
      </View>

      <Divider />
      
      <CheckoutProgress currentStep={2} />

      <ScrollView className="flex-1 px-[21px]">
        <Text className="text-[20px] font-medium text-system-blue-dark mb-6">
          Select Plan Duration
        </Text>

        <View className="gap-4">
          {DURATION_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setDuration(opt.value)}
              className={`p-5 rounded-[12px] border-2 flex-row items-center justify-between ${
                duration === opt.value ? "border-system-blue-light bg-blue-50/30" : "border-gray-100 bg-[#F9FAFB]"
              }`}
            >
              <View className="flex-1">
                <Text className={`text-[16px] font-bold ${duration === opt.value ? "text-system-blue-light" : "text-system-blue-dark"}`}>
                  {opt.label}
                </Text>
                <Text className="text-[13px] text-[#6B7280] mt-1">{opt.description}</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${duration === opt.value ? "border-system-blue-light" : "border-gray-300"}`}>
                {duration === opt.value && <View className="w-3 h-3 rounded-full bg-system-blue-light" />}
              </View>
            </Pressable>
          ))}
        </View>

        <Text className="text-[20px] font-medium text-system-blue-dark mt-8 mb-3">
          First Payment Amount
        </Text>
        <Text className="text-[13px] text-[#6B7280] mb-4">
          Pay as much as you like now. The rest becomes your running balance
          {cartTotal > 0 ? ` — order total is ${formatCurrency(cartTotal)}.` : "."}
        </Text>
        <View className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Text className="text-[12px] text-[#6B7280] mb-1">Amount to pay (₦)</Text>
          <TextInput
            value={amount}
            onChangeText={(text) => {
              hasEditedAmount.current = true;
              setAmount(text);
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 rounded-[12px] px-4 h-[48px] text-[15px] text-system-blue-dark bg-white"
          />
          <View className="flex-row items-start mt-3">
            <Ionicons name="information-circle-outline" size={14} color="#6B7280" style={{ marginTop: 1 }} />
            <Text className="text-[11px] text-[#6B7280] ml-1.5 flex-1">
              This first payment is by card via Paystack. Once your plan starts, you can pay the
              rest from your wallet or by card, whichever you prefer.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-[21px] pt-[21px]" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          onPress={handleNext}
          isLoading={isLoading}
        >
          Proceed to Payment
        </Button>
      </View>
    </View>
  );
}
