import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAQS = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products, add items to your cart, then proceed to checkout. You can pay using your preferred payment method.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept bank transfers, card payments, and other supported mobile payment options.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery typically takes 2–5 business days depending on your location. You can track your order in the Orders section.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Yes. Returns and exchanges are accepted within 7 days of delivery, provided the item is unused and in its original packaging.",
  },
  {
    question: "How do I become a vendor?",
    answer:
      'Register an account and select "Vendor" as your role. Your account will be reviewed and approved by our team.',
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Absolutely. We use industry-standard encryption and never store your card details on our servers.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach us via the Contact Us page, email, phone, or WhatsApp. Our team is available Monday–Friday, 9am–6pm.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setOpen(!open)} style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <View style={styles.toggleBtn}>
          <Text style={styles.toggleIcon}>{open ? "−" : "+"}</Text>
        </View>
      </Pressable>
      {open && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
      <View style={styles.divider} />
    </View>
  );
}

export default function FAQsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Feather name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Frequently Asked Questions</Text>

        {FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
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
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 24,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 22,
  },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  toggleIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 26,
  },
  faqBody: { paddingBottom: 12 },
  faqAnswer: { fontSize: 14, color: "#6B7280", lineHeight: 22 },
  divider: {
    height: 11,
    backgroundColor: "#F5F7FA",
    marginHorizontal: -20,
    marginVertical: 4,
  },
});
