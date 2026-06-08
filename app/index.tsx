// app/index.tsx
import { router, useRootNavigationState } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

// Tell Expo Router this screen belongs to (tabs) for linking purposes
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function Index() {
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavState?.key) return; // Navigator not ready yet
    // Safe to navigate now — navigator is committed
    router.replace("/(tabs)");
  }, [rootNavState?.key]);

  return <View style={{ flex: 1, backgroundColor: "white" }} />;
}
