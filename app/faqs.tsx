import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
    <View className="mb-4 overflow-hidden border border-gray-200 rounded-xl">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between p-4 bg-white"
      >
        <Text className="flex-1 text-[15px] font-semibold text-gray-900 leading-[22px]">
          {question}
        </Text>
        <Feather
          name="chevron-down"
          size={20}
          color={Colors.primary}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {open && (
        <View className="px-4 pb-4 pt-0">
          <Text className="text-[14px] text-gray-500 leading-[22px]">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function FAQsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Pressable onPress={() => router.back()} className="w-10">
          <Feather name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
          FAQs
        </Text>
        <View className="w-10" />
      </View>

      <Divider />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[14px] text-gray-500 mb-6 leading-[20px]">
          Find answers to common questions about using Dandelionz.
        </Text>

        {FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </ScrollView>
    </View>
  );
}
