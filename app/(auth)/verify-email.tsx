import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useVerifyEmailMutation } from "@/lib/api/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uid, token } = useLocalSearchParams<{ uid: string; token: string }>();
  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (uid && token) {
      verifyEmail({ uid, token })
        .unwrap()
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [uid, token]);

  if (status === "loading") {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <ActivityIndicator size="large" color="#030482" />
        <Text className="mt-4 text-[#6B7280] text-[15px]">Verifying your email...</Text>
      </View>
    );
  }

  if (status === "success") {
    return (
      <View className="flex-1 bg-white items-center justify-between" style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }}>
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

          <Text className="text-[24px] font-semibold text-system-blue-light text-center">
            Email Verified!
          </Text>
          <Text className="text-[16px] text-[#6B7280] text-center mt-4 px-6">
            Your account is now active. You can log in.
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

  return (
    <View className="flex-1 bg-white items-center justify-between" style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }}>
      <View className="w-full items-center px-6">
        <Text className="text-[24px] font-semibold text-system-red text-center mb-12">
          Verification Failed
        </Text>

        <View className="w-[120px] h-[120px] rounded-full bg-red-50 items-center justify-center mb-10">
          <Text className="text-[60px]">❌</Text>
        </View>

        <Text className="text-[16px] text-[#6B7280] text-center px-6">
          The verification link is invalid or has expired. Please request a new one.
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
