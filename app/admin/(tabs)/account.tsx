import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetAdminProfileQuery } from "@/lib/api/adminApi";
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
        <Text
          className={`text-[16px] font-medium ${danger ? "text-system-red" : "text-system-blue-dark"}`}
        >
          {label}
        </Text>
        {!danger && (
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        )}
      </Pressable>
      {!last && <View className="h-[1px] bg-[#F5F7FA] mx-[21px]" />}
    </View>
  );
}

export default function AdminAccountScreen() {
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

  const { data: profileResponse, isLoading } = useGetAdminProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );
  const profile = profileResponse?.data;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AD";

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
      {/* User Info */}
      <View className="flex-row items-center p-[21px] border-b border-gray-100">
        <View className="w-[64px] h-[64px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
          {profile?.profile_picture ? (
            <Image
              source={{ uri: profile.profile_picture }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-white text-[22px] font-bold">{initials}</Text>
          )}
        </View>
        <View className="ml-4 flex-1">
          <Text
            className="text-[18px] font-bold text-system-blue-dark"
            numberOfLines={1}
          >
            {profile?.full_name || "Admin User"}
          </Text>
          <Text className="text-[14px] text-[#6B7280]" numberOfLines={1}>
            {profile?.email}
          </Text>
        </View>
      </View>

      {/* Group 1: Profile, Notification, Payment Settings */}
      <View>
        <MenuRow
          label="My Profile"
          onPress={() => router.push("/(admin)/account/profile" as any)}
        />
        <MenuRow
          label="Notification"
          onPress={() => router.push("/(admin)/account/notifications" as any)}
        />
        <MenuRow
          label="Payment Settings"
          onPress={() => router.push("/(admin)/payment-settings" as any)}
          last
        />
      </View>

      <Divider />

      {/* Group 2: Analytics, Payments & Settlements, Withdrawal Management, Withdraw Earnings */}
      <View>
        <MenuRow
          label="Analytics"
          onPress={() => router.push("/(admin)/analytics" as any)}
        />
        <MenuRow
          label="Payments & Settlements"
          onPress={() => router.push("/(admin)/settlements" as any)}
        />
        <MenuRow
          label="Withdraw Earnings"
          onPress={() => router.push("/(admin)/withdraw-earnings" as any)}
          last
        />
      </View>

      <Divider />

      {/* Group 3: FAQs, Terms and Conditions, Contact Support */}
      <View>
        <MenuRow
          label="FAQs"
          onPress={() => router.push("/(admin)/account/admin-faqs" as any)}
        />
        <MenuRow
          label="Terms and Conditions"
          onPress={() => router.push("/terms" as any)}
        />
        <MenuRow
          label="Contact Support"
          onPress={() => router.push("/contact" as any)}
          last
        />
      </View>

      <Divider />

      {/* Logout */}
      <View className="px-[21px] mt-8">
        <Button
          variant="outline"
          onPress={handleLogout}
          className="border-system-red"
        >
          <Text className="text-system-red">Logout</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
