import { Colors } from "@/constants/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    AccountIcon,
    AdminHomeIcon,
    OrderIcon,
    ProductIcon,
    UsersIcon,
    VendorIcon,
} from "./icons";

type TabConfig = {
  name: string;
  label: string;
  Icon: React.ComponentType<{ active: boolean; color: string; size?: number }>;
};

const TAB_CONFIGS: Record<string, TabConfig> = {
  index: { label: "Home", Icon: AdminHomeIcon, name: "index" },
  vendor: { label: "Vendor", Icon: VendorIcon, name: "vendor" },
  product: { label: "Product", Icon: ProductIcon, name: "product" },
  users: { label: "Users", Icon: UsersIcon, name: "users" },
  orders: { label: "Order", Icon: OrderIcon, name: "orders" },
  account: { label: "Account", Icon: AccountIcon, name: "account" },
};

export function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = TAB_CONFIGS[route.name]?.label || route.name;
        const Icon = TAB_CONFIGS[route.name]?.Icon || AdminHomeIcon;

        const isFocused = state.index === index;

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

        const color = isFocused ? Colors.white : Colors.dark_main;

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
              <Icon active={isFocused} color={color} size={22} />
            </View>
            {isFocused && (
              <Text style={styles.activeLabel} numberOfLines={1}>
                {label}
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
    minHeight: 64,
    paddingTop: 8,
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
    flex: 2.5, // Even more space for the label
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
});
