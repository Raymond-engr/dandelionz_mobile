import { useAppSelector } from "@/lib/hooks";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AdminLayout() {
  const { user } = useAppSelector((state) => state.auth);

  // Hydration is handled in the root layout, so we only check user here
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== "BUSINESS_ADMIN") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />

      {/* Sub-screens in the admin stack */}
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
        name="account/faqs"
        options={{ headerShown: false, title: "FAQs" }}
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
        name="users/[id]"
        options={{ headerShown: false, title: "User Details" }}
      />
    </Stack>
  );
}
