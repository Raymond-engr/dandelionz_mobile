import { Colors } from "@/constants/theme";
import { useGetLastWithdrawalQuery } from "@/lib/api/vendorApi";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function WithdrawalReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: response, isLoading } = useGetLastWithdrawalQuery();
  const w = response?.data;

  const handleShare = async () => {
    if (!w) return;
    const text = [
      "Withdrawal Receipt — Dandelionz",
      `Reference: ${w.reference ?? w.id}`,
      `Amount: ₦${parseFloat(w.amount ?? "0").toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      `Bank: ${w.bank_name}`,
      `Account: ${w.account_number}`,
      `Date: ${w.created_at ? new Date(w.created_at).toLocaleString() : "N/A"}`,
      `Status: ${w.status}`,
    ].join("\n");
    await Share.share({ message: text });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
        <Text style={styles.headerTitle}>Receipt</Text>
        <Pressable onPress={handleShare} hitSlop={8} style={styles.shareBtn}>
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandName}>Dandelionz</Text>
          <Text style={styles.receiptTitle}>Withdrawal Receipt</Text>
        </View>

        <View style={styles.divider} />

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount Withdrawn</Text>
          <Text style={styles.amountValue}>
            ₦
            {parseFloat(w?.amount ?? "0").toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.detailsCard}>
          <ReceiptRow label="Reference" value={w?.reference ?? w?.id ?? "—"} />
          <View style={styles.rowDivider} />
          <ReceiptRow label="Bank" value={w?.bank_name ?? "—"} />
          <View style={styles.rowDivider} />
          <ReceiptRow label="Account Number" value={w?.account_number ?? "—"} />
          <View style={styles.rowDivider} />
          <ReceiptRow label="Account Name" value={w?.account_name ?? "—"} />
          <View style={styles.rowDivider} />
          <ReceiptRow
            label="Date"
            value={
              w?.created_at ? new Date(w.created_at).toLocaleString() : "—"
            }
          />
          <View style={styles.rowDivider} />
          <ReceiptRow label="Status" value={w?.status ?? "—"} />
        </View>

        <Pressable
          onPress={() => router.replace("/vendor/(tabs)/wallet")}
          style={styles.doneBtn}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  shareBtn: { width: 40, alignItems: "flex-end" },
  shareText: { color: Colors.primary, fontWeight: "600", fontSize: 15 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  brandHeader: { paddingVertical: 24, alignItems: "center" },
  brandName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  receiptTitle: { fontSize: 14, color: "#6B7280" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 4 },
  amountSection: { paddingVertical: 20, alignItems: "center" },
  amountLabel: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  amountValue: { fontSize: 32, fontWeight: "700", color: "#111827" },
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowLabel: { fontSize: 13, color: "#6B7280" },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    maxWidth: "55%",
    textAlign: "right",
  },
  rowDivider: { height: 1, backgroundColor: "#E5E7EB" },
  doneBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
