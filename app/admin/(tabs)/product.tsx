import { OrderListItemSkeleton } from "@/components/OrderListItemSkeleton";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Divider } from "@/components/ui/divider";
import {
  useDeleteCategoryMutation,
  useDeleteProductMutation,
  useGetAllCategoriesQuery,
  useGetAllProductsQuery,
} from "@/lib/api/adminApi";
import {
  useGetDraftsQuery,
  useSubmitDraftMutation,
  useDeleteDraftMutation,
} from "@/lib/api/vendorApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type TabKey = "products" | "categories" | "drafts";

export default function AdminProduct() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("categories");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: categoriesData,
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = useGetAllCategoriesQuery();
  const categories = categoriesData || [];

  const {
    data: productsData,
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useGetAllProductsQuery({});
  const products = productsData?.data || [];

  const {
    data: draftsData,
    isLoading: loadingDrafts,
    refetch: refetchDrafts,
  } = useGetDraftsQuery();
  const drafts = draftsData?.data || [];

  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [deleteDraft] = useDeleteDraftMutation();
  const [submitDraft] = useSubmitDraftMutation();

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchCategories(), refetchDrafts()]);
    setRefreshing(false);
  }

  const handleDeleteCategory = (slug: string, name: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(slug).unwrap();
              Toast.show({
                type: "success",
                text1: "Category deleted successfully.",
              });
              refetchCategories();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: apiError(err, "Failed to delete category"),
              });
            }
          },
        },
      ],
    );
  };

  const handleDeleteProduct = (slug: string, name: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(slug).unwrap();
              Toast.show({
                type: "success",
                text1: "Product deleted successfully.",
              });
              refetchProducts();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: apiError(err, "Failed to delete product"),
              });
            }
          },
        },
      ],
    );
  };

  const handleDeleteDraft = (slug: string, name: string) => {
    Alert.alert(
      "Delete Draft",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDraft(slug).unwrap();
              Toast.show({
                type: "success",
                text1: "Draft deleted successfully.",
              });
              refetchDrafts();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: apiError(err, "Failed to delete draft"),
              });
            }
          },
        },
      ],
    );
  };

  const handleSubmitDraft = async (slug: string) => {
    try {
      await submitDraft(slug).unwrap();
      Toast.show({
        type: "success",
        text1: "Draft submitted successfully",
      });
      refetchProducts();
      refetchDrafts();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to submit draft"),
      });
    }
  };

  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredCategories = categories.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredDrafts = drafts.filter((d: any) =>
    d.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const isLoading =
    activeTab === "products" ? loadingProducts : 
    activeTab === "categories" ? loadingCategories : loadingDrafts;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-[21px] py-4">
        <View className="w-10" />
        <Text className="text-[24px] font-semibold text-system-blue-dark">
          Products
        </Text>
        <TouchableOpacity 
          onPress={() => {
            setShowSearch((v) => !v);
            if (showSearch) setSearch("");
          }}
          className="w-10 h-10 items-center justify-center bg-[#F5F7FA] rounded-full"
        >
          <Feather name={showSearch ? "x" : "search"} size={20} color="#030482" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View className="px-[21px] pb-3">
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder={activeTab === "products" ? "Search products..." : "Search categories..."}
            className="bg-[#F5F7FA] px-4 py-3 rounded-xl text-[14px] text-system-blue-dark"
          />
        </View>
      )}

      <Divider />

      {/* Tabs */}
      <View className="flex-row px-[21px] py-4 gap-4">
        <TouchableOpacity
          onPress={() => setActiveTab("categories")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "categories" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text
            className={`text-[14px] font-semibold ${activeTab === "categories" ? "text-white" : "text-[#6B7280]"}`}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("products")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "products" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text
            className={`text-[14px] font-semibold ${activeTab === "products" ? "text-white" : "text-[#6B7280]"}`}
          >
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("drafts")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "drafts" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text
            className={`text-[14px] font-semibold ${activeTab === "drafts" ? "text-white" : "text-[#6B7280]"}`}
          >
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        <View className="p-4">
          <Text className="text-sm text-gray-600 mb-4">
            Manage your categories and products
          </Text>

          {/* Categories Tab Content */}
          {activeTab === "categories" && (
            <View>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(admin)/product/category/new/edit" as any)
                }
                className="bg-[#f5f7fa] h-[101px] rounded-[12px] flex-row items-center justify-center gap-4 mb-6 shadow-sm"
              >
                <Ionicons name="add-circle-outline" size={32} color="#030482" />
                <Text className="text-[20px] font-bold text-system-blue-light">
                  Add New Category
                </Text>
              </TouchableOpacity>

              {isLoading && !refreshing ? (
                <View>
                  <OrderListItemSkeleton />
                  <OrderListItemSkeleton />
                  <OrderListItemSkeleton />
                </View>
              ) : (
                <View>
                  {filteredCategories.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                      No categories found
                    </Text>
                  ) : (
                    filteredCategories.map((item: any) => (
                      <View key={item.slug} className="mb-4">
                        <View className="bg-gray-50 rounded-xl p-4 flex-row items-center">
                          <TouchableOpacity
                            onPress={() =>
                              router.push(
                                `/(admin)/product/category/${item.slug}/edit`,
                              )
                            }
                            className="flex-1"
                          >
                            <Text className="text-[16px] font-bold text-system-blue-dark">
                              {item.name}
                            </Text>
                            <View className="flex-row gap-4 mt-1">
                              <Text className="text-[12px] text-[#6B7280]">
                                Products:{" "}
                                <Text className="font-bold text-gray-700">
                                  {item.product_count || 0}
                                </Text>
                              </Text>
                              <Text className="text-[12px] text-[#6B7280]">
                                Sales:{" "}
                                <Text className="font-bold text-gray-700">
                                  {parseFloat(item.total_sales || "0").toLocaleString()}
                                </Text>
                              </Text>
                            </View>
                          </TouchableOpacity>

                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() =>
                                router.push(
                                  `/(admin)/product/category/${item.slug}/edit`,
                                )
                              }
                              className="p-2 bg-blue-100 rounded-lg"
                            >
                              <Feather
                                name="edit-2"
                                size={18}
                                color="#030482"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                handleDeleteCategory(item.slug, item.name)
                              }
                              className="p-2 bg-red-100 rounded-lg"
                            >
                              <Feather
                                name="trash-2"
                                size={18}
                                color="#dc2626"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          )}

          {/* Products Tab Content */}
          {activeTab === "products" && (
            <View>
              {/* Product Stats Grid */}
              <View className="mb-6">
                <View className="bg-system-blue-light h-[101px] rounded-[12px] p-4 mb-4 flex-row items-center justify-between shadow-sm">
                  <View>
                    <Text className="text-[14px] text-white opacity-90 mb-1">
                      Total Products
                    </Text>
                    <Text className="text-[32px] font-bold text-white">
                      {products.length}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={48}
                    color="white"
                    style={{ opacity: 0.8 }}
                  />
                </View>

                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 bg-[rgba(77,255,151,0.25)] rounded-[12px] p-3">
                    <Text className="text-[12px] text-[#207d47] font-medium mb-1">
                      Approved
                    </Text>
                    <Text className="text-[20px] font-bold text-gray-900">
                      {
                        products.filter((p: any) => p.status === "APPROVED")
                          .length
                      }
                    </Text>
                  </View>
                  <View className="flex-1 bg-[rgba(255,77,77,0.25)] rounded-[12px] p-3">
                    <Text className="text-[12px] text-[#760303] font-medium mb-1">
                      Rejected
                    </Text>
                    <Text className="text-[20px] font-bold text-gray-900">
                      {
                        products.filter((p: any) => p.status === "REJECTED")
                          .length
                      }
                    </Text>
                  </View>
                </View>

                <View className="bg-[rgba(255,212,59,0.3)] rounded-[12px] p-3">
                  <Text className="text-[12px] text-[#856404] font-medium mb-1">
                    Pending
                  </Text>
                  <Text className="text-[20px] font-bold text-gray-900">
                    {products.filter((p: any) => p.status === "PENDING").length}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] font-bold text-system-blue-dark">
                  All Products
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(admin)/product/new" as any)}
                  className="bg-system-blue-light p-2 rounded-lg"
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {isLoading && !refreshing ? (
                <ProductGridSkeleton columns={1} count={5} />
              ) : (
                <View>
                  {filteredProducts.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                      No products found
                    </Text>
                  ) : (
                    filteredProducts.map((item: any) => {
                      const hasDiscount = parseFloat(item.discount || "0") > 0;
                      const originalPrice = parseFloat(item.price);
                      const discountedPrice = hasDiscount
                        ? originalPrice * (1 - parseFloat(item.discount) / 100)
                        : originalPrice;

                      return (
                        <View key={item.slug} className="mb-4">
                          <View className="bg-gray-50 rounded-xl p-4 flex-row">
                            <TouchableOpacity
                              onPress={() =>
                                router.push(
                                  `/(admin)/products/${item.slug}` as any,
                                )
                              }
                              className="flex-1"
                            >
                              <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 pr-2">
                                  <Text
                                    className="text-[16px] font-bold text-system-blue-dark"
                                    numberOfLines={1}
                                  >
                                    {item.name}
                                  </Text>
                                  <Text className="text-[12px] text-[#6B7280] mt-0.5">
                                    {item.vendor?.store_name} • {item.category}
                                  </Text>
                                </View>
                                <View
                                  className={`px-2 py-0.5 rounded-full ${
                                    item.status === "APPROVED"
                                      ? "bg-green-100"
                                      : item.status === "REJECTED"
                                        ? "bg-red-100"
                                        : "bg-orange-100"
                                  }`}
                                >
                                  <Text
                                    className={`text-[10px] font-bold ${
                                      item.status === "APPROVED"
                                        ? "text-green-700"
                                        : item.status === "REJECTED"
                                          ? "text-red-700"
                                          : "text-orange-700"
                                    }`}
                                  >
                                    {item.status}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-row items-center mt-2">
                                <Text className="text-[16px] font-bold text-system-blue-dark mr-2">
                                  {formatCurrency(discountedPrice)}
                                </Text>
                                {hasDiscount && (
                                  <Text className="text-[13px] text-gray-400 line-through">
                                    {formatCurrency(originalPrice)}
                                  </Text>
                                )}
                                <View className="flex-1" />
                                <Text className="text-[12px] text-gray-500">
                                  Stock: {item.stock || 0}
                                </Text>
                              </View>
                            </TouchableOpacity>

                            <View className="ml-3 gap-2">
                              <TouchableOpacity
                                onPress={() =>
                                  router.push(
                                    `/(admin)/product/${item.slug}/edit` as any,
                                  )
                                }
                                className="p-2 bg-blue-100 rounded-lg"
                              >
                                <Feather
                                  name="edit-2"
                                  size={18}
                                  color="#030482"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  handleDeleteProduct(item.slug, item.name)
                                }
                                className="p-2 bg-red-100 rounded-lg"
                              >
                                <Feather
                                  name="trash-2"
                                  size={18}
                                  color="#dc2626"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          )}

          {/* Drafts Tab Content */}
          {activeTab === "drafts" && (
            <View>
              {isLoading && !refreshing ? (
                <ProductGridSkeleton columns={1} count={5} />
              ) : (
                <View>
                  {filteredDrafts.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                      No drafts found
                    </Text>
                  ) : (
                    filteredDrafts.map((item: any) => (
                      <View key={item.slug} className="mb-4">
                        <View className="bg-gray-50 rounded-xl p-4 flex-row items-center">
                          <View className="flex-1 pr-2">
                            <Text
                              className="text-[16px] font-bold text-system-blue-dark mb-1"
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text className="text-[12px] text-[#6B7280] mb-1">
                              Stock: {item.stock} • {item.category}
                            </Text>
                            <Text className="text-[16px] font-bold text-system-blue-light">
                              {formatCurrency(parseFloat(item.price))}
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/(admin)/product/${item.slug}/edit?type=draft` as any)
                              }
                              className="p-2 bg-blue-100 rounded-lg"
                            >
                              <Feather name="edit-2" size={18} color="#030482" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleSubmitDraft(item.slug)}
                              className="p-2 bg-green-100 rounded-lg"
                            >
                              <Feather name="check" size={18} color="#16a34a" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteDraft(item.slug, item.name)}
                              className="p-2 bg-red-100 rounded-lg"
                            >
                              <Feather name="trash-2" size={18} color="#dc2626" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
