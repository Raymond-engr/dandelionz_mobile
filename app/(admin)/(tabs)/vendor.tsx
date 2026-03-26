import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetAllVendorsQuery } from "@/lib/api/adminApi";
import { Feather } from "@expo/vector-icons";

export default function AdminVendors() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: vendorsResponse, isLoading, isError, refetch } = useGetAllVendorsQuery();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const vendors = vendorsResponse?.data || [];
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v: any) => v.is_active).length;
  const suspendedVendors = totalVendors - activeVendors;

  const filtered = vendors.filter((v: any) =>
    v.store_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <Text style={styles.titleCentered}>Vendor</Text>
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
            Approve, suspend and deactivate your vendors
          </Text>

          {/* Total Vendors Card */}
          <View className="bg-system-blue-light rounded-lg p-4 mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white/90 mb-1">Total Vendors</Text>
              <Text className="text-3xl font-bold text-white">{totalVendors}</Text>
            </View>
            <Feather name="home" size={48} color="white" style={{ opacity: 0.8 }} />
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-green-50 rounded-lg p-4">
              <Text className="text-sm text-gray-700 mb-1">Active Vendors</Text>
              <Text className="text-2xl font-bold text-gray-900">{activeVendors}</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-lg p-4">
              <Text className="text-sm text-gray-700 mb-1">Suspended Vendors</Text>
              <Text className="text-2xl font-bold text-gray-900">{suspendedVendors}</Text>
            </View>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900">All Vendors</Text>
            <TouchableOpacity>
              <Feather name="filter" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#030482" style={{ marginTop: 20 }} />
          ) : isError ? (
            <Text style={styles.error}>Failed to load vendors.</Text>
          ) : (
            <View>
              {filtered.map((item: any) => (
                <TouchableOpacity
                  key={item.user_uuid}
                  style={styles.row}
                  onPress={() => router.push(`/(admin)/vendor/${item.user_uuid}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.store_name?.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowName} numberOfLines={1}>{item.store_name}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>{item.email}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: (item.is_active ? "#16a34a" : "#dc2626") + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: item.is_active ? "#16a34a" : "#dc2626" },
                      ]}
                    >
                      {item.is_active ? "Active" : "Suspended"}
                    </Text>
                  </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  rowSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  error: { textAlign: "center", color: "#ef4444", marginTop: 40 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40 },
});