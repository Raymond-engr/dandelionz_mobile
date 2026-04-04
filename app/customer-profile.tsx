import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
    useGetCustomerProfileQuery,
    useUpdateCustomerProfileMutation,
    useUploadCustomerPhotoMutation,
} from "@/lib/api/customerApi";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
import Toast from "react-native-toast-message";

export default function CustomerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: profileResponse,
    isLoading,
    refetch,
  } = useGetCustomerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateCustomerProfileMutation();
  const [uploadPhoto, { isLoading: isUploading }] =
    useUploadCustomerPhotoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const profile = profileResponse?.user;

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phoneNumber: profile.phone_number || "",
      });
    }
  }, [profile]);

  const initials = form.fullName
    ? form.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ 
        type: "error", 
        text1: "Permission required", 
        text2: "Please allow photo library access to update your profile picture." 
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      const formData = new FormData();
      formData.append("profile_picture", {
        uri,
        name: filename,
        type,
      } as any);
      try {
        await uploadPhoto(formData).unwrap();
        Toast.show({ type: "success", text1: "Profile photo updated!" });
        refetch();
      } catch {
        Toast.show({ type: "error", text1: "Failed to upload photo. Please try again." });
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: form.fullName,
        phone_number: form.phoneNumber,
      } as any).unwrap();
      Toast.show({ type: "success", text1: "Profile updated successfully!" });
      setIsEditing(false);
      refetch();
    } catch {
      Toast.show({ type: "error", text1: "Failed to update profile. Please try again." });
    }
  };

  const handleDiscard = () => {
    setIsEditing(false);
    if (profile) {
      setForm({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phoneNumber: profile.phone_number || "",
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
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
        showsVerticalScrollIndicator={false}
      >
        <View className="p-[21px]">
          {/* Avatar Section */}
          <View className="flex-row items-center gap-4 mb-8">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              <View className="w-[64px] h-[64px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
                {profile?.profile_picture ? (
                  <Image
                    source={{ uri: profile.profile_picture }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-white text-[22px] font-bold">
                    {initials}
                  </Text>
                )}
              </View>
              {isUploading ? (
                <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 w-6 h-6 bg-system-blue-light rounded-full items-center justify-center border-2 border-white">
                  <MaterialIcons name="camera-alt" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text className="text-[18px] font-bold text-system-blue-dark">
                {form.fullName || "Customer"}
              </Text>
              <Text className="text-[14px] text-gray-500">{form.email}</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="gap-6">
          {/* Full Name */}
          <View>
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Full Name
            </Text>
            <TextInput
              value={form.fullName}
              onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))}
              editable={isEditing}
              placeholder="Your full name"
              className={`text-[16px] text-system-blue-dark py-2 border-b ${
                isEditing ? "border-system-blue-light" : "border-gray-100"
              }`}
            />
          </View>

          {/* Email — always disabled */}
          <View>
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </Text>
            <TextInput
              value={form.email}
              editable={false}
              className="text-[16px] text-gray-400 py-2 border-b border-gray-100"
            />
          </View>

          {/* Phone Number */}
          <View>
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Phone Number
            </Text>
            <TextInput
              value={form.phoneNumber}
              onChangeText={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder="Your phone number"
              className={`text-[16px] text-system-blue-dark py-2 border-b ${
                isEditing ? "border-system-blue-light" : "border-gray-100"
              }`}
            />
          </View>

          {/* Change Password link */}
          <TouchableOpacity
            onPress={() => router.push("/account/change-password" as any)}
          >
            <Text className="text-system-blue-light font-semibold text-[14px]">
              Change Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="mt-8 gap-4">
          {!isEditing ? (
            <Button onPress={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <>
              <Button onPress={handleSave} isLoading={isSaving}>
                Save Changes
              </Button>
              <Button variant="outline" onPress={handleDiscard}>
                Discard Changes
              </Button>
            </>
          )}
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
