import { Stack } from "expo-router";
import React from "react";

// Auth stack — includes both customer and vendor register screens.
// Each is a self-contained screen with a fixed component tree, so no
// role-switching UI exists anywhere in this stack.
export default function AuthLayout() {
  "use no memo";
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-vendor" />
      <Stack.Screen name="registration-success" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="forgot-password-confirm" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="verify-notice" />
    </Stack>
  );
}
