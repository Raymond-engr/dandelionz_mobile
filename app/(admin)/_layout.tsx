import { useAppSelector } from "@/lib/hooks";
import { Stack, router } from "expo-router";
import React, { useEffect, useRef } from "react";

/**
 * Admin stack layout.
 *
 * FIX: Wrap all `router.replace` calls in `queueMicrotask` so navigation
 * dispatches happen after the current render frame is committed.
 * Calling router synchronously inside a useEffect that fires during mount
 * can produce "Couldn't find a navigation context" when the component tree
 * is still being set up — this is the root cause of the error seen when
 * switching Monthly/Weekly tabs on the admin dashboard.
 */
export default function AdminLayout() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hasRedirected.current = false;
      queueMicrotask(() => router.replace("/(auth)/login"));
      return;
    }
    if (hasRedirected.current) return;
    if (user.role !== "BUSINESS_ADMIN") {
      hasRedirected.current = true;
      queueMicrotask(() => router.replace("/(tabs)"));
    }
  }, [isAuthenticated, user?.role, user?.uuid]);

  // Don't render the stack until auth is confirmed to avoid flashing protected screens.
  if (!isAuthenticated || !user || user.role !== "BUSINESS_ADMIN") {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="analytics"
        options={{ headerShown: false, title: "Analytics" }}
      />
      <Stack.Screen
        name="settlements"
        options={{ headerShown: false, title: "Settlements" }}
      />
      <Stack.Screen
        name="settlements/summary"
        options={{ headerShown: false, title: "Settlement Summary" }}
      />
      <Stack.Screen
        name="withdrawals"
        options={{ headerShown: false, title: "Withdrawal Management" }}
      />
      <Stack.Screen
        name="withdrawals/[id]"
        options={{ headerShown: false, title: "Withdrawal Details" }}
      />
      <Stack.Screen
        name="withdraw-earnings"
        options={{ headerShown: false, title: "Withdraw Earnings" }}
      />
      <Stack.Screen
        name="payment-settings"
        options={{ headerShown: false, title: "Payment Settings" }}
      />
      <Stack.Screen
        name="payment-settings/pin"
        options={{ headerShown: false, title: "Security PIN" }}
      />
      <Stack.Screen
        name="payment-settings/bank"
        options={{ headerShown: false, title: "Bank Details" }}
      />
      <Stack.Screen
        name="payment-settings/forgot-pin"
        options={{ headerShown: false, title: "Forgot PIN" }}
      />
      <Stack.Screen
        name="account/profile"
        options={{ headerShown: false, title: "My Profile" }}
      />
      <Stack.Screen
        name="account/notifications/index"
        options={{ headerShown: false, title: "Notifications" }}
      />
      <Stack.Screen
        name="account/notifications/create"
        options={{ headerShown: false, title: "Create Notification" }}
      />
      <Stack.Screen
        name="account/admin-faqs"
        options={{ headerShown: false, title: "FAQs" }}
      />
      <Stack.Screen
        name="account/change-password"
        options={{ headerShown: false, title: "Change Password" }}
      />
      <Stack.Screen
        name="orders/[id]"
        options={{ headerShown: false, title: "Order Details" }}
      />
      <Stack.Screen
        name="vendor/[id]"
        options={{ headerShown: false, title: "Vendor Details" }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: false, title: "Product Details" }}
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
        name="product/category/[id]/edit"
        options={{ headerShown: false, title: "Category" }}
      />
      <Stack.Screen
        name="users/[id]"
        options={{ headerShown: false, title: "User Details" }}
      />
    </Stack>
  );
}
