import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminSettlementsMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      label: "Summary",
      icon: "assessment",
      href: "/(admin)/settlements/summary",
    },
    {
      label: "Transaction History",
      icon: "history",
      href: "/(admin)/settlements/history",
    },
  ];

  const paymentItems = [
    {
      label: "Vendor Settlements",
      icon: "storefront",
      href: "/(admin)/settlements/vendor",
    },
    {
      label: "Payout Management",
      icon: "payments",
      href: "/(admin)/settlements/payout",
    },
    {
      label: "Disputes & Refunds",
      icon: "gavel",
      href: "/(admin)/settlements/disputes",
    },
  ];

  const renderItem = (item: any) => (
    <Pressable
      key={item.href}
      onPress={() => router.push(item.href as any)}
      className="flex-row items-center justify-between px-[21px] py-4 bg-white active:bg-gray-50"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
          <MaterialIcons name={item.icon} size={22} color={Colors.primary} />
        </View>
        <Text className="text-[16px] font-medium text-system-blue-dark">
          {item.label}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[20px] font-semibold text-system-blue-light text-center flex-1">
          Payments & Settlements
        </Text>
        <View className="w-10" />
      </View>

      <Divider />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="px-[21px] text-[14px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
            Overview
          </Text>
          {menuItems.map(renderItem)}
        </View>

        <Divider height={11} />

        <View className="py-4">
          <Text className="px-[21px] text-[14px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
            Settlements & Payouts
          </Text>
          {paymentItems.map(renderItem)}
        </View>
      </ScrollView>
    </View>
  );
}
