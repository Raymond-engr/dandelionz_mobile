import React from "react";
import { Tabs } from "expo-router";
import { VendorTabBar } from "@/components/vendor/VendorTabBar";

export default function VendorTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <VendorTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="products" options={{ title: "Products" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
