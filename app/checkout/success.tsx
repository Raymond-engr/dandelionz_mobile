import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useVerifyPaymentQuery, useVerifyInstallmentPaymentQuery } from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reference, plan_id, status } = useLocalSearchParams<{ 
    reference: string; 
    plan_id: string; 
    status: string;
  }>();

  // Standard verification for normal orders
  const { 
    data: standardData, 
    isError: standardError, 
    isLoading: isStandardLoading 
  } = useVerifyPaymentQuery(
    { reference: reference as string },
    { skip: !reference || !!plan_id }
  );

  // Installment verification for plans
  const {
    data: installmentData,
    isError: installmentError,
    isLoading: isInstallmentLoading
  } = useVerifyInstallmentPaymentQuery(
    { reference: reference as string },
    { skip: !reference || !plan_id }
  );

  const isLoading = isStandardLoading || isInstallmentLoading;
  const isError = standardError || installmentError;
  const verifyData = plan_id ? installmentData : (standardData as any);

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
            We were unable to verify your payment. Please contact support if the issue persists.
          </Text>
          <Button onPress={() => router.replace("/")}>
            Back to Home
          </Button>
        </View>
      </View>
    );
  }

  const isCod = status === 'cod';
  const successMessage = isCod 
    ? 'Order Placed Successfully!' 
    : (plan_id ? `Installment ${verifyData?.data?.payment_number || ''} Successful!` : 'Checkout Successful!');

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

        <Text className="text-[24px] font-semibold text-system-blue-light text-center px-4 mb-12">
          {successMessage}
        </Text>
      </View>

      <View className="w-full items-center">
        <Divider className="mb-6" />
        <View className="w-full px-[21px] gap-4 pb-10">
          <Button onPress={() => router.replace("/(tabs)/orders")}>
            {plan_id ? 'View My Plans' : 'View Order'}
          </Button>
          {!plan_id && (
            <Button 
              variant="outline" 
              onPress={() => router.push({ pathname: "/order-receipt" as any, params: { id: reference } })}
            >
              View E-Receipt
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
