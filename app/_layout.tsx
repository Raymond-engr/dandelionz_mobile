import { setCredentials } from "@/lib/features/auth/authSlice";
import { NotificationProvider } from "@/lib/features/notification/NotificationProvider";
import { store } from "@/lib/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

import { Ionicons } from "@expo/vector-icons";

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="px-4 w-full items-center">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 100,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#f0f0f0",
          minWidth: 200,
          maxWidth: "90%",
        }}
      >
        <View
          style={{
            backgroundColor: "#DEF7EC",
            padding: 4,
            borderRadius: 100,
            marginRight: 12,
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color="#0E9F6E" />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
            {text1}
          </Text>
          {text2 ? (
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View className="px-4 w-full items-center">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 100,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#FEE2E2",
          minWidth: 200,
          maxWidth: "90%",
        }}
      >
        <View
          style={{
            backgroundColor: "#FDE2E2",
            padding: 4,
            borderRadius: 100,
            marginRight: 12,
          }}
        >
          <Ionicons name="close-circle" size={20} color="#F05252" />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
            {text1}
          </Text>
          {text2 ? (
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View className="px-4 w-full items-center">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 100,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#E1EFFE",
          minWidth: 200,
          maxWidth: "90%",
        }}
      >
        <View
          style={{
            backgroundColor: "#E1EFFE",
            padding: 4,
            borderRadius: 100,
            marginRight: 12,
          }}
        >
          <Ionicons name="information-circle" size={20} color="#3F83F8" />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
            {text1}
          </Text>
          {text2 ? (
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  ),
};

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
    <>
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
            {/* Role tab groups */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="vendor" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />

            {/* Public / shared screens */}
            <Stack.Screen name="category/[name]" />
            <Stack.Screen name="product/[slug]" />

            {/* Checkout flow */}
            <Stack.Screen name="checkout/frequency" />
            <Stack.Screen name="checkout/installments" />
            <Stack.Screen name="checkout/shipping" />
            <Stack.Screen name="checkout/payment" />
            <Stack.Screen name="checkout/success" />
            <Stack.Screen
              name="checkout/webview"
              options={{ presentation: "modal" }}
            />

            {/* Orders */}
            <Stack.Screen name="order-tracking" />
            <Stack.Screen name="order-receipt" />

            {/* Customer account sub-screens */}
            <Stack.Screen name="customer-profile" />
            <Stack.Screen name="account/delivery-address" />
            <Stack.Screen name="customer-notifications" />
            <Stack.Screen name="account/change-password" />
            <Stack.Screen name="account/delete-account" />

            {/* Static pages */}
            <Stack.Screen name="contact" />
            <Stack.Screen name="faqs" />
            <Stack.Screen name="terms" />
          </Stack>
        )}
      </NotificationProvider>
      <Toast config={toastConfig} />
    </>
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
