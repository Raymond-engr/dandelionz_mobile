import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useLazyVerifyInstallmentPaymentQuery,
  useLazyVerifyPaymentQuery,
} from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import {
  StackActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function CheckoutSuccessScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { reference, plan_id, status } = useLocalSearchParams<{
    reference: string;
    plan_id: string;
    status: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [verifyData, setVerifyData] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);
  const hasVerified = useRef(false);

  const [triggerVerify] = useLazyVerifyPaymentQuery();
  const [triggerInstallmentVerify] = useLazyVerifyInstallmentPaymentQuery();

  // Replace the single timer useEffect with these two:

  // Effect 1: countdown only
  useEffect(() => {
    if (isLoading || isError || !isFocused) return;

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
  }, [isLoading, isError, isFocused]);

  // Navigation — fires when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && !isLoading && !isError && isFocused) {
      // popToTop() unwinds the entire checkout stack back to (tabs)/index.
      // router.replace/navigate cannot do this cleanly — they either
      // duplicate (tabs) on top of the checkout screens or push new instances.
      navigation.dispatch(StackActions.popToTop());
    }
  }, [countdown, isLoading, isError, isFocused]);

  useEffect(() => {
    async function verify() {
      if (hasVerified.current) return;

      const isCod = status === "cod";
      if (isCod) {
        setIsLoading(false);
        hasVerified.current = true;
        return;
      }

      if (!reference) {
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        let result;
        if (plan_id) {
          result = await triggerInstallmentVerify({ reference }).unwrap();
        } else {
          result = await triggerVerify({ reference }).unwrap();
        }
        setVerifyData(result);
        hasVerified.current = true;
      } catch (err) {
        console.error("Verification error:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [reference, plan_id, status]);

  const renderHeader = () => (
    <View
      className="flex-row items-center justify-between px-4 py-4 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <Pressable onPress={() => router.replace("/")} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Payment
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-[21px]">
          <LoadingSpinner />
          <Text className="text-[20px] font-semibold text-system-blue-dark mt-6 text-center">
            Verifying Payment...
          </Text>
          <Text className="text-[14px] text-gray-500 mt-2 text-center">
            Please wait while we confirm your transaction.
          </Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-[21px]">
          <View className="w-[197px] h-[197px] rounded-full bg-red-50 items-center justify-center mb-10">
            <MaterialIcons name="error-outline" size={100} color={Colors.red} />
          </View>
          <Text className="text-[24px] font-semibold text-red-600 text-center mb-4">
            Payment Failed
          </Text>
          <Text className="text-[16px] text-gray-500 text-center mb-12">
            We were unable to verify your payment. Please contact support if the
            issue persists.
          </Text>
          <Button onPress={() => router.replace("/")}>Back to Home</Button>
        </View>
      </View>
    );
  }

  const isCod = status === "cod";
  const successMessage = isCod
    ? "Order Placed Successfully!"
    : plan_id
      ? `Installment ${verifyData?.data?.payment_number || ""} Successful!`
      : "Checkout Successful!";

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-[21px]">
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

        <Text className="text-[24px] font-semibold text-system-blue-light text-center px-4 mb-4">
          {successMessage}
        </Text>
        <Text className="text-[14px] text-gray-500 text-center italic">
          Redirecting to home in {countdown}s...
        </Text>
      </View>

      <View className="w-full items-center">
        <Divider className="mb-6" />
        <View className="w-full px-[21px] gap-4 pb-10">
          <Button
            onPress={() => {
              navigation.dispatch(StackActions.popToTop());
              // popToTop first, then navigate to orders tab:
              router.push("/(tabs)/orders");
            }}
          >
            {plan_id ? "View My Plans" : "View Order"}
          </Button>
          {!plan_id && (
            <Button
              variant="outline"
              onPress={() => {
                navigation.dispatch(StackActions.popToTop());
                router.push({
                  pathname: "/order-receipt" as any,
                  params: { id: verifyData?.data?.order_id },
                });
              }}
            >
              View E-Receipt
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
