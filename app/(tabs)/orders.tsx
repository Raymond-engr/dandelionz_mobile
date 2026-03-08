import { Colors } from "@/constants/theme";
import { useGetCustomerOrdersQuery } from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#D97706" },
  processing: { bg: "#DBEAFE", text: "#2563EB" },
  shipped: { bg: "#EDE9FE", text: "#7C3AED" },
  delivered: { bg: "#D1FAE5", text: "#059669" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFocused = useIsFocused();

  const { data: ordersResponse, isLoading } = useGetCustomerOrdersQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const orders = ordersResponse?.data ?? ordersResponse?.results ?? [];

  // Redirect to login if not authenticated
  const redirected = React.useRef(false);

  useEffect(() => {
    if (isFocused) {
      redirected.current = false; // reset flag when screen is focused
    }
    if (!isAuthenticated && isFocused && !redirected.current) {
      redirected.current = true;
      AsyncStorage.setItem("redirect_after_login", "/(tabs)/orders");
      router.replace("/(tabs)");
      router.push("/(auth)/login");
    }
  }, [isAuthenticated, isFocused, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📦</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          Your order history will appear here
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: any }) => {
          const status = item.status?.toLowerCase() ?? "pending";
          const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
          const date = item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "";

          return (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNum}>
                    Order #{item.order_number ?? item.id}
                  </Text>
                  <Text style={styles.orderDate}>{date}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusStyle.text }]}
                  >
                    {item.status?.charAt(0).toUpperCase() +
                      item.status?.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDivider} />

              <View style={styles.orderItems}>
                {(item.items ?? []).slice(0, 2).map((oi: any, idx: number) => (
                  <Text
                    key={idx}
                    style={styles.orderItemName}
                    numberOfLines={1}
                  >
                    • {oi.product_details?.name ?? "Product"} × {oi.quantity}
                  </Text>
                ))}
                {(item.items ?? []).length > 2 && (
                  <Text style={styles.moreItems}>
                    +{item.items.length - 2} more items
                  </Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>
                  Total: ₦
                  {parseFloat(item.total ?? "0").toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  list: { padding: 16, gap: 12 },
  orderCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNum: { fontSize: 15, fontWeight: "700", color: "#111827" },
  orderDate: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600" },
  orderDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  orderItems: { gap: 4, marginBottom: 12 },
  orderItemName: { fontSize: 13, color: "#374151" },
  moreItems: { fontSize: 12, color: "#9CA3AF", fontStyle: "italic" },
  orderFooter: { flexDirection: "row", justifyContent: "flex-end" },
  orderTotal: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F9FAFB",
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
