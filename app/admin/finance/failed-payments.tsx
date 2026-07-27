import { Colors } from "@/constants/theme";
import { useGetFailedPaymentsQuery } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_TABS = [
  { value: "", label: "Needs attention" },
  { value: "FAILED", label: "Failed" },
  { value: "IGNORED", label: "Unmatched" },
  { value: "PROCESSED", label: "Applied" },
];

const STATUS_COLOURS: Record<string, { bg: string; text: string }> = {
  FAILED: { bg: "bg-red-100", text: "text-red-700" },
  IGNORED: { bg: "bg-amber-100", text: "text-amber-700" },
  PROCESSED: { bg: "bg-green-100", text: "text-green-700" },
  DUPLICATE: { bg: "bg-gray-100", text: "text-gray-600" },
  RECEIVED: { bg: "bg-blue-100", text: "text-blue-700" },
};

/**
 * Paystack deliveries that produced no ledger entry.
 *
 * Its own screen rather than rows in the ledger: the ledger records what actually happened
 * to balances, so folding failures into it would make every finance total wrong.
 */
export default function AdminFailedPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState("");

  const { data, isLoading } = useGetFailedPaymentsQuery(
    status ? { status } : undefined
  );
  const events = data?.results ?? [];

  return (
    <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          Failed Payments
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        ListHeaderComponent={
          <View className="mb-3">
            <View className="bg-blue-50 rounded-xl p-3 flex-row items-start gap-2 mb-3">
              <MaterialIcons
                name="info-outline"
                size={16}
                color="#3B82F6"
                style={{ marginTop: 1 }}
              />
              <Text className="text-[12px] text-blue-700 flex-1">
                Paystack notifications that never became a ledger entry — the handler
                failed, or there was no matching order, deposit or payout. They moved no
                money, so they stay out of the ledger and its totals.
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STATUS_TABS.map((tab) => {
                const selected = status === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value || "default"}
                    onPress={() => setStatus(tab.value)}
                    className={`px-4 py-2 rounded-full border mr-2 ${
                      selected
                        ? "bg-system-blue-light border-system-blue-light"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        selected ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => {
          const colours = STATUS_COLOURS[item.status] ?? {
            bg: "bg-gray-100",
            text: "text-gray-600",
          };
          return (
            <View className="bg-white rounded-2xl p-4 mb-2 border border-gray-100">
              <View className="flex-row items-start justify-between mb-1">
                <View className="flex-1 pr-2">
                  <Text className="text-[14px] font-semibold text-gray-900">
                    {item.event_type}
                  </Text>
                  <Text className="text-[11px] text-gray-500 mt-0.5">
                    {item.reference || "no reference"}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded ${colours.bg}`}>
                  <Text className={`text-[10px] font-semibold ${colours.text}`}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {!!item.error_message && (
                <Text className="text-[12px] text-gray-700 bg-gray-50 rounded-lg p-2 mt-2">
                  {item.error_message}
                </Text>
              )}

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-[10px] text-gray-400">
                  {new Date(item.received_at).toLocaleString()}
                </Text>
                {!item.signature_valid && (
                  <Text className="text-[10px] font-semibold text-red-600">
                    Signature not verified
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View className="py-16 items-center">
              <MaterialIcons name="check-circle-outline" size={32} color="#10B981" />
              <Text className="text-[14px] text-gray-500 mt-3 text-center">
                Nothing here. Every Paystack notification has been applied.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
