import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { useDeleteAccountMutation } from "@/lib/api/vendorApi";
import { useLogout } from "@/lib/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VendorDeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useLogout();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const [password, setPassword] = useState("");

  const handleDelete = async () => {
    if (!password) {
      Toast.show({
        type: "error",
        text1: "Please enter your password to confirm.",
      });
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you absolutely sure you want to permanently close your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount({ password }).unwrap();
              Toast.show({
                type: "success",
                text1: "Your account has been closed.",
              });
              logout();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: err?.data?.message || "Failed to delete account.",
              });
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Close Account
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />

      <View className="flex-1 px-[21px] justify-center pb-20">
        <View className="w-20 h-20 bg-system-red rounded-full items-center justify-center mx-auto mb-8">
          <MaterialIcons name="close" size={48} color="white" />
        </View>

        <Text className="text-[22px] font-bold text-system-blue-dark text-center mb-4">
          Do you wish to{"\n"}permanently close{"\n"}to account?
        </Text>

        <View className="mb-8">
          <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase">
            Enter Password to Confirm
          </Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-[16px] text-system-blue-dark"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isLoading || !password}
            className="flex-1 py-4 bg-white border border-gray-300 rounded-xl items-center justify-center"
            style={{ opacity: isLoading || !password ? 0.5 : 1 }}
          >
            <Text className="text-gray-900 font-bold text-[16px]">
              {isLoading ? "Deleting..." : "Yes Please"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isLoading}
            className="flex-1 py-4 bg-system-red rounded-xl items-center justify-center"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <Text className="text-white font-bold text-[16px]">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
