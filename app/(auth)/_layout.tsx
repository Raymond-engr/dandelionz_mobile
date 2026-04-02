import React from "react";
import { Stack } from "expo-router";

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
