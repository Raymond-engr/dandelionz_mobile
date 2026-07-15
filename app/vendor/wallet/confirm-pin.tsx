import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { PinInput } from "@/components/ui/pin-input";
import { Colors } from "@/constants/theme";
import { useVendorRequestWithdrawalMutation } from "@/lib/api/vendorApi";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiError, formatCurrency } from "@/lib/utils";

const SECURE_PIN_KEY = "user_payment_pin";

export default function ConfirmPinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>();

  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [withdraw, { isLoading }] = useVendorRequestWithdrawalMutation();

  // --- Biometric Logic ---
  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const savedPin = await SecureStore.getItemAsync(SECURE_PIN_KEY);

    if (hasHardware && isEnrolled && savedPin) {
      setIsBiometricAvailable(true);
      handleBiometricAuth(savedPin);
    }
  };

  const handleBiometricAuth = async (savedPin?: string) => {
    const pinToUse = savedPin || (await SecureStore.getItemAsync(SECURE_PIN_KEY));
    if (!pinToUse) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm Withdrawal with FaceID/Fingerprint",
      fallbackLabel: "Use PIN instead",
    });

    if (result.success) {
      // Auto-fill and confirm
      setPin(pinToUse.split(""));
      processWithdrawal(pinToUse);
    }
  };

  const processWithdrawal = async (fullPin: string) => {
    setError("");
    try {
      await withdraw({
        amount: params.amount ?? "0",
        pin: fullPin,
      }).unwrap();

      // If successful and not already saved, ask to save for next time
      const savedPin = await SecureStore.getItemAsync(SECURE_PIN_KEY);
      if (!savedPin) {
        Alert.alert(
          "Enable Biometrics",
          "Would you like to use FaceID/Fingerprint for future withdrawals?",
          [
            { text: "No", style: "cancel" },
            {
              text: "Yes",
              onPress: async () => {
                await SecureStore.setItemAsync(SECURE_PIN_KEY, fullPin);
                setIsBiometricAvailable(true);
              },
            },
          ]
        );
      }

      router.replace({
        pathname: "/vendor/wallet/success",
        params: { 
          amount: params.amount,
          accountName: params.accountName,
          accountNumber: params.accountNumber,
          bankName: params.bankName
        }
      } as any);
    } catch (err: any) {
      setError(apiError(err, "Incorrect PIN. Please try again."));
      setPin(["", "", "", ""]);
    }
  };

  const handleConfirm = () => {
    const fullPin = pin.join("");
    if (fullPin.length < 4) {
      setError("Please enter your 4-digit payment PIN.");
      return;
    }
    processWithdrawal(fullPin);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Confirmation
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={11} />

      <View className="flex-1 px-[21px] pt-8">
        {/* Summary Card */}
        <View className="bg-gray-50 border border-gray-100 rounded-[20px] p-6 mb-10 shadow-sm">
          <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">
            Withdraw Amount
          </Text>
          <Text className="text-[32px] font-bold text-system-blue-dark text-center mb-6">
            {formatCurrency(params.amount)}
          </Text>

          <Divider height={1} className="mb-6 opacity-20" />

          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-[13px] text-gray-500">Bank</Text>
              <Text className="text-[13px] font-bold text-system-blue-dark">
                {params.bankName}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[13px] text-gray-500">Account No.</Text>
              <Text className="text-[13px] font-bold text-system-blue-dark">
                {params.accountNumber}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[13px] text-gray-500">Account Name</Text>
              <Text
                className="text-[13px] font-bold text-system-blue-dark flex-1 text-right ml-4"
                numberOfLines={1}
              >
                {params.accountName}
              </Text>
            </View>
          </View>
        </View>

        {/* PIN Entry */}
        <Text className="text-[18px] font-bold text-system-blue-dark text-center mb-2">
          Enter Payment PIN
        </Text>
        <Text className="text-[14px] text-gray-500 text-center mb-8">
          Verify your identity to authorize this withdrawal
        </Text>

        <View className="items-center mb-10">
          <PinInput value={pin} onChange={(v) => { setPin(v); setError(""); }} error={!!error} />
        </View>

        {error ? (
          <Text className="text-red-500 text-center text-[13px] mb-6 font-medium">
            {error}
          </Text>
        ) : null}

        <View className="mt-4">
          <Button
            onPress={handleConfirm}
            isLoading={isLoading}
            disabled={pin.some((d) => !d)}
          >
            Confirm Withdrawal
          </Button>

          {isBiometricAvailable && (
            <Pressable
              onPress={() => handleBiometricAuth()}
              className="mt-6 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="finger-print" size={20} color={Colors.primary} />
              <Text className="text-system-blue-light font-semibold">
                Use Biometrics
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => router.push("/vendor/account/forgot-pin" as any)}
            className="mt-6 items-center"
          >
            <Text className="text-system-blue-light font-semibold">
              Forgot PIN?
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
