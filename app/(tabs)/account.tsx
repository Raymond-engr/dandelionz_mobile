import { Colors } from "@/constants/theme";
import { useGetCustomerProfileQuery } from "@/lib/api/customerApi";
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

function AccountRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? "—"}</Text>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const { unreadCount } = useAppSelector((s) => s.notification);
  const logout = useLogout();

  const { data: profileResponse, isLoading } = useGetCustomerProfileQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const profile = profileResponse?.data ?? authUser;

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>You're not logged in</Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Login</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(auth)/register")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.fullName}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.role && (
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Information</Text>
        <AccountRow label="First Name" value={profile?.first_name} />
        <AccountRow label="Last Name" value={profile?.last_name} />
        <AccountRow label="Email" value={profile?.email} />
        <AccountRow label="Phone" value={profile?.phone_number} />
      </View>

      {/* Links */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Activity</Text>
        {[
          { label: "My Orders", route: "/(tabs)/orders" },
          { label: "My Wishlist", route: "/(tabs)/wishlist" },
          { label: "Contact Us", route: "/contact" },
          { label: "FAQs", route: "/faqs" },
          { label: "Terms & Conditions", route: "/terms" },
        ].map(({ label, route }) => (
          <Pressable
            key={label}
            onPress={() => router.push(route as any)}
            style={styles.linkRow}
          >
            <Text style={styles.linkLabel}>{label}</Text>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <Pressable onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 40 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#fff" },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  fullName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  email: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  rolePill: {
    marginTop: 8,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  rowLabel: { fontSize: 14, color: "#6B7280" },
  rowValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    maxWidth: "60%",
    textAlign: "right",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  linkLabel: { fontSize: 15, color: "#374151" },
  linkArrow: { fontSize: 20, color: "#9CA3AF" },
  logoutBtn: {
    margin: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#DC2626" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
    backgroundColor: "#F9FAFB",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 16, fontWeight: "600" },
});
