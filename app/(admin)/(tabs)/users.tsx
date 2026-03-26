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
import { useGetAllUsersQuery } from "@/lib/api/adminApi";
import { Feather } from "@expo/vector-icons";

export default function AdminUsers() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: usersResponse, isLoading, isError, refetch } = useGetAllUsersQuery({});
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const users = usersResponse?.data || [];
  const totalUsers = users.length;
  const activeUsers = users.filter((user: any) => user.status === "ACTIVE").length;
  const suspendedUsers = totalUsers - activeUsers;

  const filtered = users.filter(
    (u: any) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (userId: string) => {
    router.push(`/(admin)/users/${userId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <Text style={styles.titleCentered}>Users</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        <Text className="text-sm text-gray-600 mb-4">
          Oversee users information, orders, and deactivate users account
        </Text>

        {/* Total Users Card */}
        <View className="bg-system-blue-light rounded-lg p-4 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-white/90 mb-1">Total Users</Text>
            <Text className="text-3xl font-bold text-white">{totalUsers}</Text>
          </View>
          <Feather name="users" size={48} color="white" style={{ opacity: 0.8 }} />
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-green-50 rounded-lg p-4">
            <Text className="text-sm text-gray-700 mb-1">Active Users</Text>
            <Text className="text-2xl font-bold text-gray-900">{activeUsers}</Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-lg p-4">
            <Text className="text-sm text-gray-700 mb-1">Suspended Users</Text>
            <Text className="text-2xl font-bold text-gray-900">{suspendedUsers}</Text>
          </View>
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-900">All Users</Text>
          <TouchableOpacity>
            <Feather name="filter" size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#030482" style={{ marginTop: 20 }} />
        ) : (
          <View>
            {filtered.map((item: any) => (
              <TouchableOpacity
                key={item.uuid}
                style={styles.row}
                onPress={() => handleUserClick(item.uuid)}
                activeOpacity={0.7}
              >
                {/* Avatar initials */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.full_name}
                  </Text>
                  <Text style={styles.rowEmail} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: (item.status === "ACTIVE" ? "#16a34a" : "#dc2626") + "18" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.status === "ACTIVE" ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {item.status === "ACTIVE" ? "Active" : "Suspended"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#16a34a" },
  rowContent: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  rowEmail: { fontSize: 12, color: "#6b7280", marginTop: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  error: { textAlign: "center", color: "#ef4444", marginTop: 40 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40 },
});