import { Stack } from "expo-router";
import React from "react";

// Keep this layout SIMPLE — no useAppSelector, no useEffect, no redirect logic.
// The login screen itself handles all post-login navigation.
// Adding selector hooks here caused spurious re-renders that contributed to
// the "Couldn't find a navigation context" errors on the register page.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="registration-success" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="forgot-password-confirm" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="verify-notice" />
    </Stack>
  );
}
