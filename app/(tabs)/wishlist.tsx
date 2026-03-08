import { Colors } from "@/constants/theme";
import {
    useAddToCartMutation,
    useGetWishlistQuery,
    useRemoveFromWishlistMutation,
} from "@/lib/api/publicApi";
import { useAppSelector } from "@/lib/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFocused = useIsFocused();

  const { data: wishlistItems = [], isLoading } = useGetWishlistQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  // Redirect to login if not authenticated
  const redirected = React.useRef(false);

  useEffect(() => {
    if (isFocused) {
      redirected.current = false; // reset flag when screen is focused
    }
    if (!isAuthenticated && isFocused && !redirected.current) {
      redirected.current = true;
      AsyncStorage.setItem("redirect_after_login", "/(tabs)/wishlist");
      router.replace("/(tabs)");
      router.push("/(auth)/login");
    }
  }, [isAuthenticated, isFocused, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>♡</Text>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Save products you love to your wishlist
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Browse Products</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.headerCount}>
          {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={wishlistItems as any[]}
        keyExtractor={(item: any) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: any }) => {
          const product = item.product_details ?? {};
          const price = parseFloat(product.price ?? "0");
          const discount = product.discount ?? 0;
          const displayPrice =
            discount > 0 ? price * (1 - discount / 100) : price;

          return (
            <View style={styles.card}>
              <View style={styles.imageWrap}>
                {product.image ? (
                  <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]} />
                )}
                <Pressable
                  onPress={() =>
                    removeFromWishlist(product.slug)
                      .unwrap()
                      .catch(() => {})
                  }
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>♥</Text>
                </Pressable>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  ₦
                  {displayPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Pressable
                  onPress={() =>
                    addToCart({ slug: product.slug, quantity: 1 })
                      .unwrap()
                      .catch(() => {})
                  }
                  style={styles.addToCartBtn}
                >
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
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
  row: { gap: 12 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  imageWrap: {
    position: "relative",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { backgroundColor: "#E5E7EB" },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { fontSize: 16, color: "#EF4444" },
  cardInfo: { padding: 10, gap: 4 },
  productName: { fontSize: 13, fontWeight: "500", color: "#111827" },
  productPrice: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  addToCartBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 4,
  },
  addToCartText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F9FAFB",
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20, color: Colors.primary },
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
