import { Skeleton } from "@/components/ui/skeleton";
import { Colors } from "@/constants/theme";
import { useGetWalletBalanceQuery } from "@/lib/api/vendorApi";
import { useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

function StatCard({
  label,
  value,
  bg,
  textColor = "#111827",
}: {
  label: string;
  value: string;
  bg: string;
  textColor?: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text
        style={[
          styles.statLabel,
          { color: textColor === "#fff" ? "rgba(255,255,255,0.8)" : "#6B7280" },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function StatCardSkeleton() {
  return (
    <View style={[styles.statCard, { backgroundColor: "#F3F4F6" }]}>
      <Skeleton style={{ height: 12, width: "60%", marginBottom: 8 }} />
      <Skeleton style={{ height: 22, width: "80%" }} />
    </View>
  );
}

export default function VendorWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: walletData,
    isLoading,
    error,
    refetch,
  } = useGetWalletBalanceQuery();
  const stats = walletData?.data;

  const fmt = (n?: number) =>
    (n ?? 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>
          Manage your earnings and withdrawals
        </Text>
      </View>

      {/* Withdrawable Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Withdrawable Amount</Text>
        {isLoading ? (
          <Skeleton
            style={{
              height: 40,
              width: 200,
              marginVertical: 8,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
        ) : (
          <Text style={styles.balanceValue}>
            ₦{fmt(stats?.withdrawable_balance)}
          </Text>
        )}
      </View>

      {/* Withdraw Button — separate block below card per design */}
      <Pressable
        onPress={() => router.push("/vendor/wallet/withdraw")}
        style={styles.withdrawBtn}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
            stroke={Colors.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.withdrawBtnText}>Withdraw Earnings</Text>
      </Pressable>

      {/* Error State */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load wallet data.</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.overviewBg}>
          <View style={styles.statsGrid}>
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  label="Available Balance"
                  value={`₦${fmt(stats?.available_balance)}`}
                  bg="rgba(77,255,151,0.5)"
                />
                <StatCard
                  label="Total Earnings"
                  value={`₦${fmt(stats?.total_earnings)}`}
                  bg="rgba(3,4,130,0.5)"
                  textColor="#fff"
                />
                <StatCard
                  label="Pending Balance"
                  value={`₦${fmt(stats?.pending_balance)}`}
                  bg="rgba(255,212,59,0.3)"
                />
                <StatCard
                  label="This Month"
                  value={`₦${fmt(stats?.this_month_earnings)}`}
                  bg="rgba(151,71,255,0.5)"
                  textColor="#fff"
                />
                <StatCard
                  label="Total Withdrawals"
                  value={String(stats?.total_withdrawals ?? 0)}
                  bg="#fff"
                />
                <StatCard
                  label="Pending Orders"
                  value={String(stats?.pending_order_count ?? 0)}
                  bg="rgba(255,106,0,0.15)"
                />
              </>
            )}
          </View>
        </View>

        {!isLoading && (
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Credits"
              value={`₦${fmt(stats?.total_credits)}`}
              bg="rgba(99,102,241,0.15)"
            />
            <StatCard
              label="Total Debits"
              value={`₦${fmt(stats?.total_debits)}`}
              bg="rgba(255,77,77,0.15)"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingBottom: 40 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: Colors.dark, opacity: 0.7 },
  balanceCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 101,
    paddingHorizontal: 20,
    justifyContent: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  balanceValue: { fontSize: 32, fontWeight: "700", color: "#fff" },
  withdrawBtn: {
    marginHorizontal: 16,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  withdrawBtnText: { fontSize: 20, color: Colors.primary },
  section: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 12,
  },
  overviewBg: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    borderRadius: 12,
    height: 95,
    padding: 14,
    justifyContent: "flex-end",
  },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "600", color: "#111827" },
  errorBox: { padding: 16, alignItems: "center" },
  errorText: { color: "#DC2626", marginBottom: 8 },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});
