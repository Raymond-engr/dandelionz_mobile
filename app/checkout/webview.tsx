import { Colors } from "@/constants/theme";
import { publicApi } from "@/lib/api/publicApi";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

/**
 * Paystack WebView for payment.
 *
 * FIX: The previous code called `useVerifyPaymentMutation()` which does NOT
 * exist in publicApi.ts (only `useVerifyPaymentQuery` does).  Calling an
 * undefined hook crashed the screen on mount.
 *
 * Solution: use `useLazyVerifyPaymentQuery` — this is the correct on-demand
 * version of the existing query and matches how the web app's success page
 * works (it fires a GET request with the reference from URL params).
 *
 * Paystack callback URL (set in Paystack dashboard):
 *   https://app.dandelionz.com.ng/checkout/success
 */

const PAYSTACK_CALLBACK_HOST = "app.dandelionz.com.ng";
const PAYSTACK_CALLBACK_PATH = "/checkout/success";

function isPaystackCallback(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === PAYSTACK_CALLBACK_HOST &&
      parsed.pathname === PAYSTACK_CALLBACK_PATH
    );
  } catch {
    return (
      url.includes(PAYSTACK_CALLBACK_HOST) &&
      url.includes(PAYSTACK_CALLBACK_PATH)
    );
  }
}

function extractReference(url: string): string | null {
  try {
    const parsed = new URL(url);
    return (
      parsed.searchParams.get("reference") ||
      parsed.searchParams.get("trxref") ||
      null
    );
  } catch {
    const match = url.match(/[?&](?:reference|trxref)=([^&]+)/);
    return match ? match[1] : null;
  }
}

function extractPlanId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("plan_id");
  } catch {
    const match = url.match(/[?&]plan_id=([^&]+)/);
    return match ? match[1] : null;
  }
}

export default function PaystackWebView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    url,
    orderId,
    plan_id: planIdParam,
  } = useLocalSearchParams<{
    url: string;
    orderId?: string;
    plan_id?: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const hasHandled = useRef(false);

  // ✅ Use the lazy version of the existing query — NOT a (non-existent) mutation.
  const [triggerVerify] = publicApi.useLazyVerifyPaymentQuery();
  // For installment plans we use the installment verify endpoint.
  const [triggerInstallmentVerify] =
    publicApi.useLazyVerifyInstallmentPaymentQuery();

  const handleNavigationChange = async (navState: WebViewNavigation) => {
    const currentUrl = navState.url;
    if (!currentUrl || hasHandled.current) return;

    if (!isPaystackCallback(currentUrl)) return;

    hasHandled.current = true;
    setIsVerifying(true);

    const reference = extractReference(currentUrl);
    // plan_id can come from the initial params (installment) OR from the
    // callback URL that Paystack appends.
    const planId = planIdParam || extractPlanId(currentUrl);

    try {
      if (reference) {
        if (planId) {
          await triggerInstallmentVerify({ reference }).unwrap();
        } else {
          await triggerVerify({ reference }).unwrap();
        }
      }

      router.replace({
        pathname: "/checkout/success" as any,
        params: {
          orderId: orderId ?? "",
          reference: reference ?? "",
          ...(planId ? { plan_id: planId } : {}),
        },
      });
    } catch (err: any) {
      setIsVerifying(false);
      Alert.alert(
        "Payment Verification Failed",
        err?.data?.message ||
          "We could not confirm your payment. Please contact support.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)" as any) }],
      );
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Cancel Payment",
      "Are you sure you want to cancel this payment?",
      [
        { text: "Continue Payment", style: "cancel" },
        { text: "Cancel", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  if (!url) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Text className="text-red-500">Invalid payment URL</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-system-blue-light px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable onPress={handleClose} className="w-10">
          <MaterialIcons name="close" size={24} color={Colors.primary} />
        </Pressable>
        <Text className="text-[16px] font-bold text-system-blue-dark text-center flex-1">
          Secure Payment
        </Text>
        <View className="w-10 flex-row items-center justify-end">
          <MaterialIcons name="lock" size={18} color="#22C55E" />
        </View>
      </View>

      {/* Loading / Verifying overlay */}
      {(isLoading || isVerifying) && (
        <View className="absolute inset-0 bg-white items-center justify-center z-50">
          <ActivityIndicator size="large" color="#030482" />
          <Text className="text-[14px] text-gray-500 mt-4">
            {isVerifying ? "Verifying payment..." : "Loading payment page..."}
          </Text>
        </View>
      )}

      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationChange}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          Alert.alert(
            "Error",
            "Failed to load payment page. Please try again.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        className="flex-1"
      />
    </View>
  );
}
