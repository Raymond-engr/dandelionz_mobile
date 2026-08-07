import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useCancelOrderMutation,
  useGetCustomerOrderDetailsQuery,
  useGetInstallmentPlanDetailsQuery,
  useInitDeliveryPaymentMutation,
  usePayInstallmentMutation,
} from "@/lib/api/publicApi";
import { useGetCustomerWalletQuery } from "@/lib/api/customerApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
    refetch: refetchOrder,
  } = useGetCustomerOrderDetailsQuery(id || "", {
    skip: !id,
  });

  const [useWallet, setUseWallet] = useState(false);
  const [initDeliveryPayment, { isLoading: isPayingDelivery }] =
    useInitDeliveryPaymentMutation();
  const { data: walletData } = useGetCustomerWalletQuery();
  const walletBalance = walletData?.data?.balance ?? 0;

  const planId = order?.installment_plan?.id;

  const { data: planResponse, refetch: refetchPlan } =
    useGetInstallmentPlanDetailsQuery(planId ?? 0, { skip: !planId });
  const plan = planResponse?.data;

  // Running-balance ("CDcare") pay control. The amount defaults to what's due
  // now, or the advisory monthly installment when nothing is strictly due yet.
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [useWalletForInstallment, setUseWalletForInstallment] = useState(false);
  const [payInstallment, { isLoading: isPayingInstallment }] =
    usePayInstallmentMutation();

  useEffect(() => {
    if (!plan) return;
    const def =
      plan.minimum_due_now > 0
        ? plan.minimum_due_now
        : parseFloat(plan.installment_amount || "0");
    setInstallmentAmount(def > 0 ? String(def) : "");
  }, [plan?.id, plan?.minimum_due_now, plan?.installment_amount]);

  const handlePayInstallment = async (clearBalance: boolean) => {
    if (!plan) return;
    const minDue = plan.minimum_due_now ?? 0;
    const balance = plan.balance_remaining ?? 0;

    let amount: number | undefined;
    if (!clearBalance) {
      amount = parseFloat(installmentAmount);
      if (isNaN(amount) || amount <= 0) {
        Toast.show({
          type: "error",
          text1: "Enter a valid amount",
        });
        return;
      }
      if (minDue > 0 && amount < minDue) {
        Toast.show({
          type: "error",
          text1: "Amount is below the minimum due",
          text2: `At least ${formatCurrency(minDue)} is due now.`,
        });
        return;
      }
      if (amount > balance) {
        Toast.show({
          type: "error",
          text1: "Amount exceeds your balance",
          text2: `You only owe ${formatCurrency(balance)}.`,
        });
        return;
      }
    }

    try {
      const res = await payInstallment({
        plan_id: plan.id,
        ...(clearBalance ? { clear_balance: true } : { amount }),
        use_wallet: useWalletForInstallment,
      }).unwrap();
      const data = res.data;

      // The wallet covered it: no card leg, so refresh in place instead of
      // opening a payment page that would charge a second time.
      if (!data.requires_payment) {
        Toast.show({
          type: "success",
          text1: "Installment paid from wallet",
          text2: "Your wallet balance covered this payment.",
        });
        refetchPlan();
        refetchOrder();
        return;
      }

      if (data.authorization_url) {
        router.push({
          pathname: "/checkout/webview" as any,
          params: {
            url: data.authorization_url,
            reference: data.reference,
            plan_id: String(plan.id),
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Could not initialise payment. Please try again.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to initialise payment",
        text2: apiError(err),
      });
    }
  };

  const handlePayDeliveryFee = async () => {
    if (!order) return;
    try {
      const res = await initDeliveryPayment({
        order_id: order.order_id,
        use_wallet: useWallet,
      }).unwrap();
      const data = res.data;

      // The wallet covered the whole fee: it is already paid, so opening a
      // payment page would ask the customer to pay a second time.
      if (!data.requires_payment) {
        Toast.show({
          type: "success",
          text1: "Delivery fee paid from wallet",
          text2: "Your wallet balance covered the delivery fee in full.",
        });
        refetchOrder();
        return;
      }

      if (data.authorization_url) {
        router.push({
          pathname: "/checkout/webview" as any,
          params: {
            url: data.authorization_url,
            reference: data.reference,
            orderId: order.order_id,
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Could not initialise delivery payment. Please try again.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to pay delivery fee",
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

  const formatEta = (iso: string) =>
    new Date(iso).toLocaleString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  const deliveryFee = parseFloat(order?.delivery_fee || "0");
  const hasDeliveryWindow = !!(
    order?.expected_delivery_earliest && order?.expected_delivery_latest
  );
  const deliveryFeeDue =
    !!order && deliveryFee > 0 && !order.delivery_fee_paid;
  const orderPaid =
    order?.payment_status?.toUpperCase() === "PAID" ||
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
      (order?.status || "").toUpperCase(),
    );
  // Paid order still awaiting a delivery schedule: a fee has not been billed yet.
  const awaitingDeliverySchedule =
    !!order &&
    orderPaid &&
    !order.expected_delivery_latest &&
    !deliveryFeeDue;

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

        {/* Delivery window + fee */}
        {(hasDeliveryWindow || deliveryFeeDue || awaitingDeliverySchedule) && (
          <View className="px-6 pb-2">
            {hasDeliveryWindow && (
              <View className="flex-row items-start bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.primary}
                  style={{ marginTop: 1 }}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-[13px] font-bold text-system-blue-dark">
                    Arriving between
                  </Text>
                  <Text className="text-[14px] text-system-blue-dark mt-0.5">
                    {formatEta(order.expected_delivery_earliest!)} and{" "}
                    {formatEta(order.expected_delivery_latest!)}
                  </Text>
                </View>
              </View>
            )}

            {awaitingDeliverySchedule && (
              <View className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                <Text className="text-[13px] font-bold text-amber-700 mb-1">
                  Delivery is being scheduled
                </Text>
                <Text className="text-[13px] text-amber-700 leading-5">
                  A delivery fee will be billed shortly. Shipping begins once
                  it&apos;s paid.
                </Text>
              </View>
            )}

            {deliveryFeeDue && (
              <View className="bg-red-50 border border-red-100 rounded-xl p-4 mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[14px] font-bold text-red-600">
                    Delivery fee due
                  </Text>
                  <Text className="text-[16px] font-bold text-red-600">
                    {formatCurrency(deliveryFee)}
                  </Text>
                </View>
                <Text className="text-[13px] text-red-500 mb-3 leading-5">
                  Shipping begins once your delivery fee is paid.
                </Text>

                {walletBalance > 0 && (
                  <TouchableOpacity
                    onPress={() => setUseWallet((v) => !v)}
                    className={`mb-3 p-3 rounded-lg border-2 flex-row items-center justify-between ${
                      useWallet
                        ? "border-system-blue-light bg-blue-50/40"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className={`text-[14px] font-bold ${useWallet ? "text-system-blue-light" : "text-system-blue-dark"}`}
                      >
                        Use wallet balance
                      </Text>
                      <Text className="text-[12px] text-[#6B7280] mt-0.5">
                        {formatCurrency(walletBalance)} available
                        {useWallet
                          ? " — anything left over goes on your card"
                          : ""}
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        useWallet
                          ? "border-system-blue-light bg-system-blue-light"
                          : "border-gray-300"
                      }`}
                    >
                      {useWallet && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handlePayDeliveryFee}
                  disabled={isPayingDelivery}
                  className={`rounded-xl py-3.5 items-center ${isPayingDelivery ? "bg-gray-300" : "bg-system-blue-light"}`}
                >
                  <Text className="text-white font-bold text-[15px]">
                    {isPayingDelivery ? "Processing…" : "Pay delivery fee"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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

        {/* Installment Plan Section — running-balance ("CDcare") model */}
        {plan && (
          <View className="px-6 pb-8">
            <Divider height={1} className="mb-6" />

            <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Installment Plan
            </Text>

            {plan.status === "COMPLETED" ? (
              <View className="bg-green-50 border border-green-100 rounded-xl p-5 items-center">
                <Ionicons
                  name="checkmark-circle"
                  size={40}
                  color="#059669"
                />
                <Text className="text-[16px] font-bold text-green-700 mt-2">
                  Fully paid
                </Text>
                <Text className="text-[13px] text-green-700 text-center mt-1 leading-5">
                  You&apos;ve paid off {formatCurrency(plan.total_amount)} in
                  full. Nothing more is owed.
                </Text>
              </View>
            ) : (
              <>
                {/* Balance summary */}
                <View className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[13px] text-gray-500">Total</Text>
                    <Text className="text-[13px] font-medium text-system-blue-dark">
                      {formatCurrency(plan.total_amount)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[13px] text-gray-500">
                      Amount paid
                    </Text>
                    <Text className="text-[13px] font-medium text-green-600">
                      {formatCurrency(plan.amount_paid)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-[13px] text-gray-500">
                      Balance remaining
                    </Text>
                    <Text className="text-[14px] font-bold text-system-blue-light">
                      {formatCurrency(plan.balance_remaining)}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[12px] text-gray-500">
                    {Math.round((plan.paid_fraction ?? 0) * 100)}% paid
                  </Text>
                  <Text className="text-[12px] text-gray-400">
                    {plan.paid_installments_count} of{" "}
                    {plan.number_of_installments} scheduled
                  </Text>
                </View>
                <View className="relative h-2 bg-gray-100 rounded-full mb-1">
                  <View
                    className="h-full bg-system-blue-light rounded-full"
                    style={{
                      width: `${Math.min(Math.max((plan.paid_fraction ?? 0) * 100, 0), 100)}%`,
                    }}
                  />
                </View>
                <Text className="text-[11px] text-amber-700 mb-4">
                  Ships once fully paid
                </Text>

                {/* Next due + minimum due */}
                {plan.next_due_date && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-[13px] text-gray-500">Next due</Text>
                    <Text className="text-[13px] font-medium text-system-blue-dark">
                      {new Date(plan.next_due_date).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                )}
                {plan.minimum_due_now > 0 && (
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-[13px] text-gray-500">
                      Minimum due now
                    </Text>
                    <Text className="text-[13px] font-bold text-amber-700">
                      {formatCurrency(plan.minimum_due_now)}
                    </Text>
                  </View>
                )}

                {/* Pay control */}
                <View className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <Text className="text-[12px] text-[#6B7280] mb-1">
                    Amount to pay (₦)
                  </Text>
                  <TextInput
                    value={installmentAmount}
                    onChangeText={setInstallmentAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    editable={!isPayingInstallment}
                    className="border border-gray-300 rounded-[12px] px-4 h-[48px] text-[15px] text-system-blue-dark bg-white mb-3"
                  />

                  {walletBalance > 0 && (
                    <TouchableOpacity
                      onPress={() => setUseWalletForInstallment((v) => !v)}
                      className={`mb-3 p-3 rounded-lg border-2 flex-row items-center justify-between ${
                        useWalletForInstallment
                          ? "border-system-blue-light bg-blue-50/40"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <View className="flex-1 pr-3">
                        <Text
                          className={`text-[14px] font-bold ${useWalletForInstallment ? "text-system-blue-light" : "text-system-blue-dark"}`}
                        >
                          Use wallet balance
                        </Text>
                        <Text className="text-[12px] text-[#6B7280] mt-0.5">
                          {formatCurrency(walletBalance)} available
                          {useWalletForInstallment
                            ? " — your wallet must cover the full amount above"
                            : ""}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded border-2 items-center justify-center ${
                          useWalletForInstallment
                            ? "border-system-blue-light bg-system-blue-light"
                            : "border-gray-300"
                        }`}
                      >
                        {useWalletForInstallment && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handlePayInstallment(false)}
                    disabled={isPayingInstallment}
                    className={`rounded-xl py-3.5 items-center mb-2 ${isPayingInstallment ? "bg-gray-300" : "bg-system-blue-light"}`}
                  >
                    <Text className="text-white font-bold text-[15px]">
                      {isPayingInstallment ? "Processing…" : "Pay amount"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePayInstallment(true)}
                    disabled={isPayingInstallment}
                    className="rounded-xl py-3 items-center border border-system-blue-light"
                  >
                    <Text className="text-system-blue-light font-bold text-[14px]">
                      Clear balance ({formatCurrency(plan.balance_remaining)})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Advisory schedule (reference only) */}
                {!!plan.installments?.length && (
                  <>
                    <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Payment schedule
                    </Text>
                    {plan.installments.map((inst: any) => {
                      const isPaid = inst.status === "PAID";
                      const isOverdue =
                        !isPaid && new Date(inst.due_date) < new Date();

                      return (
                        <View
                          key={inst.payment_number}
                          className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${
                            isPaid
                              ? "border-green-100 bg-green-50"
                              : isOverdue
                                ? "border-red-100 bg-red-50"
                                : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <View>
                            <Text className="text-[14px] font-bold text-system-blue-dark">
                              Installment #{inst.payment_number}
                            </Text>
                            <Text className="text-[12px] text-gray-400 mt-0.5">
                              Due{" "}
                              {new Date(inst.due_date).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-[14px] font-bold text-system-blue-dark mb-1">
                              {formatCurrency(inst.amount)}
                            </Text>
                            <View
                              className={`px-2 py-0.5 rounded-full ${
                                isPaid
                                  ? "bg-green-100"
                                  : isOverdue
                                    ? "bg-red-100"
                                    : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`text-[11px] font-bold ${
                                  isPaid
                                    ? "text-green-700"
                                    : isOverdue
                                      ? "text-red-600"
                                      : "text-gray-500"
                                }`}
                              >
                                {isPaid
                                  ? "PAID"
                                  : isOverdue
                                    ? "OVERDUE"
                                    : "PENDING"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            )}
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
