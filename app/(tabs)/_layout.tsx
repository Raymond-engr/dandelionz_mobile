import React, { useEffect } from "react";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useAppSelector } from "@/lib/hooks";
import { Tabs, useRouter, useSegments } from "expo-router";

export default function TabsLayout() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Only redirect if we are currently in the (tabs) segment
      const inTabs = segments[0] === "(tabs)";
      
      if (user.role === "BUSINESS_ADMIN" && inTabs) {
        router.replace("/(admin)/(tabs)");
      } else if (user.role === "VENDOR" && inTabs) {
        router.replace("/vendor/(tabs)");
      }
    }
  }, [isAuthenticated, user?.role, segments]);

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
