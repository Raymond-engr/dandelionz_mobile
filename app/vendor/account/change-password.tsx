import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PasswordCriteria, validatePassword } from "@/components/password-criteria";
import { Colors } from "@/constants/theme";
import { useChangeVendorPasswordMutation } from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VendorChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [changePassword, { isLoading }] = useChangeVendorPasswordMutation();

  const [step, setStep] = useState<1 | 2>(1);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleNext = () => {
    if (passwords.current) {
      setStep(2);
    } else {
      Toast.show({ type: "error", text1: "Please enter your current password." });
    }
  };

  const handleUpdate = async () => {
    const c = validatePassword(passwords.new);
    if (!c.length || !c.uppercase || !c.lowercase || !c.special) {
      Toast.show({ type: "error", text1: "New password does not meet security requirements." });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Toast.show({ type: "error", text1: "Passwords do not match." });
      return;
    }

    try {
      await changePassword({
        current_password: passwords.current,
        new_password: passwords.new,
      }).unwrap();
      
      Toast.show({ type: "success", text1: "Password changed successfully!" });
      router.back();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to change password." 
      });
      setStep(1);
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => step === 2 ? setStep(1) : router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Change Password
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />

      <ScrollView className="flex-1 px-[21px] pt-10">
        {step === 1 ? (
          <View>
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Current Password</Text>
            <View className="relative mb-8">
              <TextInput
                className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark pr-10"
                value={passwords.current}
                onChangeText={(t) => setPasswords({ ...passwords, current: t })}
                secureTextEntry={!showPasswords.current}
                placeholder="Enter current password"
              />
              <Pressable 
                onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-0 top-3"
              >
                <MaterialIcons 
                  name={showPasswords.current ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </Pressable>
            </View>
            <Button onPress={handleNext}>
              Proceed
            </Button>
          </View>
        ) : (
          <View>
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">New Password</Text>
            <View className="relative mb-4">
              <TextInput
                className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark pr-10"
                value={passwords.new}
                onChangeText={(t) => setPasswords({ ...passwords, new: t })}
                secureTextEntry={!showPasswords.new}
                placeholder="Enter new password"
              />
              <Pressable 
                onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-0 top-3"
              >
                <MaterialIcons 
                  name={showPasswords.new ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </Pressable>
            </View>
            
            <PasswordCriteria password={passwords.new} />

            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2 mt-8">Confirm New Password</Text>
            <View className="relative mb-10">
              <TextInput
                className="border-b border-gray-200 py-3 text-[16px] text-system-blue-dark pr-10"
                value={passwords.confirm}
                onChangeText={(t) => setPasswords({ ...passwords, confirm: t })}
                secureTextEntry={!showPasswords.confirm}
                placeholder="Confirm new password"
              />
              <Pressable 
                onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-0 top-3"
              >
                <MaterialIcons 
                  name={showPasswords.confirm ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </Pressable>
            </View>

            <Button onPress={handleUpdate} isLoading={isLoading}>
              Update Password
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
