import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using the Dandelionz platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you must not use the platform.",
  },
  {
    title: "2. Use of the Platform",
    body: "You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others. You must not use the platform to distribute spam, malware, or any other harmful content.",
  },
  {
    title: "3. Account Registration",
    body: "To access certain features you must register an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.",
  },
  {
    title: "4. Products and Orders",
    body: "We strive to ensure product descriptions and prices are accurate. Orders are subject to availability. We reserve the right to cancel orders in the event of pricing errors or stock issues.",
  },
  {
    title: "5. Payments",
    body: "All payments are processed securely. We do not store card details. Prices are listed in Nigerian Naira (₦) and are inclusive of applicable taxes unless stated otherwise.",
  },
  {
    title: "6. Returns & Refunds",
    body: "Returns are accepted within 7 days of delivery for unused items in original packaging. Refunds are processed within 5–10 business days after the returned item is received and inspected.",
  },
  {
    title: "7. Vendor Responsibilities",
    body: "Vendors are responsible for the accuracy of their product listings, stock availability, and timely fulfilment of orders. Dandelionz reserves the right to remove listings that violate our policies.",
  },
  {
    title: "8. Privacy",
    body: "Your use of the platform is also governed by our Privacy Policy. By using Dandelionz, you consent to the collection and use of your data as described in our Privacy Policy.",
  },
  {
    title: "9. Limitation of Liability",
    body: "To the fullest extent permitted by law, Dandelionz is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
  },
  {
    title: "10. Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.",
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Feather name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Terms & Conditions</Text>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          If you have any questions about these Terms, please contact us at{" "}
          <Text style={styles.footerLink}>support@dandelionz.net</Text>
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
  backBtn: { width: 32 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 6,
  },
  lastUpdated: { fontSize: 13, color: "#9CA3AF", marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionBody: { fontSize: 14, color: "#6B7280", lineHeight: 22 },
  footer: { fontSize: 13, color: "#6B7280", marginTop: 16, lineHeight: 20 },
  footerLink: { color: Colors.primary, fontWeight: "600" },
});
