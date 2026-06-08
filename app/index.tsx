import { StandaloneBottomTabBar } from "@/components/standalone-bottom-tab-bar";
import React from "react";
import { View } from "react-native";
import ShopScreen from "./(tabs)/index";

/**
 * Root index.
 *
 * Renders ShopScreen from the (tabs) group at the root "/" path — required for
 * router.replace("/") to work without the blank-screen issue caused by
 * router.replace("/(tabs)") in Expo Router v6.
 *
 * Because this screen lives outside the (tabs) Tabs navigator, the navigator's
 * BottomTabBar is never rendered. StandaloneBottomTabBar fills that gap: same
 * visual, imperative router.push() for navigation, Shop always active.
 *
 * ShopScreen already has paddingBottom: 100 on its ScrollView, so content
 * clears the tab bar naturally.
 */
export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <ShopScreen />
      <StandaloneBottomTabBar />
    </View>
  );
}
