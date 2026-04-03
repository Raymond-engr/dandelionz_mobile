import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
} from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: profileResponse,
    isLoading,
    refetch,
  } = useGetAdminProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateAdminProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const profile = profileResponse?.data;

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phoneNumber: profile.phone_number || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
      }).unwrap();
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
      refetch();
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const initials = formData.fullName
    ? formData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AD";

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

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
          My Profile
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="p-[21px]">
          {/* Profile Picture */}
          <View className="flex-row items-center gap-4 mb-8">
            <View className="w-[64px] h-[64px] rounded-full bg-system-blue-light items-center justify-center relative">
              <Text className="text-white text-[22px] font-bold">
                {initials}
              </Text>
              <View className="absolute bottom-0 right-0 w-6 h-6 bg-system-blue-light rounded-full items-center justify-center border-2 border-white">
                <MaterialIcons name="camera-alt" size={12} color="white" />
              </View>
            </View>
            <View>
              <Text className="text-[18px] font-bold text-system-blue-dark">
                {formData.fullName || "Admin User"}
              </Text>
              <Text className="text-[14px] text-gray-500">
                {formData.email}
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="gap-6 mb-8">
            <View>
              <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Full Name
              </Text>
              <TextInput
                value={formData.fullName}
                onChangeText={(val) =>
                  setFormData({ ...formData, fullName: val })
                }
                editable={isEditing}
                className={`text-[16px] text-system-blue-dark py-2 border-b ${
                  isEditing ? "border-system-blue-light" : "border-gray-100"
                }`}
              />
            </View>

            <View>
              <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Email Address
              </Text>
              <TextInput
                value={formData.email}
                editable={false}
                className="text-[16px] text-gray-400 py-2 border-b border-gray-100"
              />
            </View>

            <View>
              <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Phone Number
              </Text>
              <TextInput
                value={formData.phoneNumber}
                onChangeText={(val) =>
                  setFormData({ ...formData, phoneNumber: val })
                }
                editable={isEditing}
                keyboardType="phone-pad"
                className={`text-[16px] text-system-blue-dark py-2 border-b ${
                  isEditing ? "border-system-blue-light" : "border-gray-100"
                }`}
              />
            </View>

            <View>
              <Text className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value="••••••••"
                  editable={false}
                  secureTextEntry={!showPassword}
                  className="text-[16px] text-system-blue-dark py-2 border-b border-gray-100 pr-10"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(admin)/account/change-password" as any)
                }
              >
                <Text className="text-system-blue-light font-bold mt-2">
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-4">
            {!isEditing ? (
              <Button onPress={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button onPress={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        fullName: profile.full_name || "",
                        email: profile.email || "",
                        phoneNumber: profile.phone_number || "",
                      });
                    }
                  }}
                  className="w-full py-4 items-center"
                >
                  <Text className="text-gray-500 font-bold">
                    Discard Changes
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
