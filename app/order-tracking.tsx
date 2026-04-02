import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { useGetCustomerOrderDetailsQuery } from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputId, setInputId] = useState("");

  const {
    data: order,
    isLoading,
    isError,
  } = useGetCustomerOrderDetailsQuery(id || "", {
    skip: !id,
  });

  const handleTrack = () => {
    if (inputId.trim()) {
      router.setParams({ id: inputId.trim() });
    }
  };

  const trackingSteps =
    order?.timeline?.map((step) => ({
      label: step.label,
      date: step.timestamp ? new Date(step.timestamp).toLocaleDateString() : "",
      completed: step.completed,
    })) || [];

  const renderHeader = () => (
    <View 
      className="flex-row items-center justify-between px-4 py-4 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        Order Tracking
      </Text>
      <View className="w-10" />
    </View>
  );

  if (!id) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-10">
          <Text className="text-[20px] font-semibold text-system-blue-dark text-center mb-4">
            Track Your Order
          </Text>
          <Text className="text-[16px] text-gray-500 text-center mb-8">
            Enter your Order ID to see the current status of your shipment.
          </Text>
          
          <View className="mb-6">
            <TextInput
              className="h-[55px] border border-gray-300 rounded-[12px] px-4 text-[16px] text-system-blue-dark"
              placeholder="Order ID (e.g., ORD-2026-XXXX)"
              value={inputId}
              onChangeText={setInputId}
              autoCapitalize="characters"
            />
          </View>

          <Button onPress={handleTrack}>
            Track Order
          </Button>
        </ScrollView>
      </View>
    );
  }

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

  if (isError || !order) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-[21px]">
          <Text className="text-red-500 text-center mb-4 text-[16px]">
            We couldn&apos;t find an order with that ID. Please check and try again.
          </Text>
          <Button variant="outline" onPress={() => router.setParams({ id: "" })}>
            Try Another ID
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
        <View className="px-6 py-6 items-center">
          <Text className="text-gray-500 text-[14px]">Tracking Order:</Text>
          <Text className="text-system-blue-dark text-[18px] font-bold">{order.order_id}</Text>
        </View>

        <View className="px-10 py-6">
          {trackingSteps.length > 0 ? (
            trackingSteps.map((step, index) => (
              <View key={index} className="flex-row mb-8 last:mb-0">
                {/* Timeline Visuals */}
                <View className="items-center mr-4 w-6">
                  <View 
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      step.completed ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-300'
                    }`}
                  >
                    {step.completed && <View className="w-3 h-3 rounded-full bg-white" />}
                  </View>
                  {index < trackingSteps.length - 1 && (
                    <View 
                      className={`w-[2px] flex-1 mt-1 ${
                        step.completed ? 'bg-system-blue-light' : 'bg-gray-300'
                      }`}
                      style={{ minHeight: 40 }}
                    />
                  )}
                </View>

                {/* Step Content */}
                <View className="flex-1 pt-1">
                  <Text className={`text-[16px] ${step.completed ? 'font-semibold text-system-blue-dark' : 'text-gray-500'}`}>
                    {step.label}
                  </Text>
                  {step.date ? (
                    <Text className="text-[12px] text-gray-400 mt-1">{step.date}</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-400 py-10">
              No tracking history available yet.
            </Text>
          )}
        </View>

        <Divider height={11} className="my-4" />

        <View className="px-[21px] py-4">
          <Button onPress={() => router.push("/")}>
            Continue Shopping
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
