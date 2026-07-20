import { Colors } from "@/constants/theme";
import {
    useGetLedgerQuery,
    useGetLedgerSummaryQuery,
    type LedgerFilters,
} from "@/lib/api/adminApi";
import { activeFilterCount, bucketLabel, isMoneyIn, signedAmountLabel } from "@/lib/ledger";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DIRECTIONS = [
  { value: "", label: "All" },
  { value: "CREDIT", label: "Money in" },
  { value: "DEBIT", label: "Money out" },
];

const TYPES = [
  { value: "", label: "All types" },
  { value: "DEPOSIT", label: "Deposits" },
  { value: "ORDER_PAYMENT", label: "Order payments" },
  { value: "ORDER_REFUND", label: "Refunds" },
  { value: "VENDOR_EARNING", label: "Vendor earnings" },
  { value: "COMMISSION", label: "Commission" },
  { value: "WITHDRAWAL", label: "Withdrawals" },
];

/**
 * The finance ledger on mobile: read and review.
 *
 * Deliberately not the web page in miniature. Export lives only on web - downloading a
 * spreadsheet onto a phone is not a workflow anyone wants - and the filters here are the
 * two an operator actually reaches for away from a desk. The screen is read-only, as the
 * ledger is append-only and has no edit endpoint anywhere.
 */
export default function AdminLedgerScreen() {
  const insets = useSafeAreaInsets();

  const [filters, setFilters] = useState<LedgerFilters>({});
  const [searchDraft, setSearchDraft] = useState("");
  const [page, setPage] = useState(1);

  const query = useMemo(() => ({ ...filters, page }), [filters, page]);
  const { data, isLoading, isFetching } = useGetLedgerQuery(query);
  const { data: summaryResponse } = useGetLedgerSummaryQuery(filters);

  const entries = data?.results ?? [];
  const summary = summaryResponse?.data;
  const filterCount = activeFilterCount(filters);

  const updateFilter = (key: keyof LedgerFilters, value: string) => {
    // Any filter change invalidates the current page: staying on page 7 of a narrower
    // result set shows an empty list and reads as "no results".
    setPage(1);
    setFilters((current) => {
      const next = { ...current };
      if (value.trim() === "") {
        delete next[key];
      } else {
        next[key] = value as never;
      }
      return next;
    });
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          Finance Ledger
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        ListHeaderComponent={
          <View className="mb-4">
            {/* Totals for the current filters */}
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
              <View className="flex-row justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-[11px] text-gray-500">Money in</Text>
                  <Text className="text-[16px] font-bold text-green-600 mt-0.5">
                    {summary ? formatCurrency(Number(summary.total_credits)) : "—"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-gray-500">Money out</Text>
                  <Text className="text-[16px] font-bold text-red-600 mt-0.5">
                    {summary ? formatCurrency(Number(summary.total_debits)) : "—"}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-gray-100">
                <View>
                  <Text className="text-[11px] text-gray-500">Net</Text>
                  <Text className="text-[16px] font-bold text-system-blue-dark mt-0.5">
                    {summary ? formatCurrency(Number(summary.net)) : "—"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[11px] text-gray-500">Entries</Text>
                  <Text className="text-[16px] font-bold text-gray-900 mt-0.5">
                    {summary ? summary.count.toLocaleString() : "—"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Search */}
            <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-3 mb-3">
              <MaterialIcons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchDraft}
                onChangeText={setSearchDraft}
                onSubmitEditing={() => updateFilter("search", searchDraft)}
                returnKeyType="search"
                placeholder="Reference, description or user"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-[14px] text-gray-900 py-3 px-2"
              />
              {filterCount > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setFilters({});
                    setSearchDraft("");
                    setPage(1);
                  }}
                >
                  <Text className="text-[12px] font-semibold text-system-blue-light">
                    Clear ({filterCount})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Direction */}
            <View className="flex-row gap-2 mb-2">
              {DIRECTIONS.map((d) => {
                const selected = (filters.direction ?? "") === d.value;
                return (
                  <TouchableOpacity
                    key={d.value || "all"}
                    onPress={() => updateFilter("direction", d.value)}
                    className={`px-4 py-2 rounded-full border ${
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
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Type */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TYPES}
              keyExtractor={(t) => t.value || "all"}
              renderItem={({ item }) => {
                const selected = (filters.entry_type ?? "") === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => updateFilter("entry_type", item.value)}
                    className={`px-3 py-1.5 rounded-full border mr-2 ${
                      selected
                        ? "bg-system-blue-dark border-system-blue-dark"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-[12px] ${
                        selected ? "text-white font-semibold" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() => router.push("/admin/finance/failed-payments" as any)}
              className="bg-white rounded-2xl p-3 mt-3 border border-gray-100 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-2">
                <Text className="text-[14px] font-semibold text-gray-900">
                  Failed &amp; unapplied payments
                </Text>
                <Text className="text-[11px] text-gray-500 mt-0.5">
                  Not in the ledger — they moved no money
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-2 border border-gray-100">
            <View className="flex-row items-start justify-between mb-1">
              <View className="flex-1 pr-3">
                <Text className="text-[14px] font-semibold text-gray-900">
                  {item.entry_type_display}
                </Text>
                <Text className="text-[12px] text-gray-500 mt-0.5">
                  {item.user_name || item.user_email}
                </Text>
              </View>
              <Text
                className={`text-[15px] font-bold ${
                  isMoneyIn(item.direction) ? "text-green-600" : "text-red-600"
                }`}
              >
                {signedAmountLabel(item.amount, item.direction)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-2 py-0.5 rounded ${
                    item.bucket === "SPENDABLE" ? "bg-amber-100" : "bg-blue-100"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-semibold ${
                      item.bucket === "SPENDABLE" ? "text-amber-700" : "text-blue-700"
                    }`}
                  >
                    {bucketLabel(item.bucket)}
                  </Text>
                </View>
                {!!item.reference && (
                  <Text className="text-[10px] text-gray-400">{item.reference}</Text>
                )}
              </View>
              <Text className="text-[10px] text-gray-400">
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View className="py-16 items-center">
              <MaterialIcons name="receipt-long" size={32} color="#9CA3AF" />
              <Text className="text-[14px] text-gray-500 mt-3">
                No ledger entries match these filters.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          entries.length > 0 ? (
            <View className="flex-row justify-between items-center py-4">
              <TouchableOpacity
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data?.previous || isFetching}
                className={`px-4 py-2 rounded-xl border ${
                  data?.previous ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    data?.previous ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <Text className="text-[11px] text-gray-500">
                {entries.length} of {data?.count?.toLocaleString() ?? 0}
              </Text>

              <TouchableOpacity
                onPress={() => setPage((p) => p + 1)}
                disabled={!data?.next || isFetching}
                className={`px-4 py-2 rounded-xl border ${
                  data?.next ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    data?.next ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}
