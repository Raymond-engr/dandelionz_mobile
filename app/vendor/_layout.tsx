import { useAppSelector } from "@/lib/hooks";
import { Stack, router } from "expo-router";
import React, { useEffect, useRef } from "react";

/**
 * Vendor stack layout.
 *
 * Uses the same queueMicrotask pattern as admin/_layout.tsx to prevent
 * "Couldn't find a navigation context" during mount-time redirects.
 */
export default function VendorLayout() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hasRedirected.current = false;
      queueMicrotask(() => router.replace("/(auth)/login"));
      return;
    }
    if (hasRedirected.current) return;
    if (user.role !== "VENDOR") {
      hasRedirected.current = true;
      queueMicrotask(() => router.replace("/(tabs)"));
    }
  }, [isAuthenticated, user?.role, user?.uuid]);

  if (!isAuthenticated || !user || user.role !== "VENDOR") {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="order/[id]"
        options={{ headerShown: false, title: "Order Details" }}
      />
      <Stack.Screen
        name="product/new"
        options={{ headerShown: false, title: "New Product" }}
      />
      <Stack.Screen
        name="product/[id]/edit"
        options={{ headerShown: false, title: "Edit Product" }}
      />
      <Stack.Screen
        name="wallet/history"
        options={{ headerShown: false, title: "Transaction History" }}
      />
      <Stack.Screen
        name="account/profile"
        options={{ headerShown: false, title: "My Profile" }}
      />
      <Stack.Screen
        name="account/payment-settings"
        options={{ headerShown: false, title: "Payment Settings" }}
      />
      <Stack.Screen
        name="account/payment-settings/change-pin"
        options={{ headerShown: false, title: "Change Payment PIN" }}
      />
      <Stack.Screen
        name="account/payment-settings/store-payment"
        options={{ headerShown: false, title: "Bank Details" }}
      />
      <Stack.Screen
        name="account/notifications"
        options={{ headerShown: false, title: "Notifications" }}
      />
      <Stack.Screen
        name="account/change-password"
        options={{ headerShown: false, title: "Change Password" }}
      />
      <Stack.Screen
        name="account/delete"
        options={{ headerShown: false, title: "Close Account" }}
      />
      <Stack.Screen
        name="account/vendor-faqs"
        options={{ headerShown: false, title: "FAQs" }}
      />
      <Stack.Screen
        name="account/vendor-terms"
        options={{ headerShown: false, title: "Terms & Conditions" }}
      />
      <Stack.Screen name="wallet/withdraw" options={{ headerShown: false }} />
      <Stack.Screen
        name="wallet/confirm-pin"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="wallet/success" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/receipt" options={{ headerShown: false }} />
    </Stack>
  );
}
