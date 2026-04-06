import { VendorTabBar } from "@/components/vendor/VendorTabBar";
import { Tabs } from "expo-router";
import React, { useCallback } from "react";

export default function VendorTabsLayout() {
  const renderTabBar = useCallback(
    (props: any) => <VendorTabBar {...props} />,
    [],
  );

  return (
    <Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="products" options={{ title: "Products" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
