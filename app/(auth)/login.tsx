import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/lib/api/authApi";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.tokens.access_token,
            refreshToken: res.data.tokens.refresh_token,
          }),
        );

        if (!res.data.user.is_verified) {
          router.replace("/(auth)/verify-notice");
          return;
        }

        const userRole = res.data.user.role;
        
        if (userRole === "BUSINESS_ADMIN") {
          router.replace("/(admin)/(tabs)");
        } else if (userRole === "VENDOR") {
          router.replace("/vendor");
        } else {
          // Explicitly target the index screen of the tabs
          router.replace("/(tabs)/");
        }
      }
    } catch (err: any) {
      setError(err?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-[24px] pt-[80px] pb-[40px]">
          <Text className="text-[24px] font-bold text-system-blue-dark text-center mb-[40px]">
            Login
          </Text>

          {error ? (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-600 text-[13px]">{error}</Text>
            </View>
          ) : null}

          <View className="mb-[28px]">
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

          <View className="mb-[28px]">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 text-[16px] text-system-blue-dark py-2"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-[18px] px-1">{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-gray-300 w-full" />
          </View>

          <View className="items-end mb-[32px] -mt-4">
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-[14px] text-system-blue-light font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            onPress={handleLogin}
            isLoading={isLoading}
            className="mb-6"
          >
            Login
          </Button>

          <View className="flex-row justify-center">
            <Text className="text-[#6B7280] text-[14px]">
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-system-blue-light text-[14px] font-semibold">
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
