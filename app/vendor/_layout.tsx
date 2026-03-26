import { useAppSelector } from "@/lib/hooks";
import { VendorTabBar } from "@/components/vendor/VendorTabBar";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function VendorTabsLayout() {
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== "VENDOR") {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <Tabs
      tabBar={(props) => <VendorTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="products" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
