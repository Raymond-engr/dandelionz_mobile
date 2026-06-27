import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useSetCustomerPaymentPinMutation } from "@/lib/api/customerApi";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CustomerSetPinScreen() {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [setPaymentPin, { isLoading }] = useSetCustomerPaymentPinMutation();

  const handleSave = async () => {
    if (pin.length !== 4) {
      Toast.show({ type: "error", text1: "PIN must be exactly 4 digits." });
      return;
    }
    if (pin !== confirm) {
      Toast.show({ type: "error", text1: "PINs do not match." });
      return;
    }
    if (pin === "0000") {
      Toast.show({ type: "error", text1: "PIN cannot be 0000." });
      return;
    }
    try {
      await setPaymentPin({ pin, confirm_pin: confirm }).unwrap();
      Toast.show({ type: "success", text1: "Payment PIN set successfully!" });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.data?.message || "Failed to set PIN.",
      });
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          Set Payment PIN
        </Text>
        <View className="w-10" />
      </View>

      <View className="px-[21px] pt-8 gap-5">
        <Text className="text-[14px] text-gray-500">
          Set a 4-digit PIN to authorise withdrawals from your wallet.
        </Text>

        <View>
          <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            New PIN
          </Text>
          <TextInput
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            placeholder="····"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F5F7FA] rounded-2xl px-5 py-4 text-[24px] tracking-[8px] text-system-blue-dark text-center"
          />
        </View>

        <View>
          <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Confirm PIN
          </Text>
          <TextInput
            value={confirm}
            onChangeText={(v) => setConfirm(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            placeholder="····"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F5F7FA] rounded-2xl px-5 py-4 text-[24px] tracking-[8px] text-system-blue-dark text-center"
          />
        </View>

        <Button
          onPress={handleSave}
          disabled={isLoading || pin.length !== 4 || confirm.length !== 4}
        >
          {isLoading ? "Saving…" : "Save PIN"}
        </Button>
      </View>
    </View>
  );
}
