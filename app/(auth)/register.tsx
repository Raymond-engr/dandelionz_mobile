import {
  PasswordCriteria,
  validatePassword,
} from "@/components/password-criteria";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/lib/api/authApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [register, { isLoading }] = useRegisterMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }

    // Password matching
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password strength
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
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone_number: phone.trim(),
        password,
        role: role,
        ...(role === "CUSTOMER" && referralCode
          ? { referral_code: referralCode.toUpperCase() }
          : {}),
      }).unwrap();

      if (res.success) {
        router.replace({
          pathname: "/(auth)/registration-success",
          params: { email },
        });
      }
    } catch (err: any) {
      setError(
        err?.data?.error ||
          err?.data?.message ||
          "Registration failed. Please try again.",
      );
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
            <Text className="text-[24px] font-bold text-system-blue-dark text-center mb-[32px]">
              Create Account
            </Text>

            {error ? (
              <View className="bg-red-50 p-3 rounded-lg mb-4">
                <Text className="text-red-600 text-[13px]">{error}</Text>
              </View>
            ) : null}

            {/* Role Selector */}
            <View className="flex-row mb-[28px] bg-gray-100 p-1 rounded-xl">
              <Pressable
                onPress={() => setRole("CUSTOMER")}
                className={`flex-1 py-2 rounded-lg items-center ${role === "CUSTOMER" ? "bg-white shadow-sm" : ""}`}
              >
                <Text
                  className={`font-medium ${role === "CUSTOMER" ? "text-system-blue-dark" : "text-gray-500"}`}
                >
                  Customer
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole("VENDOR")}
                className={`flex-1 py-2 rounded-lg items-center ${role === "VENDOR" ? "bg-white shadow-sm" : ""}`}
              >
                <Text
                  className={`font-medium ${role === "VENDOR" ? "text-system-blue-dark" : "text-gray-500"}`}
                >
                  Vendor
                </Text>
              </Pressable>
            </View>

            <View className="flex-row gap-4 mb-[28px]">
              <View className="flex-1">
                <TextInput
                  className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300"
                  placeholder="First Name"
                  placeholderTextColor="#9CA3AF"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300"
                  placeholder="Last Name"
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
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

            <View className="mb-[28px]">
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

            {role === "CUSTOMER" && (
              <View className="mb-[28px]">
                <TextInput
                  className="text-[16px] text-system-blue-dark py-2 border-b border-gray-300"
                  placeholder="Referral Code (Optional)"
                  placeholderTextColor="#9CA3AF"
                  value={referralCode}
                  onChangeText={(val) => setReferralCode(val.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>
            )}

            <TouchableOpacity
              className="flex-row items-center gap-2 mb-[32px]"
              onPress={() => setRememberPassword(!rememberPassword)}
            >
              <View
                className={`w-5 h-5 rounded border items-center justify-center ${rememberPassword ? "bg-system-blue-light border-system-blue-light" : "border-gray-300"}`}
              >
                {rememberPassword && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-[14px] text-gray-600">
                Remember my Password
              </Text>
            </TouchableOpacity>

            <Button
              onPress={handleRegister}
              isLoading={isLoading}
              className="mb-6"
            >
              Register
            </Button>

            <View className="flex-row justify-center">
              <Text className="text-[#6B7280] text-[14px]">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-system-blue-light text-[14px] font-semibold">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
