import {
    PasswordCriteria,
    validatePassword,
} from "@/components/password-criteria";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/lib/api/authApi";
import { apiError } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";

// Vendor-only registration screen.
// Identical structure to the customer screen but role is hardcoded to VENDOR
// and there is no referral code field. Because the component tree never
// changes shape during user interaction, the Android keyboard-cleanup /
// navigation-context crash cannot occur here either.
export default function RegisterVendorScreen() {
  const [register, { isLoading }] = useRegisterMutation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid phone number (10–15 digits)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const criteria = validatePassword(password);
    if (
      !criteria.length ||
      !criteria.uppercase ||
      !criteria.lowercase ||
      !criteria.special
    ) {
      setError("Password does not meet all security requirements");
      return;
    }

    try {
      const res = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        password,
        role: "VENDOR",
      }).unwrap();

      if (res.success) {
        router.replace({
          pathname: "/(auth)/registration-success",
          params: { email },
        });
      }
    } catch (err: any) {
      setError(apiError(err, "Registration failed. Please try again."));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-[24px] pt-[20px] pb-[40px]">
            <Text className="text-[24px] font-bold text-system-blue-dark text-center mb-[4px]">
              Vendor Account
            </Text>
            <Text className="text-[14px] text-gray-500 text-center mb-[32px]">
              Start selling on Dandelionz
            </Text>

            {error ? (
              <View className="bg-red-50 p-3 rounded-lg mb-4">
                <Text className="text-red-600 text-[13px]">{error}</Text>
              </View>
            ) : null}

            <View className="mb-[28px]">
              <TextInput
                className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300"
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
              <TextInput
                className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300"
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-[28px]">
              <View className="relative">
                <TextInput
                  className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300 pr-10"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && <PasswordCriteria password={password} />}
            </View>

            <View className="mb-[32px]">
              <View className="relative">
                <TextInput
                  className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300 pr-10"
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              onPress={handleRegister}
              isLoading={isLoading}
              className="mb-6"
            >
              Register as Vendor
            </Button>

            <View className="flex-row justify-center mb-4">
              <Text className="text-[#6B7280] text-[14px]">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-system-blue-light text-[14px] font-semibold">
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Customer registration link */}
            <View className="flex-row justify-center items-center mt-2 pt-4 border-t border-gray-100">
              <Text className="text-[#6B7280] text-[14px]">
                Signing up as a customer?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-system-blue-light text-[14px] font-semibold">
                  Customer sign-up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
