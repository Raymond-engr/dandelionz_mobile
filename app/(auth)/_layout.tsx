import { useAppSelector } from "@/lib/hooks";
import { Stack, router } from "expo-router";
import React, { useEffect, useRef } from "react";

/**
 * Auth stack layout.
 *
 * Guard: if the user is ALREADY authenticated when this layout mounts
 * (e.g. deep-link to /login while a session is active, or a back-navigation
 * race), redirect them away immediately so they never see auth screens.
 *
 * This is a safety net — primary navigation logic still lives in login.tsx.
 * The hasRedirected ref prevents double-firing in StrictMode.
 */
export default function AuthLayout() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || hasRedirected.current) return;
    hasRedirected.current = true;

    queueMicrotask(() => {
      if (user.role === "BUSINESS_ADMIN") {
        router.replace("/(admin)/(tabs)");
      } else if (user.role === "VENDOR") {
        router.replace("/vendor");
      } else {
        // Customer — pop the auth screen to reveal the already-mounted (tabs).
        // Same reasoning as in login.tsx: back() avoids the duplicate-navigator
        // issue that replace("/(tabs)") causes.
        if (router.canGoBack()) {
          router.back();
        }
        // If canGoBack() is false the user was on auth as their root screen;
        // login.tsx will have already handled this case via navigate("/").
      }
    });
  }, [isAuthenticated, user?.role]);

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