import {
  useGetStoreProductsQuery,
  useGetDraftsQuery,
  useDeleteStoreProductMutation,
  useDeleteDraftMutation,
  useSubmitDraftMutation,
} from "@/lib/api/vendorApi";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type ProductType = "store" | "draft";

export default function VendorProductsScreen() {
  const router = useRouter();
  const {
    data: storeProductsData,
    isLoading: isLoadingStore,
    refetch: refetchStore,
  } = useGetStoreProductsQuery({});
  const {
    data: draftProductsData,
    isLoading: isLoadingDrafts,
    refetch: refetchDrafts,
  } = useGetDraftsQuery();

  const [deleteStoreProduct, { isLoading: isDeletingStore }] =
    useDeleteStoreProductMutation();
  const [deleteDraft, { isLoading: isDeletingDraft }] = useDeleteDraftMutation();
  const [submitDraft, { isLoading: isSubmitting }] = useSubmitDraftMutation();

  const publishedProducts = storeProductsData?.data || [];
  const draftProducts = draftProductsData?.data || [];

  const isLoading = isLoadingStore || isLoadingDrafts;
  const isDeleting = isDeletingStore || isDeletingDraft;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStore(), refetchDrafts()]);
    setRefreshing(false);
  };

  const handleSubmitDraft = async (slug: string) => {
    try {
      await submitDraft(slug).unwrap();
      Alert.alert("Success", "Product submitted for approval!");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to submit product");
    }
  };

  const confirmDelete = (slug: string, type: ProductType) => {
    Alert.alert(
      "Delete Product?",
      `Are you sure you want to delete this ${type} product? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(slug, type),
        },
      ]
    );
  };

  const handleDelete = async (slug: string, type: ProductType) => {
    try {
      if (type === "store") {
        await deleteStoreProduct(slug).unwrap();
      } else {
        await deleteDraft(slug).unwrap();
      }
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to delete product");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-100 items-center">
          <Text className="text-lg font-semibold text-gray-900">Products</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#030482"
            />
          }
        >
          <Text className="text-sm text-gray-500 mb-4 text-center">
            Manage your product inventory and listings
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/vendor/product/new")}
            className="bg-system-blue-light py-3 rounded-[12px] flex-row items-center justify-center mb-6"
          >
            <View className="w-6 h-6 bg-white rounded-full items-center justify-center mr-2">
              <Ionicons name="add" size={18} color="#030482" />
            </View>
            <Text className="text-white font-semibold">Add New Product</Text>
          </TouchableOpacity>
          {isLoading && !refreshing ? (
            <ActivityIndicator size="large" color="#030482" className="mt-10" />
          ) : publishedProducts.length === 0 && draftProducts.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="box" size={40} color="#9ca3af" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No Products Yet
              </Text>
              <Text className="text-sm text-gray-500 text-center px-10">
                Start building your store by adding your first product
              </Text>
            </View>
          ) : (
            <View>
              {/* Store Products */}
              {publishedProducts.length > 0 && (
                <View className="mb-6">
                  <Text className="text-[16px] font-semibold text-system-blue-dark mb-3">
                    Store Products
                  </Text>
                  <View className="gap-3">
                    {publishedProducts.map((product: any) => (
                      <View
                        key={product.slug}
                        className="bg-gray-50 rounded-[12px] p-4"
                      >
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <View className="flex-row items-center flex-wrap gap-2 mb-1">
                              <Text className="text-sm font-semibold text-gray-900">
                                {product.name}
                              </Text>
                              <View className="bg-blue-100 px-2 py-0.5 rounded">
                                <Text className="text-[10px] font-medium text-blue-700 capitalize">
                                  {product.approval_status}
                                </Text>
                              </View>
                              {product.stock === 0 && (
                                <View className="bg-red-100 px-2 py-0.5 rounded">
                                  <Text className="text-[10px] font-medium text-red-600">
                                    Out of Stock
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-[10px] text-gray-500 mb-1">
                              Stock: {product.stock} units
                            </Text>
                            <Text className="text-[10px] text-gray-500 mb-2">
                              {product.category}
                            </Text>
                            <Text className="text-lg font-bold text-gray-900">
                              ₦{parseFloat(product.price).toLocaleString()}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/vendor/product/${product.slug}/edit`)
                              }
                              className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                            >
                              <Feather name="edit-3" size={18} color="#030482" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => confirmDelete(product.slug, "store")}
                              className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                            >
                              <Feather name="trash-2" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Draft Products */}
              {draftProducts.length > 0 && (
                <View>
                  <Text className="text-[16px] font-semibold text-system-blue-dark mb-3">
                    Draft Products
                  </Text>
                  <View className="gap-3">
                    {draftProducts.map((product: any) => (
                      <View
                        key={product.slug}
                        className="bg-gray-50 rounded-[12px] p-4"
                      >
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-900 mb-1">
                              {product.name}
                            </Text>
                            <Text className="text-[10px] text-gray-500 mb-1">
                              Stock: {product.stock} units
                            </Text>
                            <Text className="text-[10px] text-gray-500 mb-2">
                              {product.category}
                            </Text>
                            <Text className="text-lg font-bold text-gray-900">
                              ₦{parseFloat(product.price).toLocaleString()}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() =>
                                router.push(
                                  `/vendor/product/${product.slug}/edit?type=draft`
                                )
                              }
                              className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                            >
                              <Feather name="edit-3" size={18} color="#030482" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleSubmitDraft(product.slug)}
                              className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                            >
                              <Feather name="upload" size={18} color="#16a34a" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => confirmDelete(product.slug, "draft")}
                              className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                            >
                              <Feather name="trash-2" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
