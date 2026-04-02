import { useAppSelector } from "@/lib/hooks";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function VendorLayout() {
  const { user } = useAppSelector((state) => state.auth);

  // Hydration is handled in the root layout, so we only check user here
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== "VENDOR") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      {/* Sub-screens in the vendor stack */}
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
        name="account/faqs"
        options={{ headerShown: false, title: "FAQs" }}
      />
      <Stack.Screen
        name="account/terms"
        options={{ headerShown: false, title: "Terms & Conditions" }}
      />
      <Stack.Screen name="wallet/withdraw" options={{ headerShown: false }} />
      <Stack.Screen
        name="wallet/confirm-pin"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="wallet/success" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/receipt" options={{ headerShown: false }} />
      <Stack.Screen
        name="account/payment-settings/store-payment"
        options={{ headerShown: false, title: "Bank Details" }}
      />
    </Stack>
  );
}
