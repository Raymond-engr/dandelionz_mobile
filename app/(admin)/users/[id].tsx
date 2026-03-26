import React, { useState, useEffect } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
} from "@/lib/api/adminApi";
import { Ionicons } from "@expo/vector-icons";

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [action, setAction] = useState<"suspend" | "activate">("suspend");
  const [reason, setReason] = useState("");

  const { data: userResponse, isLoading, error, refetch } = useGetUserDetailsQuery(id!);
  const user = userResponse?.data;

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();

  useEffect(() => {
    if (user) {
      setAction(user.status === "ACTIVE" ? "suspend" : "activate");
    }
  }, [user]);

  const handleAction = async () => {
    if (!user) return;
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for this action.");
      return;
    }

    try {
      await updateUserStatus({ uuid: user.uuid, action, reason }).unwrap();
      Alert.alert("Success", `User successfully ${action === "suspend" ? "suspended" : "activated"}`);
      setReason("");
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to update user status");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load user details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.titleCentered}>User Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.fullName}>{user.full_name || "Unnamed User"}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: user.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.badgeText, { color: user.status === 'ACTIVE' ? '#16a34a' : '#dc2626' }]}>
                  {user.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                <Text style={[styles.badgeText, { color: '#1d4ed8' }]}>
                  {user.role}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.statLabel}>Total Spend</Text>
            <Text style={styles.statValue}>₦{parseFloat(user.total_spend || '0').toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#faf5ff' }]}>
            <Text style={styles.statLabel}>Total Order</Text>
            <Text style={styles.statValue}>{user.total_orders || '0'}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{user.full_name || "N/A"}</Text>
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{user.phone_number || "N/A"}</Text>
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Registration Date</Text>
          <Text style={styles.value}>
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
          </Text>
        </View>

        {/* Account Management */}
        <Text style={styles.sectionTitle}>Account Management</Text>
        <View style={styles.managementCard}>
          <Text style={styles.managementHint}>
            {user.status === "ACTIVE"
              ? "Suspending this user will prevent them from logging in and performing any activities."
              : "Activating this user will restore their access to the platform."}
          </Text>

          <TextInput
            placeholder="Provide a reason for this action..."
            value={reason}
            onChangeText={setReason}
            style={styles.reasonInput}
            multiline
          />

          <TouchableOpacity
            onPress={handleAction}
            disabled={isUpdating || !reason.trim()}
            style={[
              styles.actionBtn,
              user.status === "ACTIVE" ? styles.suspendBtn : styles.activateBtn,
              (isUpdating || !reason.trim()) && styles.disabledBtn,
            ]}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>
                {user.status === "ACTIVE" ? "Suspend User" : "Activate User"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Suspension History */}
        {user.suspension_history && user.suspension_history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Activity History</Text>
            {user.suspension_history.map((item: any) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={[styles.miniBadge, { backgroundColor: item.action === 'SUSPEND' ? '#fee2e2' : '#dcfce7' }]}>
                    <Text style={[styles.miniBadgeText, { color: item.action === 'SUSPEND' ? '#dc2626' : '#16a34a' }]}>
                      {item.action}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.historyReason}>"{item.reason}"</Text>
                <Text style={styles.historyAdmin}>Admin: {item.admin_email}</Text>
              </View>
            )).reverse()}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBack: { position: "absolute", left: 16 },
  titleCentered: { fontSize: 18, fontWeight: "600", color: "#030482" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#ef4444", marginBottom: 12 },
  backBtn: { padding: 10, backgroundColor: "#030482", borderRadius: 8 },
  backBtnText: { color: "#fff" },
  userHeader: { flexDirection: "row", gap: 16, marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  headerInfo: { flex: 1 },
  fullName: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 2 },
  email: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: "500" },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 12, borderRadius: 12 },
  statLabel: { fontSize: 12, color: "#374151", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 4 },
  infoGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 2 },
  value: { fontSize: 14, fontWeight: "500", color: "#111827" },
  managementCard: { backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 24 },
  managementHint: { fontSize: 12, color: "#4b5563", marginBottom: 12, fontWeight: "500" },
  reasonInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: "top", backgroundColor: "#fff", marginBottom: 12 },
  actionBtn: { paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  suspendBtn: { backgroundColor: "#dc2626" },
  activateBtn: { backgroundColor: "#16a34a" },
  disabledBtn: { opacity: 0.5 },
  historySection: { marginTop: 8 },
  historyItem: { backgroundColor: "#f9fafb", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 12 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  miniBadgeText: { fontSize: 10, fontWeight: "700" },
  historyDate: { fontSize: 10, color: "#6b7280" },
  historyReason: { fontSize: 12, color: "#374151", fontWeight: "500", marginBottom: 4 },
  historyAdmin: { fontSize: 10, color: "#6b7280" },
});