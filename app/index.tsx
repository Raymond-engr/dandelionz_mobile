import { StandaloneBottomBar } from "@/components/standalone-bottom-bar";
import React from "react";
import { View } from "react-native";
import ShopScreen from "./(tabs)/index";

// app/index.tsx is the root route rendered by the root Stack.
// We import ShopScreen directly here because a <Redirect href="/(tabs)" />
// fires before the navigator is fully committed, producing a blank screen.
//
// The StandaloneBottomBar provides the same visual nav as BottomTabBar.
// Tapping Cart / Orders / Wishlist / Account pushes into the real (tabs) group,
// where the genuine BottomTabBar takes over. Back() from any of those returns
// here and the StandaloneBottomBar re-appears — seamless for the user.
export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <ShopScreen />
      <StandaloneBottomBar activeTab="index" />
    </View>
  );
}
