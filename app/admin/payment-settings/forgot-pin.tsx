import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { useForgotPaymentPinMutation } from "@/lib/api/adminApi";
import { apiError } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AdminForgotPinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [requestReset, { isLoading }] = useForgotPaymentPinMutation();

  const handleRequest = async () => {
    try {
      await requestReset().unwrap();
      Toast.show({ 
        type: "success", 
        text1: "Request Sent", 
        text2: "A PIN reset link has been sent to your email." 
      });
      router.back();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Failed to send reset request.")
      });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Forgot Payment PIN
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={11} />

      <View className="flex-1 px-[21px] justify-center pb-20">
        <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mx-auto mb-8">
          <MaterialIcons name="lock-reset" size={48} color={Colors.primary} />
        </View>

        <Text className="text-[22px] font-bold text-system-blue-dark text-center mb-4">
          Reset your Payment PIN
        </Text>
        
        <Text className="text-[14px] text-gray-500 text-center mb-10 px-4 leading-6">
          To reset your secure payment PIN, we need to verify your identity. Click the button below to receive a reset link in your email.
        </Text>

        <View className="gap-4">
          <Button onPress={handleRequest} isLoading={isLoading}>
            Send Reset Link
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </View>
    </View>
  );
}
