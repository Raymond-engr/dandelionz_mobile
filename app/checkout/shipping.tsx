import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/ui/checkout-progress";
import { Divider } from "@/components/ui/divider";
import { useGetCustomerProfileQuery } from "@/lib/api/customerApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function CheckoutShipping() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  
  const { data: profile, isLoading } = useGetCustomerProfileQuery();

  const hasAddress = !!profile?.shipping_address;

  const handleNext = () => {
    if (deliveryType === "home" && !hasAddress) {
      Toast.show({
        type: "error",
        text1: "Shipping Address Required",
        text2: "Please add a shipping address to proceed.",
      });
      return;
    }
    
    if (params.frequency === "installment") {
      router.push({
        pathname: "/checkout/installments",
        params: { ...params, deliveryType }
      });
    } else {
      router.push({
        pathname: "/checkout/payment",
        params: { ...params, deliveryType }
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
      
      <CheckoutProgress currentStep={1} />

      <ScrollView className="flex-1 px-[21px]">
        <Text className="text-[20px] font-medium text-system-blue-dark mb-6">
          Shipping Details
        </Text>

        <View className="gap-4">
          <Pressable
            onPress={() => setDeliveryType("home")}
            className={`p-5 rounded-[12px] border-2 flex-row items-center justify-between ${
              deliveryType === "home" ? "border-system-blue-light bg-blue-50/30" : "border-gray-100 bg-[#F9FAFB]"
            }`}
          >
            <View>
              <Text className={`text-[16px] font-bold ${deliveryType === "home" ? "text-system-blue-light" : "text-system-blue-dark"}`}>
                Home Delivery
              </Text>
              <Text className="text-[13px] text-[#6B7280] mt-1">Deliver to your doorstep</Text>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${deliveryType === "home" ? "border-system-blue-light" : "border-gray-300"}`}>
              {deliveryType === "home" && <View className="w-3 h-3 rounded-full bg-system-blue-light" />}
            </View>
          </Pressable>

          <Divider />

          <Pressable
            onPress={() => setDeliveryType("pickup")}
            disabled // Coming soon like web
            className={`p-5 rounded-[12px] border-2 flex-row items-center justify-between opacity-50 ${
              deliveryType === "pickup" ? "border-system-blue-light bg-blue-50/30" : "border-gray-100 bg-[#F9FAFB]"
            }`}
          >
            <View>
              <Text className={`text-[16px] font-bold ${deliveryType === "pickup" ? "text-system-blue-light" : "text-system-blue-dark"}`}>
                Pickup (Coming Soon)
              </Text>
              <Text className="text-[13px] text-[#6B7280] mt-1">Collect from nearest center</Text>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${deliveryType === "pickup" ? "border-system-blue-light" : "border-gray-300"}`}>
              {deliveryType === "pickup" && <View className="w-3 h-3 rounded-full bg-system-blue-light" />}
            </View>
          </Pressable>
        </View>

        {deliveryType === "home" && (
          <View className="mt-8 bg-[#F9FAFB] p-5 rounded-[16px] border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[14px] font-bold text-system-blue-dark">Delivery Address</Text>
                <TouchableOpacity onPress={() => router.push("/account/delivery-address")}>
                    <Text className="text-[13px] font-bold text-system-blue-light">
                        {hasAddress ? "Change" : "Add Address"}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {isLoading ? (
                <ActivityIndicator size="small" color="#030482" />
            ) : hasAddress ? (
                <View>
                    <Text className="text-[15px] text-system-blue-dark leading-[22px]">
                        {profile?.shipping_address}
                    </Text>
                    <Text className="text-[14px] text-gray-500 mt-1">
                        {profile?.city}, {profile?.postal_code}
                    </Text>
                </View>
            ) : (
                <Text className="text-[14px] text-gray-400 italic">
                    No shipping address set yet.
                </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View className="p-[21px] mb-4">
        <Button onPress={handleNext}>Proceed</Button>
      </View>
    </View>
  );
}
