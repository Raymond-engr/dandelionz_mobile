import React from "react";
import { View, Text } from "react-native";

interface CheckoutProgressProps {
  currentStep: number;
}

const STEPS = ["Frequency", "Installments", "Shipping", "Payment"];

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <View className="px-[21px] py-6">
      <View className="flex-row items-center justify-between relative px-2">
        {/* Background Line */}
        <View className="absolute top-[7.25px] left-0 right-0 h-[2px] bg-gray-200" />
        
        {/* Active Line */}
        <View 
          className="absolute top-[7.25px] left-0 h-[2px] bg-system-blue-light" 
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((_, index) => (
          <View key={index} className="items-center">
            <View 
              className={`w-[16.5px] h-[16.5px] rounded-full z-10 border-2 ${
                index <= currentStep ? "bg-system-blue-light border-system-blue-light" : "bg-white border-gray-200"
              }`}
            />
          </View>
        ))}
      </View>
      
      <View className="flex-row justify-between mt-2">
        {STEPS.map((step, index) => (
          <Text 
            key={index}
            className={`text-[12px] text-center w-[70px] ${
              index <= currentStep ? "text-system-blue-light font-medium" : "text-[#9CA3AF]"
            }`}
          >
            {step}
          </Text>
        ))}
      </View>
    </View>
  );
}
