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

// ─── Root error boundary ──────────────────────────────────────────────────────
// Catches synchronous render errors in production and shows a readable message
// instead of a permanent white screen.
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message ?? String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#EF4444",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {this.state.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ─── Toast config (unchanged) ─────────────────────────────────────────────────
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

// ─── App body ─────────────────────────────────────────────────────────────────
function AppWithProviders() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem("auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          store.dispatch(setCredentials(parsed));
        }
      } catch (_) {
        // Corrupt storage — start fresh, still mark hydrated.
      }
      setHydrated(true);
    };
    restore();

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
      } catch (_) {}
    });
    return unsub;
  }, []);

  // ── Stack is ALWAYS rendered from the very first frame.
  //
  // Gating the Stack behind `hydrated` state (the old pattern) caused a
  // white screen in production because expo-router initialises its navigation
  // context on mount. With Hermes + a bundled APK the JS takes longer to
  // evaluate; by the time React renders for the first time expo-router has
  // already looked for a navigator, found none, and left the context in an
  // incomplete state. The result is a blank screen that never recovers.
  //
  // Fix: the Stack mounts immediately. A plain white View covers it as an
  // overlay while AsyncStorage is being read (usually < 50 ms on device) and
  // disappears once `hydrated` is true. The navigator is always available to
  // expo-router regardless of hydration timing.
  //
  // The outer View with flex:1 is required so that the absolute-positioned
  // overlay has a correctly sized parent to fill.
  return (
    <View style={{ flex: 1 }}>
      <NotificationProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            freezeOnBlur: true,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="vendor" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />

          <Stack.Screen name="category/[name]" />
          <Stack.Screen name="product/[slug]" />

          <Stack.Screen name="checkout/frequency" />
          <Stack.Screen name="checkout/installments" />
          <Stack.Screen name="checkout/shipping" />
          <Stack.Screen name="checkout/payment" />
          <Stack.Screen name="checkout/success" />
          <Stack.Screen
            name="checkout/webview"
            options={{ presentation: "modal" }}
          />

          <Stack.Screen name="order-tracking" />
          <Stack.Screen name="order-receipt" />

          <Stack.Screen name="customer-profile" />
          <Stack.Screen name="account/delivery-address" />
          <Stack.Screen name="customer-notifications" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="account/delete-account" />

          <Stack.Screen name="contact" />
          <Stack.Screen name="faqs" />
          <Stack.Screen name="terms" />
        </Stack>
      </NotificationProvider>

      <Toast config={toastConfig} />

      {/* Hydration overlay — disappears once AsyncStorage has been read.
          Background matches the splash screen so there is no visual jump. */}
      {!hydrated && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
          }}
          pointerEvents="box-none"
        >
          <ActivityIndicator size="large" color="#030482" />
        </View>
      )}
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootErrorBoundary>
          <AppWithProviders />
        </RootErrorBoundary>
      </Provider>
    </GestureHandlerRootView>
  );
}
