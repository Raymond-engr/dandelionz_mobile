import {
  PasswordCriteria,
  validatePassword,
} from "@/components/password-criteria";
import { Button } from "@/components/ui/button";
import { useConfirmPasswordResetMutation } from "@/lib/api/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ForgotPasswordConfirmScreen() {
  const router = useRouter();
  const { uid, token } = useLocalSearchParams<{ uid: string; token: string }>();
  const [confirmReset, { isLoading }] = useConfirmPasswordResetMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const v = validatePassword(password);
    if (!v.length || !v.uppercase || !v.lowercase || !v.special) {
      setError("Password does not meet all requirements");
      return;
    }
    try {
      const res = await confirmReset({
        uid,
        token,
        new_password: password,
      }).unwrap();
      if (res.success) router.replace("/(auth)/login");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          "Failed to reset password. The link may have expired.",
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-[24px] pt-[80px] pb-[40px]">
        <Text className="text-[24px] font-bold text-system-blue-dark text-center mb-[12px]">
          Reset Password
        </Text>
        <Text className="text-[14px] text-[#6B7280] text-center mb-[32px]">
          Enter your new password below.
        </Text>

        {error ? (
          <View className="bg-red-50 p-3 rounded-lg mb-4">
            <Text className="text-red-600 text-[13px]">{error}</Text>
          </View>
        ) : null}

        <View className="mb-[24px]">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 text-[16px] text-system-blue-dark py-2"
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <Text className="text-[18px] px-1">{showPassword ? "🙈" : "👁"}</Text>
            </Pressable>
          </View>
          <View className="h-[1px] bg-gray-300 w-full" />
          {password.length > 0 && <PasswordCriteria password={password} />}
        </View>

        <View className="mb-[32px]">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 text-[16px] text-system-blue-dark py-2"
              placeholder="Confirm New Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
              <Text className="text-[18px] px-1">{showConfirm ? "🙈" : "👁"}</Text>
            </Pressable>
          </View>
          <View className="h-[1px] bg-gray-300 w-full" />
        </View>

        <Button
          onPress={handleSubmit}
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </View>
    </ScrollView>
  );
}
