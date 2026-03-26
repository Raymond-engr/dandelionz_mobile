import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Vendor Agreement",
    body: "By registering as a vendor on the Dandelionz platform, you agree to abide by these Terms and Conditions. Dandelionz reserves the right to update these terms at any time with reasonable notice to vendors.",
  },
  {
    title: "2. Listing Requirements",
    body: "All products listed must be legal, accurately described, and available for sale. Vendors are solely responsible for the accuracy of product descriptions, images, pricing, and stock levels. Dandelionz may remove listings that violate these requirements without prior notice.",
  },
  {
    title: "3. Payments & Fees",
    body: "Dandelionz charges a platform fee on each completed transaction. Fees are deducted from your earnings before funds are credited to your wallet. The current fee schedule is available in your Payment Settings.",
  },
  {
    title: "4. Payouts & Withdrawals",
    body: "Earnings are credited to your vendor wallet after order delivery confirmation. Withdrawals are subject to a minimum threshold and may take 1–3 business days to process. Dandelionz is not liable for delays caused by third-party payment providers.",
  },
  {
    title: "5. Order Fulfillment",
    body: "Vendors are responsible for packing and shipping orders within the stated fulfillment window. Failure to fulfill orders within the agreed timeframe may result in order cancellation and penalties.",
  },
  {
    title: "6. Returns & Refunds",
    body: "Vendors must honor Dandelionz's return policy. Where a return is valid, the item cost (excluding applicable fees) will be deducted from the vendor's wallet balance.",
  },
  {
    title: "7. Prohibited Items",
    body: "Vendors may not list counterfeit goods, hazardous materials, stolen property, or any items prohibited by Nigerian law. Violations will result in immediate account suspension and possible legal action.",
  },
  {
    title: "8. Account Termination",
    body: "Dandelionz reserves the right to suspend or permanently close a vendor account that violates these terms, engages in fraudulent activity, or accumulates excessive customer complaints.",
  },
  {
    title: "9. Intellectual Property",
    body: "Vendors retain ownership of their product content. By listing on Dandelionz, you grant Dandelionz a non-exclusive license to display your product content for the purposes of operating the platform.",
  },
  {
    title: "10. Governing Law",
    body: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through negotiation, and if unresolved, through arbitration in Lagos, Nigeria.",
  },
];

export default function VendorTermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        <Text style={styles.intro}>
          Please read these Terms and Conditions carefully before using the
          Dandelionz Vendor platform. By using the platform you accept these
          terms in full.
        </Text>

        {SECTIONS.map((sec, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <Text style={styles.sectionBody}>{sec.body}</Text>
          </View>
        ))}

        <Text style={styles.contact}>
          For questions about these terms, please contact us via Account →
          Contact Us.
        </Text>
      </ScrollView>
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
  content: { padding: 20, paddingBottom: 40 },
  lastUpdated: { fontSize: 12, color: "#9CA3AF", marginBottom: 12 },
  intro: { fontSize: 14, color: "#374151", lineHeight: 22, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionBody: { fontSize: 14, color: "#6B7280", lineHeight: 22 },
  contact: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 22,
    fontStyle: "italic",
  },
});
