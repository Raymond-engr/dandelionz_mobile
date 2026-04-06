import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useAppSelector } from "@/lib/hooks";
import { Tabs, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";

export default function TabsLayout() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hasRedirected.current = false;
      return;
    }
    if (hasRedirected.current) return;

    if (user.role === "BUSINESS_ADMIN") {
      hasRedirected.current = true;
      router.replace("/(admin)/(tabs)");
    } else if (user.role === "VENDOR") {
      hasRedirected.current = true;
      router.replace("/vendor"); // was "/vendor/(tabs)" — inconsistent with login.tsx
    }
  }, [isAuthenticated, user?.role, user?.uuid]);

  const renderTabBar = useCallback(
    (props: any) => <BottomTabBar {...props} />,
    [],
  );

  return (
    <Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
