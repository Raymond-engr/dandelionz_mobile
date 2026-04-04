import { Button } from "@/components/ui/button";
import { CheckoutProgress } from "@/components/ui/checkout-progress";
import { Divider } from "@/components/ui/divider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FREQUENCIES = [
  { id: "full", label: "One-time Payment", sub: "Pay full amount at once" },
  {
    id: "installment",
    label: "Installment Plan",
    sub: "Spread cost over several months",
  },
];

export default function CheckoutFrequency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("full");

  const handleNext = () => {
    if (selected === "full") {
      router.push("/checkout/shipping");
    } else {
      router.push("/checkout/installments");
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-[21px] py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000011" />
        </TouchableOpacity>
        <Text className="text-[24px] font-semibold text-system-blue-light">
          Checkout
        </Text>
        <View className="w-6" />
      </View>

      <Divider />

      <CheckoutProgress currentStep={0} />

      <ScrollView className="flex-1 px-[21px]">
        <Text className="text-[20px] font-medium text-system-blue-dark mb-6">
          Select Payment Frequency
        </Text>

        <View className="gap-4">
          {FREQUENCIES.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setSelected(f.id)}
              className={`p-5 rounded-[12px] border-2 flex-row items-center justify-between ${
                selected === f.id
                  ? "border-system-blue-light bg-blue-50/30"
                  : "border-gray-100 bg-[#F9FAFB]"
              }`}
            >
              <View className="flex-1">
                <Text
                  className={`text-[16px] font-bold ${selected === f.id ? "text-system-blue-light" : "text-system-blue-dark"}`}
                >
                  {f.label}
                </Text>
                <Text className="text-[13px] text-[#6B7280] mt-1">{f.sub}</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selected === f.id ? "border-system-blue-light" : "border-gray-300"}`}
              >
                {selected === f.id && (
                  <View className="w-3 h-3 rounded-full bg-system-blue-light" />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="p-[21px] mb-4">
        <Button onPress={handleNext}>Proceed</Button>
      </View>
    </View>
  );
}
