import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetOrderReceiptQuery } from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrderReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: response,
    isLoading,
    isError,
  } = useGetOrderReceiptQuery(id || "", {
    skip: !id,
  });

  const receiptData = response?.data;

  const handleExport = () => {
    Alert.alert("Export Receipt", "The export feature is coming soon!");
  };

  const renderHeader = () => (
    <View 
      className="flex-row items-center justify-between px-4 py-4 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Receipt
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  if (isError || !receiptData) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center mb-4 text-[16px]">
            Failed to load receipt details.
          </Text>
          <Button variant="outline" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="p-[21px]">
          {/* Logo Placeholder */}
          <View className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-8 items-center justify-center">
            <Text className="text-gray-400 text-[12px]">Dandelionz</Text>
          </View>

          <View className="items-end mb-6">
            <Text className="text-gray-500 text-[14px]">
              {receiptData.payment?.paid_at 
                ? new Date(receiptData.payment.paid_at).toLocaleDateString("en-NG", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) 
                : 'Date N/A'}
            </Text>
          </View>

          {/* Table Header */}
          <View className="flex-row justify-between pb-2 mb-2 border-b border-gray-100">
            <Text className="text-[12px] font-bold text-gray-400">DESCRIPTION</Text>
            <Text className="text-[12px] font-bold text-gray-400">SUBTOTAL</Text>
          </View>

          {/* Items */}
          <View className="mb-6">
            {receiptData.items?.map((item: any, idx: number) => (
              <View key={idx} className="flex-row justify-between mb-3">
                <Text className="text-[16px] text-system-blue-dark flex-1 pr-4">
                  {item.product_name} <Text className="text-gray-400 font-medium">x{item.quantity}</Text>
                </Text>
                <Text className="text-[16px] font-semibold text-system-blue-dark">
                  ₦{parseFloat(item.price_at_purchase || "0").toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Details */}
          <View className="space-y-4 mb-8">
            <View className="flex-row justify-between py-2">
              <Text className="text-[14px] font-medium text-gray-500">Email</Text>
              <Text className="text-[14px] text-system-blue-dark">{receiptData.customer_email}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[14px] font-medium text-gray-500">Transaction Ref</Text>
              <Text className="text-[14px] text-system-blue-dark">{receiptData.payment?.reference || "N/A"}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[14px] font-medium text-gray-500">Order ID</Text>
              <Text className="text-[14px] text-system-blue-dark">{receiptData.order_id}</Text>
            </View>
          </View>

          {/* Total */}
          <View className="flex-row justify-between pt-4 border-t border-gray-200 mb-10">
            <Text className="text-[18px] font-bold text-system-blue-dark">Total</Text>
            <Text className="text-[18px] font-bold text-system-blue-dark">
              ₦{parseFloat(receiptData.total_price || "0").toLocaleString()}
            </Text>
          </View>

          {/* Actions */}
          <View className="space-y-4">
            <Button onPress={handleExport}>
              Export Receipt
            </Button>
            <Button 
              variant="outline" 
              onPress={() => router.push(`/order-tracking?id=${receiptData.order_id}` as any)}
            >
              Track Order / View Details
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
