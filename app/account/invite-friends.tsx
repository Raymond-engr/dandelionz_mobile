import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useGetCustomerProfileQuery } from "@/lib/api/customerApi";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function InviteFriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: profileResponse, isLoading } = useGetCustomerProfileQuery();
  const [copied, setCopied] = useState(false);

  const profile = profileResponse?.user;
  const referralCode = profile?.referral_code || "---";

  const handleCopyCode = async () => {
    if (referralCode === "---") return;
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    Toast.show({
      type: "success",
      text1: "Copied!",
      text2: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (referralCode === "---") return;
    try {
      const shareText = `Join me on Dandelionz! Use my referral code: ${referralCode} to get exclusive discounts on your first order!`;
      await Share.share({
        message: shareText,
        title: "Join me on Dandelionz",
      });
    } catch (error) {
      handleCopyCode();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[18px] font-bold text-system-blue-light text-center flex-1">
          Invite Friends
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          {/* Gift Icon Placeholder */}
          <View className="items-center mb-8">
            <View className="w-32 h-32 bg-system-blue-light rounded-3xl items-center justify-center shadow-lg">
              <MaterialIcons name="card-giftcard" size={64} color="white" />
            </View>
          </View>

          {/* Steps */}
          <View className="gap-6 mb-10">
            <View className="flex-row gap-4">
              <View className="w-8 h-8 bg-system-blue-light rounded-full items-center justify-center">
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="flex-1 text-[14px] text-gray-700 leading-relaxed pt-1">
                Send an invite to a friend using your unique link/code
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="w-8 h-8 bg-system-blue-light rounded-full items-center justify-center">
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="flex-1 text-[14px] text-gray-700 leading-relaxed pt-1">
                Your friend signs up
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="w-8 h-8 bg-system-blue-light rounded-full items-center justify-center">
                <Text className="text-white font-bold">3</Text>
              </View>
              <Text className="flex-1 text-[14px] text-gray-700 leading-relaxed pt-1">
                You&apos;ll get discounted prices when they make their first order
              </Text>
            </View>
          </View>

          {/* Referral Code Section */}
          <View className="mb-8">
            <Text className="text-[12px] text-gray-500 mb-2 font-medium uppercase tracking-wider">
              Your unique Code
            </Text>
            <View className="relative">
              <View className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg flex-row items-center justify-between">
                <Text className="text-[16px] font-bold text-system-blue-dark">
                  {referralCode}
                </Text>
                <Pressable onPress={handleCopyCode} className="p-2">
                  <MaterialIcons
                    name={copied ? "check" : "content-copy"}
                    size={20}
                    color={copied ? "#10B981" : Colors.primary}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Invite Button */}
          <Button onPress={handleInvite} className="h-14">
            Invite Friends
          </Button>

          {/* Additional Info */}
          <View className="mt-8 p-4 bg-blue-50 rounded-xl flex-row gap-3">
            <MaterialIcons
              name="info"
              size={20}
              color={Colors.primary}
              style={{ marginTop: 2 }}
            />
            <Text className="flex-1 text-[12px] text-gray-600 leading-relaxed">
              The more friends you invite, the more discounts you earn! There&apos;s
              no limit to how many friends you can refer.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
