import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAQS = [
  {
    question: "How do I list a product on Dandelionz?",
    answer:
      "Go to Products → tap the + button → fill in your product details (name, description, images, price, and stock) → publish directly to your store or save as a draft.",
  },
  {
    question: "When will I receive payment for an order?",
    answer:
      "Payments are processed after an order is marked as delivered. Once cleared, funds appear in your withdrawable balance within 24–48 hours.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "Go to Wallet → tap 'Withdraw Earnings' → enter the amount → confirm with your 4-digit payment PIN. Withdrawals are transferred to your registered bank account.",
  },
  {
    question: "How do I set or change my payment PIN?",
    answer:
      "Go to Account → Payment Settings → Set/Change Payment PIN. You'll receive an OTP to verify before setting a new PIN.",
  },
  {
    question: "What are the fees charged on sales?",
    answer:
      "Dandelionz charges a small platform fee per successful transaction. The exact percentage is shown in your vendor agreement and payment settings.",
  },
  {
    question: "Can I edit a product after it's been published?",
    answer:
      "Yes. Go to Products → tap any product → select Edit. You can update name, images, price, and stock at any time.",
  },
  {
    question: "What happens when I save a product as a draft?",
    answer:
      "Drafts are visible only to you and not shown to buyers. You can submit a draft to your store whenever you're ready from the Products tab.",
  },
  {
    question: "How do I handle a return or refund?",
    answer:
      "Contact our support team via the 'Contact Us' option in Account. Our team will guide you through the return and refund process.",
  },
  {
    question: "Why is my withdrawal showing as 'Pending'?",
    answer:
      "Withdrawals may take 1–3 business days depending on your bank. If it stays pending for longer, please contact support.",
  },
  {
    question: "How do I close my vendor account?",
    answer:
      "Go to Account → Close Account. Note that closing your account is permanent and will remove all your listings and earnings history.",
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

export default function VendorFaqsScreen() {
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
          Frequently asked questions about selling on Dandelionz.
        </Text>

        {FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </ScrollView>
    </View>
  );
}
