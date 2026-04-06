import { Divider } from "@/components/ui/divider";
import { useGetVendorProfileQuery } from "@/lib/api/vendorApi";
import { useAppSelector, useLogout } from "@/lib/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SectionRow({
  label,
  route,
  last = false,
  danger = false,
}: {
  label: string;
  route: string;
  last?: boolean;
  danger?: boolean;
}) {
  const router = useRouter();
  return (
    <View>
      <Pressable
        onPress={() => router.push(route as any)}
        className="flex-row justify-between items-center py-4 px-[21px] active:bg-gray-50"
      >
        <Text
          className={`text-[16px] font-medium ${
            danger ? "text-system-red" : "text-system-blue-dark"
          }`}
        >
          {label}
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={danger ? "#FF4D4D" : "#9CA3AF"}
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
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", onPress: logout, style: "destructive" },
    ]);
  };

  const { data: profileData, isLoading } = useGetVendorProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const profile = profileData?.data?.user;

  const user = {
    name: profile?.full_name ?? "Vendor",
    email: profile?.email ?? "",
    avatar: profile?.profile_picture ?? null,
  };

  const initials =
    user.name
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
      {/* Profile Header */}
      <View className="flex-row items-center p-[21px] border-b border-gray-100">
        <Pressable
          onPress={() => router.push("/vendor/account/profile" as any)}
          className="relative"
        >
          <View className="w-[60px] h-[60px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white text-[20px] font-bold">
                {initials}
              </Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 w-5 h-5 bg-system-blue-light rounded-full items-center justify-center border-2 border-white">
            <MaterialIcons name="camera-alt" size={10} color="white" />
          </View>
        </Pressable>
        <View className="ml-4 flex-1">
          <Text
            className="text-[18px] font-bold text-system-blue-dark"
            numberOfLines={1}
          >
            {user.name}
          </Text>
          <Text className="text-[14px] text-[#6B7280]" numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* Group 1: Profile & Account */}
      <View>
        <SectionRow label="My Profile" route="/vendor/account/profile" />
        <SectionRow
          label="Notifications"
          route="/vendor/account/notifications"
        />
        <SectionRow
          label="Payment Settings"
          route="/vendor/account/payment-settings"
          last
        />
      </View>

      <Divider />

      {/* Group 2: Settings */}
      <View>
        <SectionRow
          label="Change Password"
          route="/vendor/account/change-password"
          last
        />
      </View>

      <Divider />

      {/* Group 3: Support & Information */}
      <View>
        <SectionRow label="Contact Us" route="/contact" />
        <SectionRow label="FAQs" route="/vendor/account/vendor-faqs" />
        <SectionRow
          label="Terms & Conditions"
          route="/vendor/account/vendor-terms"
          last
        />
      </View>

      <Divider />

      {/* Group 4: Danger zone */}
      <View>
        <SectionRow
          label="Delete Account"
          route="/vendor/account/delete"
          danger
          last
        />
      </View>

      <Divider />

      {/* Logout */}
      <View className="px-[21px] mt-8">
        <Pressable
          onPress={handleLogout}
          className="w-full h-[55px] border border-system-red rounded-[12px] items-center justify-center active:bg-red-50"
        >
          <Text className="text-system-red font-semibold text-[16px]">
            Log Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
