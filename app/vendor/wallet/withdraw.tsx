import { Colors } from "@/constants/theme";
import {
    useGetPaymentSettingsQuery,
    useGetWalletBalanceQuery,
} from "@/lib/api/vendorApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: walletData, isLoading: walletLoading } =
    useGetWalletBalanceQuery();
  const { data: paymentData, isLoading: paymentLoading } =
    useGetPaymentSettingsQuery();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (walletData?.data?.withdrawable_balance !== undefined) {
      setAmount(walletData.data.withdrawable_balance.toFixed(2));
    }
  }, [walletData]);

  const isLoading = walletLoading || paymentLoading;
  const payment = paymentData?.data;

  const handleProceed = () => {
    setError("");
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!payment?.bank_name || !payment?.account_number) {
      setError("Please complete bank details in Payment Settings.");
      return;
    }
    if (val > (walletData?.data?.withdrawable_balance ?? 0)) {
      setError("Amount exceeds withdrawable balance.");
      return;
    }
    const params = new URLSearchParams({
      amount,
      bankName: payment.bank_name ?? "",
      accountNumber: payment.account_number ?? "",
      accountName: payment.account_name ?? "",
    }).toString();
    router.push(`/vendor/wallet/confirm-pin?${params}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/vendor/(tabs)/wallet")}
            hitSlop={8}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Withdraw Earnings</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Withdrawable Amount</Text>
            <TextInput
              style={styles.input}
              value={`₦ ${amount}`}
              onChangeText={(v) =>
                setAmount(v.replace("₦ ", "").replace(/[^0-9.]/g, ""))
              }
              keyboardType="numeric"
            />

            <Text style={[styles.label, { marginTop: 24 }]}>
              Payment Option
            </Text>
            <View style={styles.bankCard}>
              <Text style={styles.bankCardTitle}>Bank Transfer</Text>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Account Number</Text>
                <View style={styles.readonlyInput}>
                  <Text style={styles.readonlyText}>
                    {payment?.account_number || "—"}
                  </Text>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Bank Name</Text>
                <View style={styles.readonlyInput}>
                  <Text style={styles.readonlyText}>
                    {payment?.bank_name || "—"}
                  </Text>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Account Name</Text>
                <View style={styles.readonlyInput}>
                  <Text style={styles.readonlyText}>
                    {payment?.account_name || "—"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push("/vendor/account/payment-settings")}
              >
                <Text style={styles.editLink}>Edit Bank Details</Text>
              </Pressable>
            </View>

            {!payment?.has_pin && (
              <View style={styles.pinNotice}>
                <Text style={styles.pinNoticeText}>
                  Please set a payment PIN to proceed with withdrawal.
                </Text>
                <Pressable
                  onPress={() =>
                    router.push("/vendor/account/payment-settings/change-pin")
                  }
                  style={styles.setPinBtn}
                >
                  <Text style={styles.setPinText}>Set Payment PIN</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={handleProceed}
              disabled={!payment?.has_pin || parseFloat(amount) <= 0}
              style={[
                styles.proceedBtn,
                (!payment?.has_pin || parseFloat(amount) <= 0) &&
                  styles.proceedBtnDisabled,
              ]}
            >
              <Text style={styles.proceedBtnText}>Proceed</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
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
  content: { padding: 20, paddingBottom: 40 },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13 },
  label: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  bankCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  bankCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, color: "#6B7280" },
  readonlyInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  readonlyText: { fontSize: 14, color: "#374151" },
  editLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  pinNotice: {
    marginTop: 20,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  pinNoticeText: { fontSize: 14, color: Colors.primary, textAlign: "center" },
  setPinBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  setPinText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  proceedBtn: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedBtnDisabled: { opacity: 0.5 },
  proceedBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
