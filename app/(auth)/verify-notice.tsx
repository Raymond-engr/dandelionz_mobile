import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useSendVerificationEmailMutation } from "@/lib/api/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";

export default function VerifyNoticeScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const [sendVerification, { isLoading }] = useSendVerificationEmailMutation();
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    if (!emailParam) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email address not found. Please try logging in again.",
      });
      return;
    }

    try {
      const res = await sendVerification({ email: emailParam }).unwrap();
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "A new verification link has been sent to your inbox.",
        });
        setCooldown(60); // 60 seconds cooldown
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to send email",
        text2: err?.data?.message || "Please try again later.",
      });
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-between py-10">
      <View className="w-full items-center px-6">
        <Text className="text-[24px] font-semibold text-system-blue-dark text-center mb-12">
          Verify Email
        </Text>

        <View className="w-[120px] h-[120px] rounded-full bg-[#F5F7FA] items-center justify-center mb-10">
          <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 8L10.89 13.26C11.2129 13.4753 11.6014 13.5901 11.9985 13.5901C12.3956 13.5901 12.7841 13.4753 13.107 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
              stroke="#030482"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text className="text-[20px] font-semibold text-system-blue-dark text-center px-4">
          Check your inbox
        </Text>
        
        <Text className="text-[16px] text-[#6B7280] text-center mt-4 px-6 leading-6">
          We&apos;ve sent a verification link to your email address{emailParam ? ` (${emailParam})` : ""}. Please click the link to verify your account.
        </Text>
        
        <TouchableOpacity 
          onPress={handleResend} 
          disabled={isLoading || cooldown > 0}
          className="mt-8"
        >
          <Text className={`text-[15px] font-semibold ${isLoading || cooldown > 0 ? "text-gray-400" : "text-system-blue-light"}`}>
            {isLoading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive email? Resend"}
          </Text>
        </TouchableOpacity>

        <Text className="text-[14px] text-[#9CA3AF] text-center mt-6 px-6">
          If you don&apos;t see the email, please check your spam folder.
        </Text>
      </View>

      <View className="w-full items-center">
        <Divider className="mb-6" />
        <View className="w-full px-6">
          <Button onPress={() => router.replace("/(auth)/login")}>
            Back to Login
          </Button>
        </View>
      </View>
    </View>
  );
}
