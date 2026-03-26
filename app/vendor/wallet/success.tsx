import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

function SuccessCheckmark() {
  return (
    <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
      <Circle cx="48" cy="48" r="48" fill="rgba(77,255,151,0.15)" />
      <Circle cx="48" cy="48" r="36" fill="rgba(77,255,151,0.25)" />
      <Circle cx="48" cy="48" r="28" fill={Colors.primary} />
      <Path
        d="M34 48l10 10 18-20"
        stroke="#fff"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function WithdrawalSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.body}>
        <SuccessCheckmark />
        <Text style={styles.title}>Withdrawal Successful!</Text>
        <Text style={styles.subtitle}>
          Your withdrawal request has been submitted. Funds will be transferred
          to your bank account shortly.
        </Text>

        <Pressable
          onPress={() => router.push("/vendor/wallet/receipt")}
          style={styles.receiptBtn}
        >
          <Text style={styles.receiptBtnText}>View Receipt</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/vendor/(tabs)/wallet")}
          style={styles.walletBtn}
        >
          <Text style={styles.walletBtnText}>Back to Wallet</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  receiptBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  receiptBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  walletBtn: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  walletBtnText: { color: "#374151", fontSize: 16, fontWeight: "600" },
});
