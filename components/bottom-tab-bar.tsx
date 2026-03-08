import { Colors } from "@/constants/theme";
import { useAppSelector } from "@/lib/hooks";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
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

const TABS = [
  { name: "index", label: "Shop", Icon: ShopIcon },
  { name: "cart", label: "Cart", Icon: CartIcon },
  { name: "orders", label: "Order", Icon: OrderIcon },
  { name: "wishlist", label: "Wishlist", Icon: WishlistIcon },
  { name: "account", label: "Account", Icon: AccountIcon },
] as const;

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useAppSelector((s) => s.notification);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[index];
        if (!tab) return null;
        const isFocused = state.index === index;
        const color = isFocused ? Colors.white : Colors.dark;
        const isAccount = tab.name === "account";

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.tab, isFocused && styles.activeTab]}
          >
            <View style={styles.iconContainer}>
              <tab.Icon active={isFocused} color={color} size={24} />
              {isAccount && unreadCount > 0 && <View style={styles.badge} />}
            </View>
            {isFocused && <Text style={styles.activeLabel}>{tab.label}</Text>}
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
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingHorizontal: 12,
    gap: 6,
    margin: 4,
  },
  activeLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  iconContainer: {
    position: "relative",
  },
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
