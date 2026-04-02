import { Colors } from "@/constants/theme";
import { useAppSelector } from "@/lib/hooks";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    AccountIcon,
    OrderIcon,
    ShopIcon,
    VendorHomeIcon,
    WalletIcon,
} from "../icons";

type TabConfig = {
  name: string;
  label: string;
  Icon: React.ComponentType<{ active: boolean; color: string; size?: number }>;
};

const TAB_CONFIGS: Record<string, TabConfig> = {
  index: { label: "Home", Icon: VendorHomeIcon, name: "index" },
  products: { label: "Product", Icon: ShopIcon, name: "products" },
  orders: { label: "Order", Icon: OrderIcon, name: "orders" },
  wallet: { label: "Wallet", Icon: WalletIcon, name: "wallet" },
  account: { label: "Account", Icon: AccountIcon, name: "account" },
};

export function VendorTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useAppSelector((s) => s.notification);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIGS[route.name];
        if (!config) return null;

        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? Colors.white : Colors.dark_main;
        const isAccount = config.name === "account";

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

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tab, isFocused && styles.activeTab]}
          >
            <View style={styles.iconContainer}>
              <config.Icon active={isFocused} color={color} size={22} />
              {isAccount && unreadCount > 0 && <View style={styles.badge} />}
            </View>
            {isFocused && (
              <Text style={styles.activeLabel} numberOfLines={1}>
                {config.label}
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 40,
  },
  activeTab: {
    flex: 2.5,
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
