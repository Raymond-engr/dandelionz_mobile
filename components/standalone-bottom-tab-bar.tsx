import { Colors } from "@/constants/theme";
import { useAppSelector } from "@/lib/hooks";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    AccountIcon,
    CartIcon,
    OrderIcon,
    ShopIcon,
    WishlistIcon,
} from "./icons";

// Used only by app/index.tsx, which re-exports ShopScreen but lives outside
// the (tabs) navigator — so the navigator's BottomTabBar never mounts there.
// This mirrors BottomTabBar visually/functionally using the imperative router.

const TABS = [
  { name: "index", label: "Shop", Icon: ShopIcon, route: null },
  { name: "cart", label: "Cart", Icon: CartIcon, route: "/(tabs)/cart" },
  { name: "orders", label: "Order", Icon: OrderIcon, route: "/(tabs)/orders" },
  {
    name: "wishlist",
    label: "Wishlist",
    Icon: WishlistIcon,
    route: "/(tabs)/wishlist",
  },
  {
    name: "account",
    label: "Account",
    Icon: AccountIcon,
    route: "/(tabs)/account",
  },
] as const;

export function StandaloneBottomTabBar() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useAppSelector((s) => s.notification);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const isFocused = tab.name === "index"; // always active here
        const color = isFocused ? Colors.white : Colors.dark_main;
        const isAccount = tab.name === "account";

        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              if (!tab.route) return; // already on shop
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(tab.route as any);
            }}
            style={[styles.tab, isFocused && styles.activeTab]}
          >
            <View style={styles.iconContainer}>
              <tab.Icon active={isFocused} color={color} size={24} />
              {isAccount && unreadCount > 0 && <View style={styles.badge} />}
            </View>
            {isFocused && (
              <Text style={styles.activeLabel} numberOfLines={1}>
                {tab.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 64,
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 40,
  },
  activeTab: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingHorizontal: 12,
    gap: 6,
    marginHorizontal: 4,
  },
  activeLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  iconContainer: { position: "relative" },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});
