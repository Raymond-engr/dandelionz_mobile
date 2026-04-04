import { Colors } from "@/constants/theme";
import { useDeleteCustomerAccountMutation } from "@/lib/api/customerApi";
import { useLogout } from "@/lib/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useLogout();
  const [deleteAccount, { isLoading }] = useDeleteCustomerAccountMutation();
  const [password, setPassword] = useState("");

  const handleDelete = () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you absolutely sure? This action permanently closes your account and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount({ password }).unwrap();
              Alert.alert("Success", "Your account has been closed.", [
                { text: "OK", onPress: logout },
              ]);
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.data?.message ||
                  "Failed to delete account. Please check your password.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[18px] font-bold text-system-blue-light text-center flex-1">
          Delete Account
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-[21px] justify-center pb-20">
        {/* Icon */}
        <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mx-auto mb-8">
          <MaterialIcons name="close" size={48} color="#FF4D4D" />
        </View>

        <Text className="text-[22px] font-bold text-system-blue-dark text-center mb-4">
          Permanently close{"\n"}your account?
        </Text>

        <Text className="text-[14px] text-gray-500 text-center mb-8 px-4 leading-6">
          This will permanently delete all your data, orders, and wishlist. This
          action cannot be undone.
        </Text>

        {/* Password */}
        <View className="mb-8">
          <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Enter Password to Confirm
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            className="border border-gray-200 rounded-xl px-4 py-3 text-[16px] text-system-blue-dark bg-[#F9FAFB]"
          />
        </View>

        {/* Buttons */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isLoading || !password}
            className="flex-1 h-[55px] bg-white border border-gray-300 rounded-xl items-center justify-center"
            style={{ opacity: isLoading || !password ? 0.5 : 1 }}
          >
            <Text className="text-gray-900 font-bold text-[16px]">
              {isLoading ? "Deleting..." : "Yes Please"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isLoading}
            className="flex-1 h-[55px] bg-system-red rounded-xl items-center justify-center"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <Text className="text-white font-bold text-[16px]">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
