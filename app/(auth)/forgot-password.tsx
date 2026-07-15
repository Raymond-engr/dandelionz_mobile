import { Button } from "@/components/ui/button";
import { useRequestPasswordResetMutation } from "@/lib/api/authApi";
import { apiError } from "@/lib/utils";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    try {
      const res = await requestReset({ email }).unwrap();
      if (res.success) setSuccess(true);
    } catch (err: any) {
      setError(apiError(err, "Something went wrong. Please try again."));
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
        <View className="flex-1 px-[24px] pt-[100px]">
          <Text className="text-[24px] font-bold text-system-blue-dark text-center mb-[12px]">
            Check your email
          </Text>
          <Text className="text-[14px] text-[#6B7280] text-center leading-[20px] mb-[32px]">
            We&apos;ve sent password reset instructions to {email}. Please check your
            inbox.
          </Text>
          <Button onPress={() => router.replace("/(auth)/login")}>
            Back to Login
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-[24px] pt-[60px] pb-[40px]">
        <Pressable onPress={() => router.back()} className="mb-[32px]">
          <Text className="text-[16px] text-system-blue-light">← Back</Text>
        </Pressable>

        <Text className="text-[24px] font-bold text-system-blue-dark text-center mb-[12px]">
          Forgot Password
        </Text>
        <Text className="text-[14px] text-[#6B7280] text-center leading-[20px] mb-[32px]">
          Enter your email address and we&apos;ll send you instructions to reset your
          password.
        </Text>

        {error ? (
          <View className="bg-red-50 p-3 rounded-lg mb-4">
            <Text className="text-red-600 text-[13px]">{error}</Text>
          </View>
        ) : null}

        <View className="mb-[32px]">
          <TextInput
            className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300"
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Button
          onPress={handleSubmit}
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </View>
    </ScrollView>
  );
}
