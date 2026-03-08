import { Colors } from "@/constants/theme";
import {
    useGetCartQuery,
    useRemoveFromCartMutation,
    useUpdateCartItemMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFocused = useIsFocused();

  const { data: cartResponse, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();

  const cartData = cartResponse?.data;
  const items = cartData?.items ?? [];
  const total = parseFloat(cartData?.total ?? "0");

  // Redirect to login if not authenticated
  const redirected = React.useRef(false);

  useEffect(() => {
    if (isFocused) {
      redirected.current = false; // reset flag when screen is focused
    }
    if (!isAuthenticated && isFocused && !redirected.current) {
      redirected.current = true;
      AsyncStorage.setItem("redirect_after_login", "/(tabs)/cart");
      router.replace("/(tabs)");
      router.push("/(auth)/login");
    }
  }, [isAuthenticated, isFocused, router]);

  if (!isAuthenticated) {
    return null; // hide content during redirect
  }

  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add products to your cart to see them here
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Continue Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerCount}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: any }) => {
          const product = item.product_details ?? {};
          const price = parseFloat(product.price ?? "0");
          const discount = product.discount ?? 0;
          const displayPrice =
            discount > 0 ? price * (1 - discount / 100) : price;

          return (
            <View style={styles.cartItem}>
              <View style={styles.cartItemImg}>
                {product.image ? (
                  <Image
                    source={{ uri: product.image }}
                    style={styles.imgFull}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imgPlaceholder} />
                )}
              </View>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.cartItemPrice}>
                  ₦
                  {(displayPrice * item.quantity).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={styles.cartItemUnit}>
                  ₦
                  {displayPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  each
                </Text>

                <View style={styles.qtyRow}>
                  <Pressable
                    onPress={() => {
                      if (item.quantity <= 1)
                        removeItem(product.slug)
                          .unwrap()
                          .catch(() => {});
                      else
                        updateItem({
                          slug: product.slug,
                          quantity: item.quantity - 1,
                        })
                          .unwrap()
                          .catch(() => {});
                    }}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <Pressable
                    onPress={() =>
                      updateItem({
                        slug: product.slug,
                        quantity: item.quantity + 1,
                      })
                        .unwrap()
                        .catch(() => {})
                    }
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      removeItem(product.slug)
                        .unwrap()
                        .catch(() => {})
                    }
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ₦{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
        </View>
        <Pressable style={styles.checkoutBtn}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerCount: { fontSize: 14, color: "#6B7280" },
  list: { padding: 16, gap: 12 },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  cartItemImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  imgFull: { width: "100%", height: "100%" },
  imgPlaceholder: { flex: 1, backgroundColor: "#F3F4F6" },
  cartItemInfo: { flex: 1, gap: 4 },
  cartItemName: { fontSize: 14, fontWeight: "500", color: "#111827" },
  cartItemPrice: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  cartItemUnit: { fontSize: 12, color: "#9CA3AF" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, color: "#374151", lineHeight: 22 },
  qtyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    minWidth: 20,
    textAlign: "center",
  },
  removeBtn: { marginLeft: "auto" },
  removeBtnText: { fontSize: 13, color: "#DC2626" },
  separator: { height: 0 },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, color: "#6B7280", fontWeight: "500" },
  totalValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F9FAFB",
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
