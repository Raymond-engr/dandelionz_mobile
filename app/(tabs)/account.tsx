import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetCustomerProfileQuery } from "@/lib/api/customerApi";
import { useAppSelector, useLogout } from "@/lib/hooks";
import { MaterialIcons } from "@expo/vector-icons";
// Imperative router — NOT useRouter() hook.
// This screen stays mounted in the background when admin/vendor is active
// (React Navigation keeps inactive Stack screens alive by default with the
// new architecture). If useRouter() is called during a background re-render
// triggered by any Redux dispatch, it fails with "navigation context not found"
// because the screen's navigation context may not be available when it is not
// the active navigator. The imperative `router` uses a stable global ref that
// always works regardless of which navigator is currently active.
import { router } from "expo-router";
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

export default function AccountScreen() {
  "use no memo";
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", onPress: logout, style: "destructive" },
    ]);
  };

  // This tab stays mounted under the admin/vendor stacks, so without the role
  // check it fires a customer-only request for whoever is logged in — a 403 for
  // any non-customer. `profile` below already falls back to `authUser`.
  const { data: profileResponse, isLoading } = useGetCustomerProfileQuery(
    undefined,
    { skip: !isAuthenticated || authUser?.role !== "CUSTOMER" },
  );

  const profile = profileResponse?.user ?? authUser;

  if (!isAuthenticated) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-8 gap-4"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-[20px] font-bold text-system-blue-dark mb-4">
          You&apos;re not logged in
        </Text>
        <Button onPress={() => router.push("/(auth)/login")}>Login</Button>
        <Button
          variant="outline"
          onPress={() => router.push("/(auth)/register")}
        >
          Create Account
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "?";

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
          onPress={() => router.push("/customer-profile" as any)}
          className="relative"
        >
          <View className="w-[60px] h-[60px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
            {profile?.profile_picture ? (
              <Image
                source={{ uri: profile.profile_picture }}
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
            {profile?.full_name || "Guest"}
          </Text>
          <Text className="text-[14px] text-[#6B7280]" numberOfLines={1}>
            {profile?.email}
          </Text>
        </View>
      </View>

      {/* Account links */}
      <View>
        <SectionRow label="My Profile" route="/customer-profile" />
        <SectionRow label="My Wallet" route="/account/wallet" />
        <SectionRow label="Notifications" route="/customer-notifications" />
        <SectionRow label="My Orders" route="/(tabs)/orders" />
        <SectionRow label="My Wishlist" route="/(tabs)/wishlist" />
        <SectionRow label="Order Tracking" route="/order-tracking" last />
      </View>

      <Divider />

      <View>
        <SectionRow
          label="Delivery Address"
          route="/account/delivery-address"
        />
        <SectionRow label="Invite Friends" route="/account/invite-friends" />
        <SectionRow label="Change Password" route="/change-password" last />
      </View>

      <Divider />

      <View>
        <SectionRow label="Contact Us" route="/contact" />
        <SectionRow label="FAQs" route="/faqs" />
        <SectionRow label="Terms &amp; Conditions" route="/terms" last />
      </View>

      <Divider />

      <View>
        <SectionRow
          label="Delete Account"
          route="/account/delete-account"
          danger
          last
        />
      </View>

      <Divider />

      <View className="px-[21px] mt-8">
        <Button
          variant="outline"
          onPress={handleLogout}
          className="border-system-red"
        >
          <Text className="text-system-red font-semibold">Log Out</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
