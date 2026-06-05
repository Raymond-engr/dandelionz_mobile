import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
  useUploadVendorPhotoMutation,
} from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface NominatimResult {
  place_id: number;
  display_name: string;
}

const InputField = ({
  label,
  value,
  onChangeText,
  disabled,
  placeholder,
  multiline,
  keyboardType,
  isEditing,
}: any) => (
  <View className="mb-6">
    <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </Text>
    <TextInput
      className={`border-b border-gray-200 py-2 text-[16px] text-system-blue-dark ${disabled ? "text-gray-400" : ""}`}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled && isEditing}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

export default function VendorProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: profileData, isLoading, refetch } = useGetVendorProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateVendorProfileMutation();
  const [uploadPhoto, { isLoading: isUploading }] =
    useUploadVendorPhotoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    storeName: "",
    storeDescription: "",
    phoneNumber: "",
    address: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profileData?.data) {
      const p = profileData.data;
      setFormData({
        fullName: p.user.full_name || "",
        storeName: p.store_name || "",
        storeDescription: p.store_description || "",
        phoneNumber: p.user.phone_number || "",
        address: p.address || "",
        bankName: p.bank_name || "",
        accountNumber: p.account_number || "",
        accountName: p.account_name || "",
      });
    }
  }, [profileData]);

  const searchAddress = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=ng`,
          { headers: { "User-Agent": "DandelionzApp/1.0" } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const photoFormData = new FormData();
      // @ts-ignore
      photoFormData.append("profile_picture", {
        uri: localUri,
        name: filename,
        type,
      });

      try {
        await uploadPhoto(photoFormData).unwrap();
        Toast.show({ type: "success", text1: "Profile photo updated!" });
        refetch();
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err?.data?.message || "Failed to upload photo",
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: formData.fullName,
        store_name: formData.storeName,
        store_description: formData.storeDescription,
        address: formData.address,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
      }).unwrap();

      setIsEditing(false);
      Toast.show({ type: "success", text1: "Profile updated successfully!" });
      refetch();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.data?.message || "Failed to update profile",
      });
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/vendor/(tabs)/account");
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={handleBack} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        My Profile
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  const p = profileData?.data;
  const initials =
    p?.user.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "V";

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={11} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-[21px]">
          {/* Profile Picture Section */}
          <View className="flex-row items-center gap-4 mb-8">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              <View className="w-[64px] h-[64px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
                {p?.user.profile_picture ? (
                  <Image
                    source={{ uri: p.user.profile_picture }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-white text-[22px] font-bold">
                    {initials}
                  </Text>
                )}
              </View>
              {isEditing && (
                <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-system-blue-light border-2 border-white items-center justify-center">
                  <MaterialIcons name="camera-alt" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text className="text-[18px] font-bold text-system-blue-dark">
                {p?.user.full_name || "Vendor"}
              </Text>
              <Text className="text-[14px] text-gray-500">{p?.user.email}</Text>
            </View>
          </View>

          <InputField
            label="Full Name"
            value={formData.fullName}
            onChangeText={(t: string) =>
              setFormData({ ...formData, fullName: t })
            }
            isEditing={isEditing}
          />
          <InputField label="Email Address" value={p?.user.email} disabled isEditing={isEditing} />

          <InputField
            label="Store Name"
            value={formData.storeName}
            onChangeText={(t: string) =>
              setFormData({ ...formData, storeName: t })
            }
            isEditing={isEditing}
          />

          <InputField
            label="Store Description"
            value={formData.storeDescription}
            onChangeText={(t: string) =>
              setFormData({ ...formData, storeDescription: t })
            }
            multiline
            isEditing={isEditing}
          />

          <InputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(t: string) =>
              setFormData({ ...formData, phoneNumber: t })
            }
            keyboardType="phone-pad"
            isEditing={isEditing}
          />

          <View className="mb-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Address
            </Text>
            <TextInput
              className={`border-b border-gray-200 py-2 text-[16px] text-system-blue-dark ${
                !isEditing ? "text-gray-400" : ""
              }`}
              value={formData.address}
              onChangeText={(t) => {
                setFormData({ ...formData, address: t });
                if (isEditing) searchAddress(t);
              }}
              editable={isEditing}
              placeholder={isEditing ? "Start typing to search..." : ""}
            />
            {isSearching && isEditing && (
              <ActivityIndicator
                size="small"
                color="#030482"
                style={{ marginTop: 4 }}
              />
            )}
            {suggestions.length > 0 && isEditing && (
              <View className="border border-gray-200 rounded-xl bg-white mt-1 shadow-sm max-h-40 overflow-hidden">
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={String(item.place_id)}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        address: item.display_name,
                      });
                      setSuggestions([]);
                    }}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text
                      className="text-[13px] text-system-blue-dark"
                      numberOfLines={2}
                    >
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Divider height={1} className="my-4 opacity-30" />
          <Text className="text-[14px] font-bold text-system-blue-light mb-6">
            Payment Information
          </Text>

          <InputField
            label="Bank Name"
            value={formData.bankName}
            onChangeText={(t: string) =>
              setFormData({ ...formData, bankName: t })
            }
            isEditing={isEditing}
          />

          <InputField
            label="Account Number"
            value={formData.accountNumber}
            onChangeText={(t: string) =>
              setFormData({ ...formData, accountNumber: t })
            }
            keyboardType="numeric"
            isEditing={isEditing}
          />

          <InputField
            label="Account Name"
            value={formData.accountName}
            onChangeText={(t: string) =>
              setFormData({ ...formData, accountName: t })
            }
            isEditing={isEditing}
          />

          <View className="mb-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Password
            </Text>
            <View className="relative">
              <TextInput
                value="••••••••"
                editable={false}
                secureTextEntry={!showPassword}
                className="border-b border-gray-200 py-2 text-[16px] text-system-blue-dark pr-10"
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
                router.push("/vendor/account/change-password" as any)
              }
            >
              <Text className="text-system-blue-light font-bold mt-2">
                Change Password
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8 gap-4">
            {!isEditing ? (
              <Button onPress={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button onPress={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
                <Button variant="outline" onPress={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
