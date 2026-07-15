import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAQS = [
  {
    question: "How do I approve a new vendor application?",
    answer:
      "Go to the Vendor tab, select 'Pending' applications, review the vendor's documents, and tap 'Approve' or 'Reject'. Once approved, the vendor will receive a notification.",
  },
  {
    question: "How are payouts to vendors processed?",
    answer:
      "Payouts are managed in the Settlements section. After an order is marked as delivered and the clearance period passes, funds move to the vendor's withdrawable balance.",
  },
  {
    question: "How do I resolve a customer dispute?",
    answer:
      "Navigate to Settlements → Disputes. Review the evidence provided by both the customer and the vendor, then select the appropriate resolution (Refund or Release Funds).",
  },
  {
    question: "Can I flag or remove a product listing?",
    answer:
      "Yes. In the Inventory tab, you can search for any product. You can 'Flag' a product to hide it from the shop for review or delete it if it violates platform policies.",
  },
  {
    question: "How do I manage administrative withdrawals?",
    answer:
      "Go to Account → Withdraw Earnings. Here you can withdraw the platform's commission and service fees to the registered corporate bank account.",
  },
  {
    question: "How do I update platform-wide payment settings?",
    answer:
      "Go to Account → Payment Settings. This section allows you to configure bank details for collections and manage the administrative transaction PIN.",
  },
  {
    question: "How do I track system-wide analytics?",
    answer:
      "The Dashboard provides a summary of total sales, active vendors, and pending orders. For detailed reports, use the Analytics tab to filter by date or category.",
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

export default function AdminFaqsScreen() {
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
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[14px] text-gray-500 mb-6 leading-[20px]">
          Frequently asked questions for Dandelionz Administration.
        </Text>

        {FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </ScrollView>
    </View>
  );
}
