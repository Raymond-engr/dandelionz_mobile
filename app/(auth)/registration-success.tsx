import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function RegistrationSuccessScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-between py-10">
      <View className="w-full items-center px-6">
        <Text className="text-[24px] font-semibold text-system-blue-light text-center mb-12">
          Confirmation
        </Text>

        <View className="w-[197px] h-[197px] rounded-full bg-system-blue-light items-center justify-center mb-10">
          <Svg width={126} height={126} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text className="text-[24px] font-semibold text-system-blue-light text-center px-4">
          Registration Successful!
        </Text>
        
        <Text className="text-[16px] text-[#6B7280] text-center mt-4 px-6 leading-6">
          Your account has been created successfully. Please check your email to verify your account.
        </Text>
      </View>

      <View className="w-full items-center">
        <Divider className="mb-6" />
        <View className="w-full px-6">
          <Button onPress={() => router.replace("/(auth)/login")}>
            Continue to Login
          </Button>
        </View>
      </View>
    </View>
  );
}
