import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useAppSelector } from "@/lib/hooks";
import { router, Tabs } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";

/**
 * Customer tabs layout.
 *
 * KEY RULES:
 *  1. Use imperative `router`, NOT useRouter() hook.
 *  2. Never return null — always render <Tabs>.
 *  3. Wrap router.replace() in queueMicrotask.
 *  4. Customer role: do nothing (they belong here).
 */
export default function TabsLayout() {
  console.log("[Tabs] Rendering TabsLayout");
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hasRedirected.current = false;
      return; // No redirect — useLogout() already called router.replace
    }
    if (hasRedirected.current) return;

    if (user.role === "BUSINESS_ADMIN") {
      hasRedirected.current = true;
      setTimeout(() => router.replace("/(admin)/(tabs)"), 0);
    } else if (user.role === "VENDOR") {
      hasRedirected.current = true;
      setTimeout(() => router.replace("/vendor"), 0);
    }
    // CUSTOMER: belongs here, do nothing.
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
