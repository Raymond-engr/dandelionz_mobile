import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/ui/checkout-progress";
import { Divider } from "@/components/ui/divider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useInitializeInstallmentCheckoutMutation } from "@/lib/api/publicApi";
import Toast from "react-native-toast-message";

type InstallmentDuration = '1_month' | '3_months' | '6_months' | '8_months';

const DURATION_OPTIONS: { value: InstallmentDuration; label: string; description: string }[] = [
    { value: '1_month', label: '1 Month Plan', description: 'Split payment over 1 month' },
    { value: '3_months', label: '3 Months Plan', description: 'Split payment over 3 months' },
    { value: '6_months', label: '6 Months Plan', description: 'Split payment over 6 months' },
    { value: '8_months', label: '8 Months Plan', description: 'Split payment over 8 months' },
];

export default function CheckoutInstallments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState<InstallmentDuration>('3_months');
  
  const [initializeInstallment, { isLoading }] = useInitializeInstallmentCheckoutMutation();

  const handleNext = async () => {
    try {
      const result = await initializeInstallment({ duration }).unwrap();
      
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
        text2: err?.data?.error || err?.data?.message || "Failed to initialize installment plan." 
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
      </ScrollView>

      <View className="p-[21px] mb-4">
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
