import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  StackActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function WithdrawalSuccessScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    amount: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
  }>();

  const [countdown, setCountdown] = useState(3);

  // Effect 1: countdown only
  useEffect(() => {
    if (!isFocused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFocused]);

  // Navigation — fires when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && isFocused) {
      // popToTop() unwinds the withdrawal stack back to vendor/(tabs).
      navigation.dispatch(StackActions.popToTop());
      // Specifically target the wallet tab
      router.push("/vendor/(tabs)/wallet");
    }
  }, [countdown, isFocused, navigation]);

  return (
    <View className="flex-1 bg-white items-center justify-between py-10">
      <View className="w-full items-center px-6">
        <Text className="text-[24px] font-semibold text-system-blue-light text-center mb-12">
          Confirmation
        </Text>

        <View className="w-[197px] h-[197px] rounded-full bg-system-blue-light items-center justify-center mb-10">
          <Svg width={126} height={126} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text className="text-[24px] font-semibold text-system-blue-light text-center px-4">
          Withdrawal Successful!
        </Text>

        <Text className="text-[16px] text-[#6B7280] text-center mt-4 px-6 leading-6 mb-2">
          Your withdrawal request has been submitted. Funds will be transferred
          to your bank account shortly.
        </Text>

        <Text className="text-[14px] text-gray-500 text-center italic">
          Redirecting to wallet in {countdown}s...
        </Text>
      </View>

      <View className="w-full items-center gap-4">
        <View className="w-full px-6">
          <Button
            variant="outline"
            onPress={() => {
              navigation.dispatch(StackActions.popToTop());
              router.push({
                pathname: "/vendor/wallet/receipt",
                params: {
                  amount: params.amount,
                  accountName: params.accountName,
                  accountNumber: params.accountNumber,
                  bankName: params.bankName,
                },
              } as any);
            }}
          >
            View Receipt
          </Button>
        </View>
        <Divider />
        <View className="w-full px-6 mb-6">
          <Button
            onPress={() => {
              navigation.dispatch(StackActions.popToTop());
              router.push("/vendor/(tabs)/wallet");
            }}
          >
            Back to Wallet
          </Button>
        </View>
      </View>
    </View>
  );
}
