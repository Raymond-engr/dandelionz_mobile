import React, { useState } from "react";
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
import { 
  useGetAdminOrderDetailsQuery, 
  useCancelOrderWithReasonMutation, 
  useUpdateOrderStatusMutation 
} from "@/lib/api/adminApi";
import { Ionicons, Feather } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/utils";

import Toast from "react-native-toast-message";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [action, setAction] = useState<"cancel" | "process" | "complete">("cancel");
  const [reason, setReason] = useState("");

  const { data: orderResponse, isLoading, error, refetch } = useGetAdminOrderDetailsQuery(id!);
  const order = orderResponse; // Based on adminApi it might be direct or wrapped

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderWithReasonMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

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
        await updateOrderStatus({ order_id: order.order_id, status: "PROCESSING" }).unwrap();
      } else if (action === "complete") {
        await updateOrderStatus({ order_id: order.order_id, status: "DELIVERED" }).unwrap();
      }
      Toast.show({ type: "success", text1: "Order status updated successfully." });
      refetch();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to update order status" 
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

      <ScrollView contentContainerStyle={styles.content}>
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

        <View style={styles.actions}>
           <View style={styles.pickerContainer}>
              {["cancel", "process", "complete"]
                .filter(a => order.payment_status?.toLowerCase() !== 'pending' || a === 'cancel')
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
