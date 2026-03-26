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
  useGetVendorDetailsQuery,
  useApproveVendorMutation,
  useVerifyVendorKYCMutation,
  useSuspendVendorMutation,
} from "@/lib/api/adminApi";
import { Ionicons } from "@expo/vector-icons";

export default function VendorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: vendorResponse, isLoading, error, refetch } = useGetVendorDetailsQuery(id!);
  const vendor = vendorResponse?.data;

  const [approveVendor, { isLoading: isApproving }] = useApproveVendorMutation();
  const [verifyKYC, { isLoading: isVerifying }] = useVerifyVendorKYCMutation();
  const [suspendVendor, { isLoading: isSuspending }] = useSuspendVendorMutation();

  const [action, setAction] = useState("");

  const availableActions = React.useMemo(() => {
    if (!vendor) return [];
    const actions = [];
    if (!vendor.is_active) actions.push("Approve Vendor");
    if (vendor.is_active) actions.push("Suspend Vendor");
    if (vendor.is_active) actions.push("Reject Vendor");
    if (!vendor.is_verified_vendor) actions.push("Verify KYC");
    return actions;
  }, [vendor]);

  useEffect(() => {
    if (availableActions.length > 0 && !action) {
      setAction(availableActions[0]);
    }
  }, [availableActions]);

  const handleConfirmAction = async () => {
    if (!vendor) return;

    try {
      if (action === "Approve Vendor") {
        await approveVendor({ user_uuid: id!, approve: true }).unwrap();
        Alert.alert("Success", "Vendor approved successfully");
      } else if (action === "Suspend Vendor" || action === "Reject Vendor") {
        await approveVendor({ user_uuid: id!, approve: false }).unwrap();
        Alert.alert("Success", `Vendor ${action === "Suspend Vendor" ? "suspended" : "rejected"} successfully`);
      } else if (action === "Verify KYC") {
        await verifyKYC({ user_uuid: id!, approve: true }).unwrap();
        Alert.alert("Success", "Vendor KYC verified successfully");
      }
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to perform action");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (error || !vendor) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load vendor details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isProcessing = isApproving || isVerifying || isSuspending;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.titleCentered}>Vendor Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Vendor Header */}
        <View style={styles.vendorHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{vendor.store_name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.storeName}>{vendor.store_name}</Text>
            <Text style={styles.email}>{vendor.email}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: vendor.is_active ? "#dcfce7" : "#fee2e2" }]}>
                <Text style={[styles.badgeText, { color: vendor.is_active ? "#16a34a" : "#dc2626" }]}>
                  {vendor.is_active ? "Active" : "Suspended"}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: vendor.is_verified_vendor ? "#dbeafe" : "#fef9c3" }]}>
                <Text style={[styles.badgeText, { color: vendor.is_verified_vendor ? "#1d4ed8" : "#a16207" }]}>
                  {vendor.is_verified_vendor ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Business Information */}
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{vendor.full_name || "N/A"}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{vendor.phone_number || "N/A"}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Reg. Number</Text>
            <Text style={styles.value}>{vendor.business_registration_number || "N/A"}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Joined Date</Text>
            <Text style={styles.value}>
              {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "N/A"}
            </Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{vendor.address || "N/A"}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <Text style={styles.value}>{vendor.bank_name || "N/A"}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{vendor.account_number || "N/A"}</Text>
          </View>
          {vendor.recipient_code && (
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Recipient Code</Text>
              <Text style={styles.value}>{vendor.recipient_code}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {availableActions.length > 0 ? (
          <View style={styles.actions}>
            <Text style={styles.actionSectionTitle}>Choose Action</Text>
            <View style={styles.pickerContainer}>
              {availableActions.map((act) => (
                <TouchableOpacity
                  key={act}
                  onPress={() => setAction(act)}
                  style={[styles.actionTab, action === act && styles.actionTabActive]}
                >
                  <Text style={[styles.actionTabText, action === act && styles.actionTabTextActive]}>
                    {act}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleConfirmAction}
              disabled={isProcessing}
              style={[styles.confirmBtn, isProcessing && styles.disabledBtn]}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Action</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noActions}>
            <Text style={styles.noActionsText}>No pending actions for this vendor.</Text>
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
  vendorHeader: { flexDirection: "row", gap: 16, marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  headerInfo: { flex: 1 },
  storeName: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 2 },
  email: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: "500" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 4 },
  infoCard: { marginBottom: 20 },
  infoGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 2 },
  value: { fontSize: 14, fontWeight: "500", color: "#111827" },
  actions: { gap: 12, marginTop: 12 },
  actionSectionTitle: { fontSize: 12, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 },
  pickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" },
  actionTabActive: { backgroundColor: "#fff", borderColor: "#030482" },
  actionTabText: { fontSize: 12, color: "#6b7280" },
  actionTabTextActive: { color: "#030482", fontWeight: "600" },
  confirmBtn: { backgroundColor: "#030482", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  disabledBtn: { backgroundColor: "#9ca3af" },
  noActions: { padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, alignItems: "center" },
  noActionsText: { fontSize: 14, color: "#6b7280" },
});