import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

export default function CheckoutWebView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, reference, plan_id } = useLocalSearchParams<{ 
    url: string; 
    reference: string; 
    plan_id: string; 
  }>();

  const [isLoading, setIsLoading] = useState(true);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url: currentUrl } = navState;
    
    // Detect the redirect URL from Paystack
    // The Web version redirects to /checkout/success
    if (currentUrl.includes("/checkout/success") || currentUrl.includes("verify-payment")) {
      // Small delay to ensure the redirect is processed
      setTimeout(() => {
        router.replace({
          pathname: "/checkout/success" as any,
          params: { reference, plan_id }
        });
      }, 500);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="close" size={28} color={Colors.primary} />
        </Pressable>
        <Text className="text-[20px] font-semibold text-system-blue-dark text-center flex-1">
          Secure Payment
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 relative">
        {url ? (
          <WebView
            source={{ uri: url }}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white z-10">
                <LoadingSpinner />
              </View>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-red-500 text-center">Invalid payment URL provided.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
