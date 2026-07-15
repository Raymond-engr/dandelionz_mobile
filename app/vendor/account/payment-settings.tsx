import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorPaymentSettingsMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const securityItems = [
    { label: "Change Payment PIN", icon: "lock-outline", href: "/vendor/account/payment-settings/change-pin" },
    { label: "Forgot Payment PIN", icon: "help-outline", href: "/vendor/account/forgot-pin" },
  ];

  const withdrawalItems = [
    { label: "Store Payment Option", icon: "account-balance", href: "/vendor/account/payment-settings/store-payment" },
  ];

  const renderItem = (item: any) => (
    <Pressable
      key={item.label}
      onPress={() => item.href !== "#" && router.push(item.href as any)}
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

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="px-[21px] text-[20px] font-semibold text-system-blue-dark mt-4 mb-2">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
          Payment Settings
        </Text>
        <View className="w-10" />
      </View>

      <Divider height={11} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View className="pb-4">
          <SectionHeader title="Payment PIN" />
          {securityItems.map(renderItem)}
        </View>

        <Divider height={11} />

        <View className="pb-4">
          <SectionHeader title="Withdrawal Details" />
          {withdrawalItems.map(renderItem)}
        </View>
      </ScrollView>
    </View>
  );
}
