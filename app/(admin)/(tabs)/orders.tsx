import { useGetAllOrdersQuery } from "@/lib/api/adminApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  PROCESSING: "#0284c7",
  SHIPPED: "#7c3aed",
  DELIVERED: "#16a34a",
  CANCELLED: "#dc2626",
};

export default function AdminOrders() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: ordersResponse, isLoading, isError, refetch } = useGetAllOrdersQuery();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const orders = ordersResponse?.data || [];
  const totalOrders = orders.length;

  const filtered = orders.filter(
    (o: any) =>
      String(o.order_id).includes(search) ||
      o.customer?.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  function statusColor(status: string) {
    return STATUS_COLORS[status?.toUpperCase()] ?? "#6b7280";
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <Text style={styles.titleCentered}>Orders</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        <View style={{ padding: 16 }}>
          <Text className="text-sm text-gray-600 mb-4">
            Manage your orders, update statuses, and view customer details
          </Text>

          {/* Total Orders Card */}
          <View className="bg-system-blue-light rounded-lg p-4 mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white/90 mb-1">Total Orders</Text>
              <Text className="text-3xl font-bold text-white">{totalOrders}</Text>
            </View>
            <Feather name="shopping-cart" size={48} color="white" style={{ opacity: 0.8 }} />
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900">All Orders</Text>
            <TouchableOpacity>
              <Feather name="filter" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#030482" style={{ marginTop: 20 }} />
          ) : isError ? (
            <Text style={styles.error}>Failed to load orders.</Text>
          ) : (
            <View>
              {filtered.map((item: any) => (
                <TouchableOpacity
                  key={item.uuid}
                  style={styles.row}
                  onPress={() => router.push(`/(admin)/orders/${item.uuid}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowTop}>
                    <Text style={styles.orderId}>Order #{item.order_id}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: statusColor(item.status) + "1a" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: statusColor(item.status) },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowBottom}>
                    <Text style={styles.customer}>
                      {item.customer?.full_name}
                    </Text>
                    <Text style={styles.amount}>
                      ₦{Number(item.total_amount ?? 0).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  headerCentered: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  titleCentered: { fontSize: 18, fontWeight: "600", color: "#111827" },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  count: { fontSize: 13, color: "#6b7280" },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  search: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderId: { fontSize: 15, fontWeight: "600", color: "#111827" },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customer: { fontSize: 13, color: "#6b7280" },
  amount: { fontSize: 14, fontWeight: "700", color: "#111827" },
  date: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  error: { textAlign: "center", color: "#ef4444", marginTop: 40 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40 },
});
