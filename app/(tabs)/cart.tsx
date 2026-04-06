import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data: cartResponse, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();

  const cartData = cartResponse?.data;
  const items = cartData?.items ?? [];
  const total = parseFloat(cartData?.total ?? "0");

  // Inline auth check — same pattern as account.tsx, no useIsFocused needed
  if (!isAuthenticated) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-8 gap-4"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-[64px] mb-2">🛒</Text>
        <Text className="text-[20px] font-bold text-system-blue-dark text-center">
          Sign in to view your cart
        </Text>
        <Text className="text-[14px] text-[#6B7280] text-center mb-4">
          Log in to add items and check out
        </Text>
        <Button onPress={() => router.push("/(auth)/login")}>Login</Button>
        <Button
          variant="outline"
          onPress={() => router.push("/(auth)/register")}
        >
          Create Account
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <Text className="text-[64px] mb-5">🛒</Text>
      <Text className="text-[20px] font-bold text-system-blue-dark mb-2">
        Your cart is empty
      </Text>
      <Text className="text-[14px] text-[#6B7280] text-center mb-8">
        Add products to your cart to see them here
      </Text>
      <Button onPress={() => router.push("/(tabs)")} className="px-8">
        Continue Shopping
      </Button>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <FlatList
        data={items}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }: { item: any }) => {
          const product = item.product_details ?? {};
          const price = parseFloat(product.price ?? "0");
          const discount = product.discount ?? 0;
          const displayPrice =
            discount > 0 ? price * (1 - discount / 100) : price;

          const handleUpdate = (newQty: number) => {
            if (newQty < 1) {
              removeItem({
                slug: product.slug,
                selected_variants: item.selected_variants,
              }).unwrap();
            } else {
              updateItem({
                slug: product.slug,
                quantity: newQty,
                selected_variants: item.selected_variants,
              }).unwrap();
            }
          };

          return (
            <View>
              <View className="flex-row p-[21px] gap-4">
                <View className="w-20 h-20 rounded-lg overflow-hidden bg-[#F3F4F6]">
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full" />
                  )}
                </View>

                <View className="flex-1 justify-between">
                  <View>
                    <Text
                      className="text-[14px] font-medium text-system-blue-dark"
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>
                    {item.selected_variants &&
                      Object.entries(item.selected_variants).map(
                        ([k, v]: [string, any]) => (
                          <Text key={k} className="text-[11px] text-[#6B7280]">
                            {k}: {v}
                          </Text>
                        ),
                      )}
                  </View>

                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-[16px] font-bold text-system-blue-light">
                      ₦{(displayPrice * item.quantity).toLocaleString()}
                    </Text>

                    <View className="flex-row items-center gap-3">
                      <Pressable
                        onPress={() => handleUpdate(item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-[#D1D5DB] items-center justify-center"
                      >
                        <Text className="text-[18px] text-[#374151]">−</Text>
                      </Pressable>
                      <Text className="text-[15px] font-semibold text-system-blue-dark min-w-[20px] text-center">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => handleUpdate(item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-[#D1D5DB] items-center justify-center"
                      >
                        <Text className="text-[18px] text-[#374151]">+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
              <Divider height={1} className="opacity-50" />
            </View>
          );
        }}
      />

      {items.length > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white p-[21px] border-t border-[#F3F4F6]"
          style={{ paddingBottom: Math.max(insets.bottom, 21) }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[16px] text-[#6B7280] font-medium">
              Total
            </Text>
            <Text className="text-[20px] font-bold text-system-blue-dark">
              ₦{total.toLocaleString()}
            </Text>
          </View>
          <Button onPress={() => router.push("/checkout/frequency" as any)}>
            Proceed to Checkout
          </Button>
        </View>
      )}
    </View>
  );
}
