import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetVendorProfileQuery } from "@/lib/api/vendorApi";
import { useAppSelector, useLogout } from "@/lib/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MenuRow({
  label,
  onPress,
  danger = false,
  last = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row justify-between items-center py-4 px-[21px] active:bg-gray-50"
      >
        <Text className={`text-[16px] font-medium ${danger ? "text-system-red" : "text-system-blue-dark"}`}>
          {label}
        </Text>
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={danger ? "#ef4444" : "#9CA3AF"} 
        />
      </Pressable>
      {!last && <View className="h-[1px] bg-[#F5F7FA] mx-[21px]" />}
    </View>
  );
}

export default function VendorAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", onPress: logout, style: "destructive" }
      ]
    );
  };

  const { data: profileData, isLoading } = useGetVendorProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const user = {
    name: profileData?.data?.user?.full_name ?? "Vendor",
    email: profileData?.data?.user?.email ?? "",
    avatar: profileData?.data?.user?.profile_picture ?? null,
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "V";

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="p-4 border-b border-gray-100 items-center justify-center">
        <Text className="text-[20px] font-bold text-system-blue-dark">Account</Text>
      </View>

      {/* User Section */}
      <View className="flex-row items-center p-[21px] border-b border-gray-100">
        <View className="w-[64px] h-[64px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          ) : (
            <Text className="text-white text-[22px] font-bold">{initials}</Text>
          )}
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-bold text-system-blue-dark" numberOfLines={1}>
            {user.name}
          </Text>
          <Text className="text-[14px] text-[#6B7280]" numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* Group 1: Profile, Notification, Payment Settings */}
      <View>
        <MenuRow label="My Profile" onPress={() => router.push("/vendor/account/profile" as any)} />
        <MenuRow label="Notification" onPress={() => router.push("/vendor/account/notifications" as any)} />
        <MenuRow label="Payment Settings" onPress={() => router.push("/vendor/account/payment-settings" as any)} last />
      </View>

      <Divider />

      {/* Group 2: Logout & Close Account */}
      <View>
        <MenuRow label="Logout" onPress={handleLogout} danger />
        <MenuRow label="Close Account" onPress={() => router.push("/vendor/account/delete" as any)} danger last />
      </View>

      <Divider />

      {/* Group 3: FAQs, Terms, Contact Us */}
      <View>
        <MenuRow label="FAQs" onPress={() => router.push("/vendor/account/vendor-faqs" as any)} />
        <MenuRow label="Terms and Conditions" onPress={() => router.push("/vendor/account/vendor-terms" as any)} />
        <MenuRow label="Contact Us" onPress={() => router.push("/contact" as any)} last />
      </View>

      <Divider />
    </ScrollView>
  );
}
