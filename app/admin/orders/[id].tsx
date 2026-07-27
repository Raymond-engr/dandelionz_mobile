import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiError } from "@/lib/utils";
import {
  useGetAdminOrderDetailsQuery,
  useCancelOrderWithReasonMutation,
  useUpdateOrderStatusMutation,
  useGetAdminRefundsQuery,
  useSetOrderDeliveryMutation,
  useGetAdminInstallmentPlanQuery,
} from "@/lib/api/adminApi";
import { Ionicons, Feather } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";

import Toast from "react-native-toast-message";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [action, setAction] = useState<"cancel" | "process" | "complete">("cancel");
  const [reason, setReason] = useState("");

  const { data: orderResponse, isLoading, error, refetch } = useGetAdminOrderDetailsQuery(id!);
  let order = orderResponse; // Based on adminApi it might be direct or wrapped

  const { data: refundsData } = useGetAdminRefundsQuery(undefined, {
    skip: !order || !['CANCELED', 'CANCELLED'].includes(order.current_status || order.status || ''),
  });
  
  if (order && refundsData?.data) {
    const orderRefund = refundsData.data.find((r: any) => r.order_id === order?.order_id);
    if (orderRefund) {
      order = { ...order, refund_request: orderRefund } as any;
    }
  }

  // Read-only installment plan summary. Admins can't act on it here — the
  // customer pays it down from their order-tracking screen.
  const installmentPlanId = order?.installment_plan?.id;
  const { data: installmentPlanResp } = useGetAdminInstallmentPlanQuery(
    installmentPlanId ?? 0,
    { skip: !installmentPlanId },
  );
  const installmentPlan = installmentPlanResp?.data;

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderWithReasonMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [setOrderDelivery, { isLoading: isSavingDelivery }] = useSetOrderDeliveryMutation();

  // Delivery scheduling form. Held as Date objects for the pickers; the fee is a plain
  // string so the field can be cleared while typing.
  const [useDefaultWindow, setUseDefaultWindow] = useState(false);
  const [earliest, setEarliest] = useState<Date | null>(null);
  const [latest, setLatest] = useState<Date | null>(null);
  const [showEarliestPicker, setShowEarliestPicker] = useState(false);
  const [showLatestPicker, setShowLatestPicker] = useState(false);
  const [feeInput, setFeeInput] = useState("");

  useEffect(() => {
    if (!order) return;
    setEarliest(
      order.expected_delivery_earliest
        ? new Date(order.expected_delivery_earliest)
        : null,
    );
    setLatest(
      order.expected_delivery_latest
        ? new Date(order.expected_delivery_latest)
        : null,
    );
    const fee = parseFloat(order.delivery_fee || "0");
    setFeeInput(fee > 0 ? String(fee) : "");
  }, [order?.order_id, order?.expected_delivery_earliest, order?.expected_delivery_latest, order?.delivery_fee]);

  const handleSaveDelivery = async () => {
    if (!order) return;

    const feeValue = parseFloat(feeInput);
    if (isNaN(feeValue) || feeValue < 0) {
      Toast.show({ type: "error", text1: "Error", text2: "Enter a valid delivery fee." });
      return;
    }

    if (!useDefaultWindow) {
      if (!earliest || !latest) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Set both delivery dates, or use the default window.",
        });
        return;
      }
      if (earliest.getTime() > latest.getTime()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Earliest date must be on or before the latest date.",
        });
        return;
      }
    }

    try {
      await setOrderDelivery({
        order_id: order.order_id,
        delivery_fee: feeValue,
        ...(useDefaultWindow
          ? { use_default: true }
          : {
              expected_delivery_earliest: earliest!.toISOString(),
              expected_delivery_latest: latest!.toISOString(),
            }),
      }).unwrap();
      Toast.show({ type: "success", text1: "Delivery details updated." });
      refetch();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to update delivery details."),
      });
    }
  };

  const fmtWindow = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleString("en-NG", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Not set";

  const handleAction = async () => {
    if (!order) return;

    try {
      if (action === "cancel") {
        if (!reason.trim()) {
          Toast.show({ type: "error", text1: "Error", text2: "Please provide a reason for cancellation." });
          return;
        }
        await cancelOrder({ order_id: order.order_id, reason }).unwrap();
      } else if (action === "process") {
        await updateOrderStatus({ order_id: order.order_id, status: "SHIPPED" }).unwrap();
      } else if (action === "complete") {
        await updateOrderStatus({ order_id: order.order_id, status: "DELIVERED" }).unwrap();
      }
      Toast.show({ type: "success", text1: "Order status updated successfully." });
      refetch();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, "Failed to update order status")
      });
    }
  };

  const trackingSteps = order?.timeline?.map((step: any) => ({
    label: step.label,
    active: step.completed
  })) || [
    { label: "Order Placed", active: !!order?.ordered_at },
    { label: "Payment Confirmed", active: order?.payment_status === "PAID" || order?.current_status === "PAID" || ["SHIPPED", "DELIVERED"].includes(order?.current_status || "") },
    { label: "Product Shipped", active: ["SHIPPED", "DELIVERED"].includes(order?.current_status || "") },
    { label: "Delivered", active: order?.current_status === "DELIVERED" },
  ];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load order details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Feather name="chevron-left" size={32} color="#030482" />
        </TouchableOpacity>
        <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
          Order Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{order.customer?.full_name || "N/A"}</Text>
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{order.customer?.email || "N/A"}</Text>
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{order.customer?.phone_number || "N/A"}</Text>
        </View>
        {order.shipping_address && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Shipping Address</Text>
            <Text style={styles.value}>
              {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          {order.order_items?.map((item: any, index: number) => (
            <View key={index} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <View style={styles.itemDetail}>
                <Text style={styles.itemLabel}>Vendor:</Text>
                <Text style={styles.itemValue}>{item.vendor_name || "N/A"}</Text>
              </View>
              <View style={styles.itemDetail}>
                <Text style={styles.itemLabel}>Quantity:</Text>
                <Text style={styles.itemValue}>{item.quantity}</Text>
              </View>
              <View style={styles.itemDetail}>
                <Text style={styles.itemLabel}>Subtotal:</Text>
                <Text style={styles.itemValue}>{formatCurrency(item.item_subtotal)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.summaryFooter}>
            <View style={styles.footerDetail}>
              <Text style={styles.footerLabel}>Delivery Fee:</Text>
              <Text style={styles.footerValue}>{formatCurrency(order.delivery_fee)}</Text>
            </View>
            <View style={[styles.footerDetail, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.total_price)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Delivery</Text>
        <View className="bg-[#f9fafb] rounded-xl p-4 mb-5">
          {/* Current state */}
          <View className="flex-row justify-between mb-2">
            <Text className="text-[13px] text-[#6b7280]">Window</Text>
            <Text className="text-[13px] font-medium text-[#111827] text-right flex-1 ml-4">
              {order.expected_delivery_latest
                ? `${fmtWindow(order.expected_delivery_earliest)} → ${fmtWindow(order.expected_delivery_latest)}`
                : "Not scheduled"}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[13px] text-[#6b7280]">Current fee</Text>
            <Text className="text-[13px] font-medium text-[#111827]">
              {formatCurrency(order.delivery_fee)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-[13px] text-[#6b7280]">Fee status</Text>
            <View
              className={`px-2 py-0.5 rounded-full ${order.delivery_fee_paid ? "bg-[#D1FAE5]" : "bg-[#FEF3C7]"}`}
            >
              <Text
                className={`text-[11px] font-bold ${order.delivery_fee_paid ? "text-[#059669]" : "text-[#D97706]"}`}
              >
                {parseFloat(order.delivery_fee || "0") <= 0
                  ? "No fee"
                  : order.delivery_fee_paid
                    ? "Paid"
                    : "Unpaid"}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-[#e5e7eb] mb-4" />

          {/* Use default window toggle */}
          <TouchableOpacity
            onPress={() => setUseDefaultWindow((v) => !v)}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-[14px] font-medium text-[#111827] flex-1 pr-3">
              Use default delivery window
            </Text>
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                useDefaultWindow
                  ? "border-system-blue-light bg-system-blue-light"
                  : "border-gray-300"
              }`}
            >
              {useDefaultWindow && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>

          {!useDefaultWindow && (
            <>
              <Text className="text-[12px] text-[#6b7280] mb-1">Earliest</Text>
              <TouchableOpacity
                onPress={() => setShowEarliestPicker(true)}
                className="border border-gray-300 rounded-[12px] px-4 h-[48px] justify-center mb-3"
              >
                <Text className="text-[15px] text-[#111827]">
                  {earliest ? fmtWindow(earliest.toISOString()) : "Select date & time"}
                </Text>
              </TouchableOpacity>

              <Text className="text-[12px] text-[#6b7280] mb-1">Latest</Text>
              <TouchableOpacity
                onPress={() => setShowLatestPicker(true)}
                className="border border-gray-300 rounded-[12px] px-4 h-[48px] justify-center mb-3"
              >
                <Text className="text-[15px] text-[#111827]">
                  {latest ? fmtWindow(latest.toISOString()) : "Select date & time"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <Text className="text-[12px] text-[#6b7280] mb-1">Delivery fee (₦)</Text>
          <TextInput
            value={feeInput}
            onChangeText={setFeeInput}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            editable={!isSavingDelivery}
            className="border border-gray-300 rounded-[12px] px-4 h-[48px] text-[15px] text-[#111827] mb-4"
          />

          <TouchableOpacity
            onPress={handleSaveDelivery}
            disabled={isSavingDelivery}
            className={`h-[48px] rounded-[12px] items-center justify-center ${isSavingDelivery ? "bg-gray-300" : "bg-system-blue-light"}`}
          >
            {isSavingDelivery ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-[15px] font-bold">Save Delivery</Text>
            )}
          </TouchableOpacity>
        </View>

        {showEarliestPicker && (
          <DateTimePicker
            value={earliest || new Date()}
            mode="date"
            display="default"
            onChange={(_e: any, d?: Date) => {
              setShowEarliestPicker(false);
              if (d) setEarliest(d);
            }}
          />
        )}
        {showLatestPicker && (
          <DateTimePicker
            value={latest || earliest || new Date()}
            mode="date"
            display="default"
            onChange={(_e: any, d?: Date) => {
              setShowLatestPicker(false);
              if (d) setLatest(d);
            }}
          />
        )}

        {installmentPlan && (
          <>
            <Text style={styles.sectionTitle}>Installment Plan</Text>
            <View className="bg-[#f9fafb] rounded-xl p-4 mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-[#6b7280]">Status</Text>
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    installmentPlan.status === "COMPLETED"
                      ? "bg-[#D1FAE5]"
                      : installmentPlan.status === "ACTIVE"
                        ? "bg-[#DBEAFE]"
                        : "bg-[#FEE2E2]"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      installmentPlan.status === "COMPLETED"
                        ? "text-[#059669]"
                        : installmentPlan.status === "ACTIVE"
                          ? "text-[#2563EB]"
                          : "text-[#DC2626]"
                    }`}
                  >
                    {installmentPlan.status}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-[#6b7280]">Total</Text>
                <Text className="text-[13px] font-medium text-[#111827]">
                  {formatCurrency(installmentPlan.total_amount)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-[#6b7280]">Amount paid</Text>
                <Text className="text-[13px] font-medium text-[#059669]">
                  {formatCurrency(installmentPlan.amount_paid)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-[13px] text-[#6b7280]">
                  Balance remaining
                </Text>
                <Text className="text-[13px] font-bold text-[#030482]">
                  {formatCurrency(installmentPlan.balance_remaining)}
                </Text>
              </View>

              {/* Progress bar with a 50% ships marker */}
              <View className="flex-row justify-between mb-1">
                <Text className="text-[12px] text-[#6b7280]">
                  {Math.round((installmentPlan.paid_fraction ?? 0) * 100)}% paid
                </Text>
                <Text className="text-[12px] text-[#9CA3AF]">
                  {installmentPlan.paid_installments_count} of{" "}
                  {installmentPlan.number_of_installments} scheduled
                </Text>
              </View>
              <View className="relative h-2 bg-[#e5e7eb] rounded-full mb-3">
                <View
                  className="h-full bg-system-blue-light rounded-full"
                  style={{
                    width: `${Math.min(Math.max((installmentPlan.paid_fraction ?? 0) * 100, 0), 100)}%`,
                  }}
                />
                <View
                  className="absolute top-[-2px] h-3 w-[2px] bg-amber-500"
                  style={{ left: "50%" }}
                />
              </View>

              <View className="flex-row justify-between">
                <Text className="text-[13px] text-[#6b7280]">Next due</Text>
                <Text className="text-[13px] font-medium text-[#111827]">
                  {installmentPlan.next_due_date
                    ? fmtWindow(installmentPlan.next_due_date)
                    : "—"}
                </Text>
              </View>
            </View>

            {!!installmentPlan.installments?.length && (
              <View className="mb-5">
                {installmentPlan.installments.map((inst: any) => {
                  const isPaid = inst.status === "PAID";
                  const isOverdue =
                    !isPaid && new Date(inst.due_date) < new Date();
                  return (
                    <View
                      key={inst.payment_number}
                      className="flex-row items-center justify-between px-4 py-3 mb-2 rounded-xl border border-gray-100 bg-[#f9fafb]"
                    >
                      <View>
                        <Text className="text-[13px] font-bold text-[#111827]">
                          Installment #{inst.payment_number}
                        </Text>
                        <Text className="text-[12px] text-[#9CA3AF] mt-0.5">
                          Due{" "}
                          {new Date(inst.due_date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[13px] font-bold text-[#111827] mb-1">
                          {formatCurrency(inst.amount)}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            isPaid
                              ? "bg-[#D1FAE5]"
                              : isOverdue
                                ? "bg-[#FEE2E2]"
                                : "bg-[#F3F4F6]"
                          }`}
                        >
                          <Text
                            className={`text-[11px] font-bold ${
                              isPaid
                                ? "text-[#059669]"
                                : isOverdue
                                  ? "text-[#DC2626]"
                                  : "text-[#6B7280]"
                            }`}
                          >
                            {isPaid ? "PAID" : isOverdue ? "OVERDUE" : "PENDING"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>Order Tracking Status</Text>
        <View style={styles.trackingContainer}>
          {trackingSteps.map((step: any, idx: number) => (
            <View key={idx} style={styles.trackingStep}>
              <View style={styles.trackingLeft}>
                <View style={[styles.trackingDot, step.active && styles.trackingDotActive]}>
                  {step.active && <View style={styles.trackingDotInner} />}
                </View>
                {idx < trackingSteps.length - 1 && (
                  <View style={[styles.trackingLine, step.active && trackingSteps[idx+1].active && styles.trackingLineActive]} />
                )}
              </View>
              <Text style={styles.trackingLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        {order.refund_request && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Refund Status</Text>
            <View style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor:
                order.refund_request.status === 'APPROVED' ? '#D1FAE5'
                : order.refund_request.status === 'REJECTED' ? '#FEE2E2'
                : '#FEF3C7',
              borderWidth: 1,
              borderColor:
                order.refund_request.status === 'APPROVED' ? '#6EE7B7'
                : order.refund_request.status === 'REJECTED' ? '#FCA5A5'
                : '#FDE68A',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>
                  {formatCurrency(order.refund_request.refunded_amount || order.refund_request.amount)}
                </Text>
                <Text style={{
                  fontWeight: '700', fontSize: 12,
                  color: order.refund_request.status === 'APPROVED' ? '#059669'
                       : order.refund_request.status === 'REJECTED' ? '#DC2626'
                       : '#D97706',
                }}>
                  {order.refund_request.status}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                {order.refund_request.status === 'PENDING'
                  ? 'Refund requested. Go to Refund Requests to process.'
                  : order.refund_request.status === 'APPROVED'
                  ? 'Refund approved — customer wallet credited.'
                  : `Rejected: ${order.refund_request.rejection_reason || order.refund_request.reason || 'No reason provided'}`}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {(() => {
            const status = (order.status || order.current_status || '').toUpperCase();
            const isTerminal = status === 'DELIVERED' || status === 'CANCELED' || status === 'CANCELLED';
            const isPaid = order.payment_status?.toUpperCase() === 'PAID';
            
            if (isTerminal) return null;

            return (
              <>
                <View style={styles.pickerContainer}>
                  {["cancel", "process", "complete"]
                    .filter(a => {
                      if (a === 'cancel') return true;
                      if (!isPaid) return false;
                      if (a === 'process' && status === 'SHIPPED') return false;
                      return true;
                    })
                    .map((a) => (
                    <TouchableOpacity
                      key={a}
                      onPress={() => setAction(a as any)}
                      style={[styles.actionTab, action === a && styles.actionTabActive]}
                    >
                      <Text style={[styles.actionTabText, action === a && styles.actionTabTextActive]}>
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {action === "cancel" && (
                  <TextInput
                    placeholder="Reason for action..."
                    value={reason}
                    onChangeText={setReason}
                    style={styles.reasonInput}
                    multiline
                  />
                )}

                <TouchableOpacity
                  onPress={handleAction}
                  disabled={isCancelling || isUpdating || (action === "cancel" && !reason.trim())}
                  style={[styles.confirmBtn, (isCancelling || isUpdating || (action === "cancel" && !reason.trim())) && styles.disabledBtn]}
                >
                  {isCancelling || isUpdating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirm Action</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={styles.discardBtn}>
                  <Text style={styles.discardBtnText}>Discard</Text>
                </TouchableOpacity>
              </>
            );
          })()}

          {order.status === "CANCELED" && (order.payment_status === "PAID" || order.current_status === "PAID") && (
            <TouchableOpacity
              onPress={() => router.push("/admin/settlements/disputes" as any)}
              style={[styles.confirmBtn, { backgroundColor: "#FEF3C7", marginTop: 8 }]}
            >
              <Text style={[styles.confirmBtnText, { color: "#D97706" }]}>Manage Refund Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  headerCentered: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBack: { position: "absolute", left: 16 },
  titleCentered: { fontSize: 18, fontWeight: "600", color: "#030482" },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12, marginTop: 8 },
  infoGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  value: { fontSize: 14, fontWeight: "500", color: "#111827" },
  summaryCard: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 20 },
  itemRow: { paddingBottom: 12, marginBottom: 12 },
  itemBorder: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12 },
  itemName: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 8 },
  itemDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  itemLabel: { fontSize: 13, color: "#6b7280" },
  itemValue: { fontSize: 13, fontWeight: "500", color: "#111827" },
  summaryFooter: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12 },
  footerDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  footerLabel: { fontSize: 13, color: "#6b7280" },
  footerValue: { fontSize: 13, fontWeight: "500", color: "#111827" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#d1d5db", marginTop: 8, paddingTop: 8 },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  totalValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  trackingContainer: { marginBottom: 24, paddingLeft: 8 },
  trackingStep: { flexDirection: "row", gap: 12, minHeight: 48 },
  trackingLeft: { alignItems: "center" },
  trackingDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  trackingDotActive: { borderColor: "#030482", backgroundColor: "#030482" },
  trackingDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  trackingLine: { width: 2, flex: 1, backgroundColor: "#d1d5db", marginVertical: 2 },
  trackingLineActive: { backgroundColor: "#030482" },
  trackingLabel: { fontSize: 14, fontWeight: "500", color: "#111827", marginTop: 2 },
  actions: { gap: 12 },
  pickerContainer: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4 },
  actionTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  actionTabActive: { backgroundColor: "#fff" },
  actionTabText: { fontSize: 13, color: "#6b7280" },
  actionTabTextActive: { color: "#030482", fontWeight: "600" },
  reasonInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: "top" },
  confirmBtn: { backgroundColor: "#030482", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  discardBtn: { borderWidth: 1, borderColor: "#d1d5db", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  discardBtnText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  disabledBtn: { backgroundColor: "#9ca3af" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#ef4444", marginBottom: 12 },
  backBtn: { padding: 10, backgroundColor: "#030482", borderRadius: 8 },
  backBtnText: { color: "#fff" },
});
