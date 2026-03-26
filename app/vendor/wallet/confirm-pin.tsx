import { Colors } from "@/constants/theme";
import { useWithdrawMutation } from "@/lib/api/vendorApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ConfirmPinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>();

  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const [withdraw, { isLoading }] = useWithdrawMutation();

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...pin];
    next[index] = digit;
    setPin(next);
    setError("");
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...pin];
      next[index - 1] = "";
      setPin(next);
    }
  };

  const handleConfirm = async () => {
    setError("");
    const fullPin = pin.join("");
    if (fullPin.length < 4) {
      setError("Please enter your 4-digit payment PIN.");
      return;
    }
    try {
      await withdraw({
        amount: parseFloat(params.amount ?? "0"),
        pin: fullPin,
      }).unwrap();
      router.replace("/vendor/wallet/success");
    } catch (err: any) {
      setError(err?.data?.message ?? "Incorrect PIN. Please try again.");
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

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
        <Text style={styles.headerTitle}>Confirm PIN</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Withdraw Amount</Text>
          <Text style={styles.summaryAmount}>
            ₦
            {parseFloat(params.amount ?? "0").toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Bank</Text>
            <Text style={styles.summaryVal}>{params.bankName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Account No.</Text>
            <Text style={styles.summaryVal}>{params.accountNumber}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Account Name</Text>
            <Text style={styles.summaryVal}>{params.accountName}</Text>
          </View>
        </View>

        {/* PIN Label */}
        <Text style={styles.pinLabel}>Enter Payment PIN</Text>
        <Text style={styles.pinSubtitle}>
          Enter your 4-digit payment PIN to confirm withdrawal
        </Text>

        {/* PIN Boxes */}
        <View style={styles.pinRow}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.pinBox,
                digit ? styles.pinBoxFilled : null,
                error ? styles.pinBoxError : null,
              ]}
              value={digit ? "●" : ""}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              secureTextEntry={false}
              caretHidden
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Confirm Button */}
        <Pressable
          onPress={handleConfirm}
          disabled={isLoading || pin.some((d) => !d)}
          style={[
            styles.confirmBtn,
            (isLoading || pin.some((d) => !d)) && styles.confirmBtnDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  content: { padding: 20, paddingTop: 28 },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  summaryLabel: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 14,
  },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 14 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryKey: { fontSize: 13, color: "#6B7280" },
  summaryVal: { fontSize: 13, fontWeight: "600", color: "#111827" },
  pinLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  pinSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  pinBox: {
    width: 55,
    height: 55,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    fontSize: 22,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  pinBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: "#EEF2FF",
  },
  pinBoxError: { borderColor: "#DC2626" },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 12,
  },
  confirmBtn: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
