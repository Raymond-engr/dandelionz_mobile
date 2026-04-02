import React, { useEffect, useState } from "react";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { NotificationProvider } from "@/lib/features/notification/NotificationProvider";
import { store } from "@/lib/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import "../global.css";

function AppWithProviders() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Restore auth on launch
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem("auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          store.dispatch(setCredentials(parsed));
        }
      } catch {}
      // mark hydration complete regardless of result
      setHydrated(true);
    };
    restore();

    // Persist auth changes
    const unsub = store.subscribe(async () => {
      const { auth } = store.getState();
      try {
        if (auth.isAuthenticated) {
          await AsyncStorage.setItem(
            "auth",
            JSON.stringify({
              user: auth.user,
              accessToken: auth.accessToken,
              refreshToken: auth.refreshToken,
            }),
          );
        } else {
          await AsyncStorage.removeItem("auth");
        }
      } catch {}
    });
    return unsub;
  }, []);

  // Always render tabs first (public home page), auth handled inside screens
  return (
    <NotificationProvider>
      <StatusBar style="auto" />
      {!hydrated ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#030482" />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="vendor" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="category/[name]" />
          <Stack.Screen name="checkout/success" />
          <Stack.Screen name="checkout/webview" options={{ presentation: "modal" }} />
          <Stack.Screen name="order-tracking" />
          <Stack.Screen name="order-receipt" />
          
          <Stack.Screen name="contact" />
          <Stack.Screen name="faqs" />
          <Stack.Screen name="terms" />
        </Stack>
      )}
    </NotificationProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppWithProviders />
      </Provider>
    </GestureHandlerRootView>
  );
}
