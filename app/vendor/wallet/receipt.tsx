import { Colors } from "@/constants/theme";
import { useGetTransactionHistoryQuery } from "@/lib/api/vendorApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";

export default function WithdrawalReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
  }>();

  const { data: response, isLoading } = useGetTransactionHistoryQuery({});

  const transaction = useMemo(() => {
    if (!response?.results) return null;
    return response.results.find((t: any) => t.type === "WITHDRAWAL" || t.transaction_type === "WITHDRAWAL");
  }, [response]);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const displayAmount = params.amount || (transaction?.amount ? String(transaction.amount) : "0");
  const displayAccountName = params.accountName || "N/A";
  const displayAccountNumber = params.accountNumber || "N/A";
  const displayBankName = params.bankName || "N/A";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/vendor/(tabs)/wallet");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.receiptCard}>
          <View style={styles.successIcon}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.receiptTitle}>Withdrawal Successful</Text>
          <Text style={styles.amount}>
            {formatCurrency(displayAmount)}
          </Text>

          <View style={styles.divider} />

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Withdrawal Details</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Receiver Name</Text>
            <Text style={styles.value}>{displayAccountName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Receiver Details</Text>
            <Text style={styles.value}>{displayAccountNumber} ({displayBankName})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction Date</Text>
            <Text style={styles.value}>
              {transaction ? new Date(transaction.created_at).toLocaleString() : new Date().toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sender Details</Text>
            <Text style={styles.value}>DANDELIONZ</Text>
          </View>
          
          {transaction?.id && (
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{transaction.id}</Text>
            </View>
          )}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backArrow: { fontSize: 24, color: Colors.primary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  content: { padding: 20, alignItems: "center" },
  receiptCard: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  checkMark: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  receiptTitle: { fontSize: 16, color: "#6B7280", marginBottom: 8 },
  amount: { fontSize: 32, fontWeight: "800", color: Colors.primary, marginBottom: 24 },
  divider: { width: "100%", height: 1, backgroundColor: "#E5E7EB", marginBottom: 24 },
  sectionTitleRow: { width: "100%", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, fontWeight: "600", color: "#111827", textAlign: "right", flex: 1, marginLeft: 20 },
  doneBtn: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    width: "100%",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtnLarge: { marginTop: 20, padding: 12 },
  backBtnText: { color: Colors.primary, fontWeight: "600" },
  errorText: { color: "#6B7280", textAlign: "center" },
});
