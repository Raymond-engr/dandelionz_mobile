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

type TabDef = {
  name: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{ active: boolean; color: string; size?: number }>;
};

const TABS: TabDef[] = [
  { name: "index", label: "Shop", href: "/(tabs)", Icon: ShopIcon },
  { name: "cart", label: "Cart", href: "/(tabs)/cart", Icon: CartIcon },
  { name: "orders", label: "Order", href: "/(tabs)/orders", Icon: OrderIcon },
  {
    name: "wishlist",
    label: "Wishlist",
    href: "/(tabs)/wishlist",
    Icon: WishlistIcon,
  },
  {
    name: "account",
    label: "Account",
    href: "/(tabs)/account",
    Icon: AccountIcon,
  },
];

interface Props {
  activeTab?: string;
}

export function StandaloneBottomBar({ activeTab = "index" }: Props) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useAppSelector((s) => s.notification);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const isFocused = tab.name === activeTab;
        const color = isFocused ? Colors.white : Colors.dark_main;
        const isAccount = tab.name === "account";

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // If already active (shop/index), do nothing — we're already here.
          // For other tabs, push into the (tabs) group so the real BottomTabBar
          // takes over from that point, and back() returns to this screen.
          if (!isFocused) {
            router.push(tab.href as any);
          }
        };

        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
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
