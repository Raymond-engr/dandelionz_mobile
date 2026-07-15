import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/ui/checkout-progress";
import { Divider } from "@/components/ui/divider";
import { useInitializeCheckoutMutation, useInitializeInstallmentCheckoutMutation } from "@/lib/api/publicApi";
import { apiError } from "@/lib/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function CheckoutPayment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { frequency, duration } = useLocalSearchParams<{ frequency: string; duration: string }>();
  
  const [method, setMethod] = useState<"card" | "delivery">("card");
  
  const [initFull, { isLoading: isInitFull }] = useInitializeCheckoutMutation();
  const [initInstallment, { isLoading: isInitInstallment }] = useInitializeInstallmentCheckoutMutation();

  const isLoading = isInitFull || isInitInstallment;

  const handlePayment = async () => {
    try {
      let result;
      if (frequency === "full") {
        result = await initFull().unwrap();
      } else {
        result = await initInstallment({ duration: duration as any }).unwrap();
      }

      if (result.data?.authorization_url) {
        const data = result.data as any;
        const reference = data.reference || data.first_installment_reference;
        const plan_id = data.installment_plan_id;
        
        router.push({
          pathname: "/checkout/webview" as any,
          params: { 
            url: data.authorization_url, 
            reference, 
            plan_id: plan_id ? String(plan_id) : undefined 
          }
        });
      } else {
        Toast.show({ type: "error", text1: "Could not initialize payment. Please try again." });
      }
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Payment initiation failed.")
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
          Select Payment Mode
        </Text>

        <View className="gap-4">
          {/* Card Option */}
          <Pressable
            onPress={() => setMethod("card")}
            className={`p-5 rounded-[12px] border-2 flex-row items-center justify-between ${
              method === "card" ? "border-system-blue-light bg-blue-50/30" : "border-gray-100 bg-[#F9FAFB]"
            }`}
          >
            <View className="flex-1">
              <Text className={`text-[16px] font-bold ${method === "card" ? "text-system-blue-light" : "text-system-blue-dark"}`}>
                Pay with Card (via Paystack)
              </Text>
              <Text className="text-[13px] text-[#6B7280] mt-1">Secure payment with debit/credit card</Text>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${method === "card" ? "border-system-blue-light" : "border-gray-300"}`}>
              {method === "card" && <View className="w-3 h-3 rounded-full bg-system-blue-light" />}
            </View>
          </Pressable>

          <Divider />

          {/* Delivery Option (Disabled like web) */}
          <View
            className="p-5 rounded-[12px] border-2 border-gray-100 bg-gray-50 flex-row items-center justify-between opacity-50"
          >
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-gray-400">Pay on Delivery</Text>
              <Text className="text-[13px] text-system-blue-light mt-1">Coming Soon</Text>
            </View>
            <View className="w-6 h-6 rounded-full border-2 border-gray-200" />
          </View>
        </View>

        <View className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Text className="text-[14px] text-system-blue-dark font-medium leading-5">
            Summary: {frequency === "full" ? "One-time Payment" : `Installment Plan (${duration?.replace('_', ' ')})`}
          </Text>
        </View>
      </ScrollView>

      <View className="p-[21px] mb-4">
        <Button 
          onPress={handlePayment}
          isLoading={isLoading}
        >
          {method === "card" ? "Continue to Paystack" : "Place Order"}
        </Button>
      </View>
    </View>
  );
}
