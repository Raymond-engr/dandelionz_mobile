import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetVendorOrderDetailsQuery } from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

function StatusPill({ status }: { status: string }) {
  const s = status?.toUpperCase();
  let bg = "bg-gray-100";
  let text = "text-gray-600";
  
  if (s === "PAID" || s === "DELIVERED") {
    bg = "bg-green-100";
    text = "text-green-700";
  } else if (s === "PENDING") {
    bg = "bg-yellow-100";
    text = "text-yellow-700";
  } else if (s === "SHIPPED") {
    bg = "bg-blue-100";
    text = "text-blue-700";
  } else if (s === "CANCELED") {
    bg = "bg-red-100";
    text = "text-red-700";
  }
  
  return (
    <View className={`px-3 py-1 rounded-full ${bg}`}>
      <Text className={`text-[12px] font-bold ${text}`}>{status}</Text>
    </View>
  );
}

export default function VendorOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: response,
    isLoading,
    isError,
  } = useGetVendorOrderDetailsQuery(id ?? "");
  const order = response?.data;

  const trackingSteps =
    order?.timeline?.map((step: any) => ({
      label: step.label,
      date: step.timestamp ? new Date(step.timestamp).toLocaleDateString() : "",
      completed: step.completed,
    })) ?? [];

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
      text2: "Order ID has been copied",
    });
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Order Details
      </Text>
      <View className="w-10" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-[21px]">
        <MaterialIcons name="error-outline" size={64} color="#D1D5DB" />
        <Text className="text-[18px] text-gray-500 mt-4 text-center">Failed to load order details.</Text>
        <View className="w-full mt-8">
          <Pressable onPress={() => router.back()} className="bg-system-blue-light py-4 rounded-[12px] items-center">
            <Text className="text-white font-bold">Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Meta */}
        <View className="p-[21px] flex-row justify-between items-start bg-gray-50/30">
          <View className="flex-1 pr-4">
            <Text className="text-[13px] text-gray-400 font-bold uppercase tracking-wider mb-1">Order ID</Text>
            <Pressable 
              onPress={() => copyToClipboard(order.order_id)}
              className="flex-row items-center active:opacity-70"
            >
              <Text className="text-[18px] font-bold text-system-blue-dark flex-shrink-1" numberOfLines={1} ellipsizeMode="middle">
                {order.order_id}
              </Text>
              <MaterialIcons name="content-copy" size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
            </Pressable>
            <Text className="text-[13px] text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>
          <StatusPill status={order.status} />
        </View>

        <Divider height={11} />

        {/* Customer Info */}
        <View className="p-[21px]">
          <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Details</Text>
          <View className="bg-white border border-gray-100 rounded-[16px] p-4 shadow-sm">
            <Text className="text-[16px] font-bold text-system-blue-dark">{order.customer?.full_name}</Text>
            <Text className="text-[14px] text-gray-500 mt-1">{order.customer?.email}</Text>
            {order.customer?.phone_number && (
              <Text className="text-[14px] text-gray-500 mt-1">{order.customer.phone_number}</Text>
            )}
          </View>
        </View>

        {/* Items */}
        <View className="p-[21px] pt-0">
          <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Order Items</Text>
          <View className="bg-white border border-gray-100 rounded-[16px] p-4 shadow-sm">
            {(order.items ?? order.order_items ?? []).map((item: any, idx: number) => (
              <View key={idx} className={`flex-row justify-between py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <View className="flex-1 pr-4">
                  <Text className="text-[15px] font-bold text-system-blue-dark" numberOfLines={1}>
                    {item.product_name ?? item.product?.name}
                  </Text>
                  <Text className="text-[12px] text-gray-400 mt-1">Quantity: {item.quantity}</Text>
                  {item.selected_variants && Object.keys(item.selected_variants).length > 0 && (
                    <Text className="text-[12px] text-gray-500 mt-0.5">
                      {Object.entries(item.selected_variants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </Text>
                  )}
                </View>
                <Text className="text-[15px] font-bold text-system-blue-dark">
                  {formatCurrency(item.item_subtotal ?? item.price)}
                </Text>
              </View>
            ))}
            
            <View className="mt-4 pt-4 border-t-2 border-gray-50 flex-row justify-between items-center">
              <Text className="text-[16px] font-bold text-gray-500">Total Revenue</Text>
              <Text className="text-[20px] font-bold text-system-blue-light">
                {formatCurrency(order.total_amount ?? order.total_price)}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        {trackingSteps.length > 0 && (
          <View className="p-[21px] pt-0">
            <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tracking History</Text>
            <View className="bg-gray-50/50 rounded-[16px] p-6 border border-gray-100">
              {trackingSteps.map((step: any, i: number) => (
                <View key={i} className="flex-row">
                  <View className="items-center mr-4 w-6">
                    <View className={`w-4 h-4 rounded-full border-2 ${step.completed ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-300'}`} />
                    {i < trackingSteps.length - 1 && (
                      <View className={`w-[2px] h-10 ${step.completed ? 'bg-system-blue-light' : 'bg-gray-200'}`} />
                    )}
                  </View>
                  <View className="flex-1 pb-6">
                    <Text className={`text-[14px] ${step.completed ? 'font-bold text-system-blue-dark' : 'text-gray-400'}`}>
                      {step.label}
                    </Text>
                    {step.date && <Text className="text-[11px] text-gray-400 mt-1">{step.date}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
