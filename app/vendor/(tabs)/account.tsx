import { Colors } from "@/constants/theme";
import { useGetVendorProfileQuery } from "@/lib/api/vendorApi";
import { useAppSelector, useLogout } from "@/lib/hooks";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

function ChevronRight() {
  return (
    <Svg width={8} height={14} viewBox="0 0 8 14" fill="none">
      <Path
        d="M1 1l6 6-6 6"
        stroke="#9CA3AF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MenuRow({
  label,
  onPress,
  danger = false,
  showChevron = true,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {showChevron && !danger && <ChevronRight />}
    </Pressable>
  );
}

export default function VendorAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const logout = useLogout();

  const { data: profileData, isLoading } = useGetVendorProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const user = {
    name: profileData?.data?.user?.full_name ?? "",
    email: profileData?.data?.user?.email ?? "",
    avatar: profileData?.data?.user?.profile_picture ?? null,
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "V";

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.headerCentered}>
        <Text style={styles.titleCentered}>Account</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Account Links */}
      <MenuRow label="My Profile" onPress={() => router.push("/vendor/account/profile")} />
      <MenuRow label="Notification" onPress={() => router.push("/vendor/account/notifications")} />
      <MenuRow label="Payment Settings" onPress={() => router.push("/vendor/account/payment-settings")} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Danger Zone */}
      <MenuRow label="Logout" onPress={logout} danger showChevron={false} />
      <MenuRow label="Close Account" onPress={() => router.push("/vendor/account/delete")} danger />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Other Links */}
      <MenuRow label="FAQs" onPress={() => router.push("/vendor/account/faqs")} />
      <MenuRow label="Terms and Conditions" onPress={() => router.push("/vendor/account/terms")} />
      <MenuRow label="Contact Us" onPress={() => router.push("/contact")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCentered: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  titleCentered: { fontSize: 18, fontWeight: "600", color: "#111827" },
  header: { paddingVertical: 16, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "600", color: Colors.dark },
  divider: { height: 11, backgroundColor: "#F5F7FA", width: "100%" },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 21,
    paddingVertical: 20,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "600", color: "#fff" },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "600", color: Colors.dark, marginBottom: 2 },
  userEmail: { fontSize: 14, color: "#6B7280" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 21,
    paddingVertical: 16,
  },
  menuLabel: { fontSize: 16, color: Colors.dark },
  menuLabelDanger: { color: Colors.red },
});