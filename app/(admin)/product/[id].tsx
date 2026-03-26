import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetAdminProductDetailsQuery,
  useApproveProductAdminMutation,
  useRejectProductAdminMutation,
} from "@/lib/api/adminApi";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [action, setAction] = useState<"Approve Product" | "Reject Product">("Approve Product");
  const [reason, setReason] = useState("");

  const { data: productResponse, isLoading, error, refetch } = useGetAdminProductDetailsQuery(id!);
  const product = productResponse?.data;

  const [approveProduct, { isLoading: isApproving }] = useApproveProductAdminMutation();
  const [rejectProduct, { isLoading: isRejecting }] = useRejectProductAdminMutation();

  const handleConfirmAction = async () => {
    if (!product) return;

    try {
      if (action === "Approve Product") {
        await approveProduct(id!).unwrap();
        Alert.alert("Success", "Product approved successfully!");
      } else {
        await rejectProduct({ slug: id!, reason: reason || undefined }).unwrap();
        Alert.alert("Success", "Product rejected successfully!");
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

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load product details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSubmitting = isApproving || isRejecting;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.titleCentered}>Product Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Product Information</Text>
        
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={48} color="#9ca3af" />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₦{Number(product.price ?? 0).toLocaleString()}
            </Text>
            {product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.gridInfo}>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Category:</Text>
              <Text style={styles.gridValue}>{product.category_name || product.category}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Stock:</Text>
              <Text style={styles.gridValue}>{product.stock} Units</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridLabel}>Uploaded Date:</Text>
              <Text style={styles.gridValue}>{new Date(product.uploadDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vendor Information</Text>
        <View style={styles.infoSection}>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorLabel}>Store Name</Text>
            <Text style={styles.vendorValue}>{product.vendor.store_name}</Text>
          </View>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorLabel}>Email Address</Text>
            <Text style={styles.vendorValue}>{product.vendor.email}</Text>
          </View>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: (product.status === 'APPROVED' ? '#16a34a' : product.status === 'REJECTED' ? '#dc2626' : '#d97706') + '1a' }]}>
              <Text style={[styles.statusText, { color: product.status === 'APPROVED' ? '#16a34a' : product.status === 'REJECTED' ? '#dc2626' : '#d97706' }]}>
                {product.status}
              </Text>
            </View>
          </View>
        </View>

        {product.status === "PENDING" && (
          <View style={styles.actions}>
            <View style={styles.pickerContainer}>
              {["Approve Product", "Reject Product"].map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAction(a as any)}
                  style={[styles.actionTab, action === a && styles.actionTabActive]}
                >
                  <Text style={[styles.actionTabText, action === a && styles.actionTabTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Reason for action (optional)..."
              value={reason}
              onChangeText={setReason}
              style={styles.reasonInput}
              multiline
            />

            <TouchableOpacity
              onPress={handleConfirmAction}
              disabled={isSubmitting}
              style={[styles.confirmBtn, isSubmitting && styles.disabledBtn]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Action</Text>
              )}
            </TouchableOpacity>
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
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12, marginTop: 8 },
  imageContainer: { height: 240, backgroundColor: "#f9fafb", borderRadius: 12, marginBottom: 16, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center" },
  infoSection: { marginBottom: 24 },
  productName: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 8 },
  description: { fontSize: 14, color: "#6b7280", lineHeight: 20, marginBottom: 16 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  price: { fontSize: 24, fontWeight: "700", color: "#111827" },
  discountBadge: { backgroundColor: "#fee2e2", px: 8, py: 4, borderRadius: 4 },
  discountText: { fontSize: 12, fontWeight: "700", color: "#dc2626" },
  gridInfo: { gap: 12 },
  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  gridLabel: { fontSize: 14, color: "#111827" },
  gridValue: { fontSize: 14, fontWeight: "500", color: "#111827" },
  vendorInfo: { marginBottom: 12 },
  vendorLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  vendorValue: { fontSize: 14, fontWeight: "500", color: "#111827" },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: "600" },
  actions: { gap: 12, marginTop: 16 },
  pickerContainer: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4 },
  actionTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  actionTabActive: { backgroundColor: "#fff" },
  actionTabText: { fontSize: 13, color: "#6b7280" },
  actionTabTextActive: { color: "#030482", fontWeight: "600" },
  reasonInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: "top", backgroundColor: "#fff" },
  confirmBtn: { backgroundColor: "#030482", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  disabledBtn: { backgroundColor: "#9ca3af" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#ef4444", marginBottom: 12 },
  backBtn: { padding: 10, backgroundColor: "#030482", borderRadius: 8 },
  backBtnText: { color: "#fff" },
});