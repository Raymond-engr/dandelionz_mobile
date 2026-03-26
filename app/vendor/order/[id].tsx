import { Colors } from "@/constants/theme";
import { useGetVendorOrderDetailsQuery } from "@/lib/api/vendorApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function StatusPill({ status }: { status: string }) {
  const s = status?.toUpperCase();
  let bg = "#F3F4F6";
  let color = "#374151";
  if (s === "PAID" || s === "DELIVERED") {
    bg = "rgba(77,255,151,0.25)";
    color = "#166534";
  } else if (s === "PENDING") {
    bg = "rgba(255,212,59,0.3)";
    color = "#854D0E";
  } else if (s === "SHIPPED") {
    bg = "rgba(3,4,130,0.15)";
    color = Colors.primary;
  } else if (s === "CANCELED") {
    bg = "rgba(255,77,77,0.15)";
    color = Colors.red;
  }
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{status}</Text>
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
    error,
  } = useGetVendorOrderDetailsQuery(id ?? "");
  const order = response?.data;

  const trackingSteps =
    order?.timeline?.map((step: any) => ({
      label: step.label,
      date: step.timestamp ? new Date(step.timestamp).toLocaleDateString() : "",
      completed: step.completed,
    })) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Failed to load order details.</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Info */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.metaLabel}>
              Order ID: <Text style={styles.metaValue}>{order.order_id}</Text>
            </Text>
            <Text style={styles.metaLabel}>
              Date:{" "}
              <Text style={styles.metaValue}>
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Text>
          </View>
          <StatusPill status={order.status} />
        </View>

        {/* Customer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <Text style={styles.customerName}>
            {order.customer?.full_name ?? "N/A"}
          </Text>
          <Text style={styles.customerEmail}>
            {order.customer?.email ?? "N/A"}
          </Text>
          {order.customer?.phone_number ? (
            <Text style={styles.customerEmail}>
              {order.customer.phone_number}
            </Text>
          ) : null}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {(order.items ?? order.order_items ?? []).map(
            (item: any, idx: number) => {
              const name = item.product_name ?? item.product?.name ?? "Item";
              const qty = item.quantity;
              const subtotal = item.item_subtotal ?? item.price ?? "0";
              return (
                <View
                  key={idx}
                  style={[styles.itemRow, idx > 0 && styles.itemRowBorder]}
                >
                  <View>
                    <Text style={styles.itemName}>{name}</Text>
                    <Text style={styles.itemQty}>Qty: {qty}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₦
                    {parseFloat(subtotal).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              );
            },
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₦
              {parseFloat(
                order.total_amount ?? order.total_price ?? "0",
              ).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        {trackingSteps.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Timeline</Text>
            {trackingSteps.map((step: any, i: number) => (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[styles.dot, step.completed && styles.dotActive]}
                  />
                  {i < trackingSteps.length - 1 && (
                    <View
                      style={[styles.line, step.completed && styles.lineActive]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.stepLabel,
                      step.completed && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {step.date ? (
                    <Text style={styles.stepDate}>{step.date}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40 },
  backArrow: { fontSize: 24, color: Colors.primary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  content: { padding: 16, paddingBottom: 40 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  metaLabel: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
  metaValue: { fontWeight: "600", color: "#111827" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  pillText: { fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  customerEmail: { fontSize: 13, color: "#6B7280" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  itemRowBorder: { borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  itemQty: { fontSize: 12, color: "#9CA3AF" },
  itemPrice: { fontSize: 14, fontWeight: "600", color: "#111827" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  totalValue: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  timelineRow: { flexDirection: "row", marginBottom: 20 },
  timelineLeft: { alignItems: "center", marginRight: 14, width: 20 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  dotActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#D1D5DB",
    marginTop: 4,
    minHeight: 20,
  },
  lineActive: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, paddingTop: 1 },
  stepLabel: { fontSize: 14, color: "#6B7280" },
  stepLabelActive: { fontWeight: "600", color: "#111827" },
  stepDate: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  errorText: { color: "#DC2626", marginBottom: 12 },
  backLink: { paddingVertical: 8, paddingHorizontal: 16 },
  backLinkText: { color: Colors.primary, fontWeight: "600" },
});
