import { useAppSelector } from "@/lib/hooks";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AdminLayout() {
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== "BUSINESS_ADMIN") {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="orders/[id]"
        options={{ headerShown: true, title: "Order Details" }}
      />
      <Stack.Screen
        name="vendor/[id]"
        options={{ headerShown: true, title: "Vendor Details" }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: true, title: "Product Details" }}
      />
      <Stack.Screen
        name="product/category/[id]/edit"
        options={{ headerShown: true, title: "Edit Category" }}
      />
      <Stack.Screen
        name="users/[id]"
        options={{ headerShown: true, title: "User Details" }}
      />
    </Stack>
  );
}
