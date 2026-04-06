import React, { useCallback } from "react";
import { Tabs } from "expo-router";
import { AdminTabBar } from "@/components/admin-tab-bar";

export default function AdminTabsLayout() {

  const renderTabBar = useCallback(
    (props: any) => <AdminTabBar {...props} />,
    []
  );

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="vendor" />
      <Tabs.Screen name="product" />
      <Tabs.Screen name="users" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}