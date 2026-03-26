import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const FAQS = [
  {
    q: "How do I list a product on Dandelionz?",
    a: "Go to Products → tap the + button → fill in your product details (name, description, images, price, and stock) → publish directly to your store or save as a draft.",
  },
  {
    q: "When will I receive payment for an order?",
    a: "Payments are processed after an order is marked as delivered. Once cleared, funds appear in your withdrawable balance within 24–48 hours.",
  },
  {
    q: "How do I withdraw my earnings?",
    a: "Go to Wallet → tap 'Withdraw Earnings' → enter the amount → confirm with your 4-digit payment PIN. Withdrawals are transferred to your registered bank account.",
  },
  {
    q: "How do I set or change my payment PIN?",
    a: "Go to Account → Payment Settings → Set/Change Payment PIN. You'll receive an OTP to verify before setting a new PIN.",
  },
  {
    q: "What are the fees charged on sales?",
    a: "Dandelionz charges a small platform fee per successful transaction. The exact percentage is shown in your vendor agreement and payment settings.",
  },
  {
    q: "Can I edit a product after it's been published?",
    a: "Yes. Go to Products → tap any product → select Edit. You can update name, images, price, and stock at any time.",
  },
  {
    q: "What happens when I save a product as a draft?",
    a: "Drafts are visible only to you and not shown to buyers. You can submit a draft to your store whenever you're ready from the Products tab.",
  },
  {
    q: "How do I handle a return or refund?",
    a: "Contact our support team via the 'Contact Us' option in Account. Our team will guide you through the return and refund process.",
  },
  {
    q: "Why is my withdrawal showing as 'Pending'?",
    a: "Withdrawals may take 1–3 business days depending on your bank. If it stays pending for longer, please contact support.",
  },
  {
    q: "How do I close my vendor account?",
    a: "Go to Account → Close Account. Note that closing your account is permanent and will remove all your listings and earnings history.",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.item}>
      <Pressable onPress={() => setOpen(!open)} style={styles.questionRow}>
        <Text style={styles.question}>{q}</Text>
        <Svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        >
          <Path
            d="M4 6l4 4 4-4"
            stroke={Colors.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
      {open && <Text style={styles.answer}>{a}</Text>}
    </View>
  );
}

export default function VendorFaqsScreen() {
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
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Frequently asked questions about selling on Dandelionz.
        </Text>
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} q={faq.q} a={faq.a} />
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
  backBtn: { width: 40 },
  backArrow: { fontSize: 24, color: Colors.primary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 14, color: "#6B7280", marginBottom: 20, lineHeight: 20 },
  item: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 12,
  },
  question: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    lineHeight: 20,
  },
  answer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
