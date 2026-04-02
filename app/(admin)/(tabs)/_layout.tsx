import React from "react";
import { Tabs } from "expo-router";
import { AdminTabBar } from "@/components/admin-tab-bar";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AdminTabBar {...props} />}
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