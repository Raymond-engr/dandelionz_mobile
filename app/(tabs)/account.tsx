import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetCustomerProfileQuery } from "@/lib/api/customerApi";
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

function AccountLink({ label, route, last = false }: { label: string; route: string; last?: boolean }) {
  const router = useRouter();
  return (
    <View>
      <Pressable
        onPress={() => router.push(route as any)}
        className="flex-row justify-between items-center py-4 px-[21px]"
      >
        <Text className="text-[16px] text-system-blue-dark font-medium">{label}</Text>
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </Pressable>
      {!last && <View className="h-[1px] bg-[#F5F7FA] mx-[21px]" />}
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
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

  const { data: profileResponse, isLoading } = useGetCustomerProfileQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  
  // profileResponse is CustomerProfile which has a 'user' property
  const profileUser = profileResponse?.user ?? authUser;

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8 gap-4">
        <Text className="text-[20px] font-bold text-system-blue-dark mb-4">You&apos;re not logged in</Text>
        <Button onPress={() => router.push("/(auth)/login")}>Login</Button>
        <Button variant="outline" onPress={() => router.push("/(auth)/register")}>Create Account</Button>
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

  const initials = profileUser?.full_name 
    ? profileUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : "?";

  return (
    <ScrollView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Profile Header */}
      <View className="flex-row items-center p-[21px]">
        <View className="w-[60px] h-[60px] rounded-full bg-system-blue-light items-center justify-center overflow-hidden">
          {profileUser?.profile_picture ? (
            <Image 
              source={{ uri: profileUser.profile_picture }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          ) : (
            <Text className="text-white text-[20px] font-bold">{initials}</Text>
          )}
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-bold text-system-blue-dark" numberOfLines={1}>
            {profileUser?.full_name}
          </Text>
          <Text className="text-[14px] text-[#6B7280]" numberOfLines={1}>{profileUser?.email}</Text>
        </View>
      </View>

      <Divider />

      {/* Activity Links */}
      <View>
        <AccountLink label="My Orders" route="/(tabs)/orders" />
        <AccountLink label="My Wishlist" route="/(tabs)/wishlist" />
        <AccountLink label="Delivery Address" route="/account/address" />
        <AccountLink label="Contact Us" route="/contact" />
        <AccountLink label="FAQs" route="/faqs" />
        <AccountLink label="Terms & Conditions" route="/terms" last />
      </View>

      <Divider />

      {/* Logout */}
      <View className="px-[21px] mt-8">
        <Button
          variant="outline"
          onPress={handleLogout}
          className="border-system-red"
        >
          <Text className="text-system-red">Log Out</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
