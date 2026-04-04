import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { PinInput } from "@/components/ui/pin-input";
import { Colors } from "@/constants/theme";
import { useChangePaymentPinMutation } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AdminChangePin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [changePin, { isLoading }] = useChangePaymentPinMutation();

  const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);

  const handleUpdate = async () => {
    const oldP = currentPin.join("");
    const newP = newPin.join("");
    const confP = confirmPin.join("");

    if (newP.length < 4 || confP.length < 4) {
      Toast.show({ type: "error", text1: "Please fill in all PIN fields." });
      return;
    }

    if (newP !== confP) {
      Toast.show({ type: "error", text1: "New PIN and confirm PIN do not match." });
      return;
    }

    try {
      await changePin({ 
        current_pin: oldP || undefined, 
        new_pin: newP, 
        confirm_pin: confP 
      }).unwrap();
      Toast.show({ type: "success", text1: "Payment PIN updated successfully." });
      router.back();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to update PIN." 
      });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Change Payment PIN
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={11} />
      
      <ScrollView className="flex-1 px-[21px] pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-[14px] font-semibold text-system-blue-dark mb-4">Current PIN</Text>
          <PinInput value={currentPin} onChange={setCurrentPin} />
        </View>

        <View className="mb-8">
          <Text className="text-[14px] font-semibold text-system-blue-dark mb-4">New 4-Digit PIN</Text>
          <PinInput value={newPin} onChange={setNewPin} />
        </View>

        <View className="mb-10">
          <Text className="text-[14px] font-semibold text-system-blue-dark mb-4">Confirm New PIN</Text>
          <PinInput value={confirmPin} onChange={setConfirmPin} />
        </View>

        <View className="gap-3">
          <Button onPress={handleUpdate} isLoading={isLoading}>
            Update PIN
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            Discard
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
