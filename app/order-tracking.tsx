import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useCancelOrderMutation,
  useGetCustomerOrderDetailsQuery,
  useGetInstallmentPlanDetailsQuery,
  useInitializeNextInstallmentMutation,
} from "@/lib/api/publicApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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

  const planId = order?.installment_plan?.id;

  const { data: planResponse, refetch: refetchPlan } =
    useGetInstallmentPlanDetailsQuery(planId ?? 0, { skip: !planId });
  const plan = planResponse?.data;

  const [initNextPayment, { isLoading: isInitingPayment }] =
    useInitializeNextInstallmentMutation();

  const handlePayNextInstallment = async (installment: any) => {
    try {
      const res = await initNextPayment({
        plan_id: plan!.id,
        payment_number: installment.payment_number,
      }).unwrap();

      router.push({
        pathname: "/checkout/webview" as any,
        params: {
          url: res.data.authorization_url,
          reference: res.data.reference,
          plan_id: String(plan!.id),
        },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to initialise payment",
        text2: apiError(err),
      });
    }
  };

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const canCancel =
    order &&
    ["PENDING", "PAID"].includes(order.status) &&
    order.status !== "CANCELLED";

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      order?.status === "PAID"
        ? "This order has been paid. Cancelling will initiate a refund (1–3 business days). Are you sure?"
        : "Are you sure you want to cancel this order?",
      [
        { text: "Keep Order", style: "cancel" },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await cancelOrder(order!.order_id).unwrap();
              Toast.show({
                type: "success",
                text1: "Order Cancelled",
                text2: res.message,
              });
              router.back();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Could not cancel order",
                text2: apiError(err, "Please try again."),
              });
            }
          },
        },
      ],
    );
  };

  const handleTrack = () => {
    if (inputId.trim()) {
      router.setParams({ id: inputId.trim() });
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
      text2: text,
    });
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
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        Order Tracking
      </Text>
      <View className="w-10" />
    </View>
  );

  if (!id) {
    return (
      <View className="flex-1 bg-white">
        {renderHeader()}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 pt-10"
        >
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

          <Button onPress={handleTrack}>Track Order</Button>
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
            We couldn&apos;t find an order with that ID. Please check and try
            again.
          </Text>
          <Button
            variant="outline"
            onPress={() => router.setParams({ id: "" })}
          >
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
        <View className="px-6 py-8 items-center">
          <Text className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            Tracking Order ID
          </Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(order.order_id)}
            className="flex-row items-center justify-between bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 min-w-[280px] max-w-full"
          >
            <Text
              className="text-system-blue-dark text-[16px] font-bold mr-3"
              numberOfLines={1}
            >
              {order.order_id}
            </Text>
            <Ionicons name="copy-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View className="px-10 py-6">
          {trackingSteps.length > 0 ? (
            trackingSteps.map((step, index) => (
              <View key={index} className="flex-row mb-8 last:mb-0">
                {/* Timeline Visuals */}
                <View className="items-center mr-4 w-6">
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      step.completed
                        ? "bg-system-blue-light border-system-blue-light"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {step.completed && (
                      <View className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </View>
                  {index < trackingSteps.length - 1 && (
                    <View
                      className={`w-[2px] flex-1 mt-1 ${
                        step.completed ? "bg-system-blue-light" : "bg-gray-300"
                      }`}
                      style={{ minHeight: 40 }}
                    />
                  )}
                </View>

                {/* Step Content */}
                <View className="flex-1 pt-1">
                  <Text
                    className={`text-[16px] ${step.completed ? "font-semibold text-system-blue-dark" : "text-gray-500"}`}
                  >
                    {step.label}
                  </Text>
                  {step.date ? (
                    <Text className="text-[12px] text-gray-400 mt-1">
                      {step.date}
                    </Text>
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

        {/* Installment Plan Section */}
        {plan && plan.status !== "COMPLETED" && (
          <View className="px-6 pb-8">
            <Divider height={1} className="mb-6" />

            <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Installment Plan
            </Text>

            {/* Progress bar */}
            <View className="flex-row items-center mb-2">
              <Text className="text-[13px] text-gray-500 flex-1">
                {plan.paid_installments_count} of {plan.number_of_installments}{" "}
                paid
              </Text>
              <Text className="text-[13px] font-bold text-system-blue-light">
                {formatCurrency(plan.installment_amount)} / month
              </Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full mb-6">
              <View
                className="h-full bg-system-blue-light rounded-full"
                style={{
                  width: `${(plan.paid_installments_count / plan.number_of_installments) * 100}%`,
                }}
              />
            </View>

            {/* Individual installments */}
            {plan.installments?.map((inst: any) => {
              const isPaid = inst.status === "PAID";
              const isOverdue = !isPaid && new Date(inst.due_date) < new Date();
              const isNext =
                !isPaid &&
                plan
                  .installments!.filter((i: any) => i.status !== "PAID")
                  .indexOf(inst) === 0;

              return (
                <View
                  key={inst.payment_number}
                  className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${
                    isPaid
                      ? "border-green-100 bg-green-50"
                      : isOverdue
                        ? "border-red-100 bg-red-50"
                        : isNext
                          ? "border-blue-100 bg-blue-50"
                          : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <View>
                    <Text className="text-[14px] font-bold text-system-blue-dark">
                      Installment #{inst.payment_number}
                    </Text>
                    <Text className="text-[12px] text-gray-400 mt-0.5">
                      Due{" "}
                      {new Date(inst.due_date).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[14px] font-bold text-system-blue-dark mb-1">
                      {formatCurrency(inst.amount)}
                    </Text>
                    {isPaid ? (
                      <View className="bg-green-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[11px] text-green-700 font-bold">
                          Paid
                        </Text>
                      </View>
                    ) : isNext ? (
                      <TouchableOpacity
                        onPress={() => handlePayNextInstallment(inst)}
                        disabled={isInitingPayment}
                        className="bg-system-blue-light px-3 py-1.5 rounded-lg"
                      >
                        <Text className="text-white text-[12px] font-bold">
                          {isInitingPayment ? "Loading…" : "Pay Now"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View
                        className={`px-2 py-0.5 rounded-full ${isOverdue ? "bg-red-100" : "bg-gray-100"}`}
                      >
                        <Text
                          className={`text-[11px] font-bold ${isOverdue ? "text-red-600" : "text-gray-500"}`}
                        >
                          {isOverdue ? "Overdue" : "Upcoming"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Cancel Order Section */}
        {canCancel && (
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={isCancelling}
              className="border-2 border-red-200 rounded-xl p-4 items-center bg-red-50"
            >
              <Text className="text-red-600 font-bold text-[15px]">
                {isCancelling ? "Cancelling…" : "Cancel Order"}
              </Text>
              {order?.status === "PAID" && (
                <Text className="text-red-400 text-[12px] mt-1">
                  Refund will be processed in 1–3 business days
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
