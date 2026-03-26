import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    AccountIcon,
    AdminHomeIcon,
    OrdersIcon,
    ProductIcon,
    UsersIcon,
    VendorIcon,
} from "./icons";

const ACTIVE_COLOR = "#030482";
const INACTIVE_COLOR = "#9ca3af"; // gray-400

type Tab = {
  name: string;
  label: string;
  Icon: React.ComponentType<{ active: boolean; color: string; size?: number }>;
};

const TABS: Tab[] = [
  {
    name: "index",
    label: "Home",
    Icon: AdminHomeIcon,
  },
  {
    name: "vendor",
    label: "Vendor",
    Icon: VendorIcon,
  },
  {
    name: "product",
    label: "Product",
    Icon: ProductIcon,
  },
  {
    name: "users",
    label: "Users",
    Icon: UsersIcon,
  },
  {
    name: "orders",
    label: "Orders",
    Icon: OrdersIcon,
  },
  {
    name: "account",
    label: "Account",
    Icon: AccountIcon,
  },
];

export function AdminTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  function isActive(tab: Tab) {
    if (tab.name === "index") {
      return pathname === "/(admin)/(tabs)" || pathname === "/(admin)/(tabs)/";
    }
    return pathname.includes(`/(admin)/(tabs)/${tab.name}`);
  }

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
      ]}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(`/(admin)/(tabs)/${tab.name === 'index' ? '' : tab.name}` as any)}
            activeOpacity={0.7}
          >
            <tab.Icon active={active} color={color} size={22} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
});
