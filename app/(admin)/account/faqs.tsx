import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAQS = [
  {
    q: "Are you partnering with a Third Party Vendor for the installment payment processing?",
    a: "The answer to the question will be written here",
  },
  {
    q: "If you are handling the installment payment, is it going to be subscription based?",
    a: "The answer to the question will be written here",
  },
  {
    q: "What are the parameters to consider before delivering the product to the buyer? (On installment payments)",
    a: "The answer to the question will be written here",
  },
  {
    q: "How do we ensure follow up after product delivery?",
    a: "The answer to the question will be written here",
  },
  {
    q: "How is Dandelionz different from other e-commerce platforms? Do they offer services that other platforms don't offer?",
    a: "The answer to the question will be written here",
  },
  {
    q: "Can I track my products in real-time?",
    a: "The answer to the question will be written here",
  },
  {
    q: "How quick is your customer service response?",
    a: "The answer to the question will be written here",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.item}>
      <Pressable onPress={() => setOpen(!open)} style={styles.questionRow}>
        <Text style={styles.question}>{q}</Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={Colors.primary}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {open && <Text style={styles.answer}>{a}</Text>}
    </View>
  );
}

export default function AdminFaqsScreen() {
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
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Frequently asked questions for Admin.
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
