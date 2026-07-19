import { Colors } from "@/constants/theme";
import { useLazyVerifyWalletDepositQuery } from "@/lib/api/customerApi";
import { publicApi } from "@/lib/api/publicApi";
import { classifyReference } from "@/lib/payments";
import { apiError } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";
import Toast from "react-native-toast-message";

/**
 * Paystack WebView for payment.
 *
 * The mobile app sends X-Platform: mobile with every API request (see
 * baseApi.ts), so the checkout endpoint uses PAYSTACK_MOBILE_CALLBACK_URL
 * (api.dandelionz.com.ng/transactions/paystack/return/) instead of the web
 * app's /checkout/success route. This avoids Next.js middleware redirecting
 * the unauthenticated WebView to /login before we can extract the reference.
 *
 * extractCallback matches both the new mobile endpoint and the web callback
 * path (plus the login-redirect pattern as a last-resort fallback). The
 * primary interception point is onShouldStartLoadWithRequest, which fires
 * before each navigation request — catching the redirect URL before Android's
 * WebView coalesces the 302 chain and makes it invisible to
 * onNavigationStateChange.
 *
 * This screen is shared by three flows — order checkout, installment payments
 * and wallet top-ups — which differ only in which endpoint verifies the
 * reference and which screen the user lands on afterwards. classifyReference()
 * makes that choice; see lib/payments.ts. Deposits are routed back to the
 * wallet rather than /checkout/success, whose copy is all order messaging.
 */

const RETURN_HOSTS = ["api.dandelionz.com.ng", "app.dandelionz.com.ng"];

function extractCallback(url: string): { hit: boolean; reference: string | null } {
  try {
    const p = new URL(url);
    const inPath =
      p.pathname.startsWith("/checkout/success") ||
      p.pathname.startsWith("/transactions/paystack/return");
    const bounced =
      p.pathname.startsWith("/login") &&
      (p.searchParams.get("redirect") || "").includes("/checkout/success");
    const ref = p.searchParams.get("reference") || p.searchParams.get("trxref");
    const hit = RETURN_HOSTS.includes(p.hostname) && (inPath || bounced || !!ref);
    return { hit, reference: ref ?? null };
  } catch {
    return { hit: false, reference: null };
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
    reference: referenceParam,
  } = useLocalSearchParams<{
    url: string;
    orderId?: string;
    plan_id?: string;
    reference?: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const hasHandled = useRef(false);

  const [triggerVerify] = publicApi.useLazyVerifyPaymentQuery();
  const [triggerInstallmentVerify] =
    publicApi.useLazyVerifyInstallmentPaymentQuery();
  const [triggerDepositVerify] = useLazyVerifyWalletDepositQuery();

  const handleCallbackUrl = async (
    reference: string | null,
    callbackUrl: string,
  ) => {
    setIsVerifying(true);
    const planId = planIdParam || extractPlanId(callbackUrl);
    // The callback URL is the source of truth for the reference; the launch
    // param is only a fallback for the case where Paystack returns us to a URL
    // that carries no reference at all.
    const effectiveReference = reference ?? referenceParam ?? null;
    const kind = classifyReference(effectiveReference, planId);

    try {
      if (kind === "deposit") {
        // A deposit with no reference cannot be verified, and crediting nothing
        // silently would be worse than saying so.
        if (!effectiveReference) throw new Error("Missing deposit reference");
        await triggerDepositVerify({ reference: effectiveReference }).unwrap();

        Toast.show({
          type: "success",
          text1: "Wallet funded",
          text2: "Your balance has been topped up.",
        });
        router.replace("/account/wallet" as any);
        return;
      }

      if (reference) {
        if (kind === "installment") {
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
      if (kind === "deposit") {
        Alert.alert(
          "Top-up Verification Failed",
          apiError(
            err,
            "We could not confirm your top-up. If you were debited, contact support.",
          ),
          [{ text: "OK", onPress: () => router.replace("/account/wallet" as any) }],
        );
        return;
      }
      Alert.alert(
        "Payment Verification Failed",
        apiError(err, "We could not confirm your payment. Please contact support."),
        [{ text: "OK", onPress: () => router.replace("/(tabs)" as any) }],
      );
    }
  };

  // Fallback for iOS and cases where onShouldStartLoadWithRequest doesn't fire.
  const handleNavigationChange = (navState: WebViewNavigation) => {
    if (!navState.url || hasHandled.current) return;
    const { hit, reference } = extractCallback(navState.url);
    if (hit) {
      hasHandled.current = true;
      handleCallbackUrl(reference, navState.url);
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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
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
        // Primary interception: fires before each request, catches the callback
        // URL before Android's WebView coalesces any 302 redirect chain.
        onShouldStartLoadWithRequest={(request) => {
          const { hit, reference } = extractCallback(request.url);
          if (hit && !hasHandled.current) {
            hasHandled.current = true;
            setTimeout(() => handleCallbackUrl(reference, request.url), 0);
            return false;
          }
          return true;
        }}
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
        incognito
        className="flex-1"
      />
    </View>
  );
}
