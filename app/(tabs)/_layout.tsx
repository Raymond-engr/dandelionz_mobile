import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useAppSelector } from "@/lib/hooks";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function TabsLayout() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === "BUSINESS_ADMIN") {
      router.replace("/(admin)/(tabs)");
    } else if (user.role === "VENDOR") {
      router.replace("/vendor/(tabs)");
    }
  }, [isAuthenticated, user?.role, user?.uuid]);

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
