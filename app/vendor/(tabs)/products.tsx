import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import {
  useGetStoreProductsQuery,
  useGetDraftsQuery,
  useDeleteStoreProductMutation,
  useDeleteDraftMutation,
  useSubmitDraftMutation,
} from "@/lib/api/vendorApi";
import { captureApiError } from "@/lib/observability";
import { apiError } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "@/lib/utils";
import Toast from "react-native-toast-message";

type ProductType = "store" | "draft";

export default function VendorProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ProductType>("store");

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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStore(), refetchDrafts()]);
    setRefreshing(false);
  };

  const handleSubmitDraft = async (slug: string) => {
    try {
      await submitDraft(slug).unwrap();
      Toast.show({ type: "success", text1: "Product submitted for approval!" });
    } catch (err: any) {
      captureApiError(err, {
        flow: "product",
        action: "submit-draft",
        extra: { slug, role: "VENDOR" },
      });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to submit product")
      });
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
      Toast.show({ type: "success", text1: "Product deleted successfully" });
    } catch (err: any) {
      captureApiError(err, {
        flow: "product",
        action: type === "store" ? "delete" : "delete-draft",
        extra: { slug, productType: type, role: "VENDOR" },
      });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to delete product")
      });
    }
  };

  const products = activeTab === "store" ? publishedProducts : draftProducts;

  const renderHeader = () => (
    <View 
      className="px-4 py-4 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center">
        Products
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20 px-[21px]">
      <MaterialIcons name="inventory-2" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4 text-center">
        No {activeTab} products
      </Text>
      <Text className="text-[14px] text-[#6B7280] text-center mt-2 px-6">
        {activeTab === "store" 
          ? "You haven't published any products yet." 
          : "You don't have any products in draft."}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}
      
      {/* Tabs */}
      <View className="flex-row px-[21px] py-4 gap-4">
        <TouchableOpacity
          onPress={() => setActiveTab("store")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "store" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${activeTab === "store" ? "text-white" : "text-[#6B7280]"}`}>
            Published
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("draft")}
          className={`flex-1 py-3 rounded-full items-center ${activeTab === "draft" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${activeTab === "draft" ? "text-white" : "text-[#6B7280]"}`}>
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <FlatList
        data={products}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <View>
            <View className="p-[21px] flex-row items-center">
              {/* Product Info */}
              <View className="flex-1">
                <View className="flex-row items-center flex-wrap gap-2 mb-1">
                  <Text className="text-[16px] font-bold text-system-blue-dark" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {activeTab === "store" && (
                    <View className={`px-2 py-0.5 rounded-full ${
                      item.approval_status === 'APPROVED' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-[10px] font-bold ${
                        item.approval_status === 'APPROVED' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {item.approval_status}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text className="text-[13px] text-gray-500 mb-1">
                  {item.category} • Stock: {item.stock}
                </Text>
                
                <Text className="text-[18px] font-bold text-system-blue-light">
                  {formatCurrency(item.price)}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => router.push(`/vendor/product/${item.slug}/edit${activeTab === 'draft' ? '?type=draft' : ''}`)}
                  className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
                >
                  <MaterialIcons name="edit" size={20} color={Colors.primary} />
                </TouchableOpacity>
                
                {activeTab === 'draft' && (
                  <TouchableOpacity
                    onPress={() => handleSubmitDraft(item.slug)}
                    className="w-10 h-10 rounded-full bg-green-50 items-center justify-center"
                  >
                    <MaterialIcons name="publish" size={20} color="#16a34a" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => confirmDelete(item.slug, activeTab)}
                  className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                >
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Divider height={1} className="opacity-50" />
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push("/vendor/product/new")}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-system-blue-light items-center justify-center shadow-lg shadow-blue-900/30"
      >
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
      
      {isLoading && !refreshing && (
        <View className="absolute inset-0 bg-white/50 items-center justify-center">
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}
