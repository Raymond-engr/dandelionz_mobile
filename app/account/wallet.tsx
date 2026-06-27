import { LoadingSpinner } from "@/components/loading-spinner";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
    CustomerWalletTransaction,
    useGetCustomerWalletQuery,
    useGetCustomerWalletTransactionsQuery,
} from "@/lib/api/customerApi";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomerWalletScreen() {
  const insets = useSafeAreaInsets();
  const [txnFilter, setTxnFilter] = useState<"credit" | "debit" | undefined>(
    undefined,
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: walletData,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useGetCustomerWalletQuery();
  const {
    data: txnData,
    isLoading: txnLoading,
    refetch: refetchTxns,
  } = useGetCustomerWalletTransactionsQuery({ type: txnFilter, limit: 30 });

  const wallet = walletData?.data;
  const txns = txnData?.results || [];
  const balance = wallet?.balance ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWallet(), refetchTxns()]);
    setRefreshing(false);
  };

  const renderTxn = ({ item }: { item: CustomerWalletTransaction }) => {
    const isCredit = item.transaction_type === "CREDIT";
    return (
      <View className="flex-row items-center justify-between py-4 px-[21px]">
        <View className="flex-row items-center gap-3 flex-1">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isCredit ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <MaterialIcons
              name={isCredit ? "arrow-downward" : "arrow-upward"}
              size={20}
              color={isCredit ? "#059669" : "#DC2626"}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[14px] font-semibold text-system-blue-dark"
              numberOfLines={1}
            >
              {item.source || (isCredit ? "Credit" : "Debit")}
            </Text>
            <Text className="text-[12px] text-gray-400 mt-0.5">
              {new Date(item.created_at).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
        <Text
          className={`text-[15px] font-bold ${
            isCredit ? "text-green-600" : "text-red-500"
          }`}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          My Wallet
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={txns}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTxn}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Balance card */}
            <View className="mx-[21px] mt-5 mb-4 bg-system-blue-dark rounded-2xl p-6">
              <Text className="text-white/60 text-[13px] font-medium mb-1">
                Available Balance
              </Text>
              {walletLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-[36px] font-bold">
                  {formatCurrency(balance)}
                </Text>
              )}

              {/* Stats row */}
              {wallet && (
                <View className="flex-row mt-4 gap-4">
                  <View className="flex-1 bg-white/10 rounded-xl p-3">
                    <Text className="text-white/60 text-[11px]">Total In</Text>
                    <Text className="text-white text-[14px] font-bold mt-1">
                      {formatCurrency(wallet.total_credits)}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/10 rounded-xl p-3">
                    <Text className="text-white/60 text-[11px]">Total Out</Text>
                    <Text className="text-white text-[14px] font-bold mt-1">
                      {formatCurrency(wallet.total_debits)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Withdraw button */}
              <TouchableOpacity
                onPress={() => router.push("/account/wallet/withdraw" as any)}
                disabled={balance <= 0}
                className={`mt-5 py-3 rounded-xl items-center ${
                  balance > 0 ? "bg-white" : "bg-white/30"
                }`}
              >
                <Text
                  className={`text-[15px] font-bold ${
                    balance > 0 ? "text-system-blue-dark" : "text-white/50"
                  }`}
                >
                  Withdraw to Bank
                </Text>
              </TouchableOpacity>
            </View>

            {/* Refund info hint — shown when balance > 0 */}
            {balance > 0 && (
              <View className="mx-[21px] mb-4 bg-blue-50 rounded-xl p-3 flex-row items-start gap-2">
                <MaterialIcons
                  name="info-outline"
                  size={16}
                  color="#3B82F6"
                  style={{ marginTop: 1 }}
                />
                <Text className="text-[12px] text-blue-700 flex-1">
                  Refunds from cancelled orders are credited here. Withdraw to
                  your bank anytime.
                </Text>
              </View>
            )}

            {/* Transaction filter tabs */}
            <View className="flex-row px-[21px] gap-2 mb-3">
              {([undefined, "credit", "debit"] as const).map((f) => (
                <TouchableOpacity
                  key={f ?? "all"}
                  onPress={() => setTxnFilter(f)}
                  className={`px-4 py-1.5 rounded-full border ${
                    txnFilter === f
                      ? "bg-system-blue-light border-system-blue-light"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold capitalize ${
                      txnFilter === f ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {f ?? "All"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-white rounded-t-2xl mx-[21px] overflow-hidden">
              <Text className="px-[21px] pt-4 pb-2 text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                Transactions
              </Text>
              <Divider />
            </View>
          </>
        )}
        ListFooterComponent={() => <View className="h-10" />}
        ItemSeparatorComponent={() => <Divider className="mx-[21px]" />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() =>
          txnLoading ? (
            <View className="py-8 items-center">
              <LoadingSpinner />
            </View>
          ) : (
            <View className="py-10 items-center px-[21px]">
              <MaterialIcons
                name="account-balance-wallet"
                size={48}
                color="#D1D5DB"
              />
              <Text className="text-[16px] font-bold text-system-blue-dark mt-3">
                No transactions yet
              </Text>
              <Text className="text-[13px] text-gray-400 text-center mt-1">
                Refunds from cancelled orders will appear here.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
