import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetAllProductsQuery, useGetAllCategoriesQuery } from "@/lib/api/adminApi";
import { Feather } from "@expo/vector-icons";

type TabKey = "products" | "categories";

export default function AdminProduct() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("categories");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: categoriesData,
    isLoading: loadingCategories,
    isError: errorCategories,
    refetch: refetchCategories,
  } = useGetAllCategoriesQuery();
  const categories = categoriesData || [];

  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: errorProducts,
    refetch: refetchProducts,
  } = useGetAllProductsQuery({});
  const products = productsData?.data || [];

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchCategories()]);
    setRefreshing(false);
  }

  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCategories = categories.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading =
    activeTab === "products" ? loadingProducts : loadingCategories;
  const isError = activeTab === "products" ? errorProducts : errorCategories;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerCentered}>
        <Text style={styles.titleCentered}>Products</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#030482"
          />
        }
      >
        <View style={{ padding: 16 }}>
          <Text className="text-sm text-gray-600 mb-4">
            Manage your categories and products
          </Text>

          {/* Tabs */}
          <View style={styles.tabsUnderline}>
            {(["categories", "products"] as TabKey[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabUnderline, activeTab === tab && styles.tabActiveUnderline]}
                onPress={() => {
                  setActiveTab(tab);
                  setSearch("");
                }}
              >
                <Text
                  style={[
                    styles.tabTextUnderline,
                    activeTab === tab && styles.tabTextActiveUnderline,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "products" ? (
            <View>
              <View className="grid grid-cols-1 gap-3 mb-6">
                <View className="bg-system-blue-light rounded-lg p-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm text-white/90 mb-1">Total Products</Text>
                    <Text className="text-3xl font-bold text-white">{products.length}</Text>
                  </View>
                  <Feather name="package" size={48} color="white" style={{ opacity: 0.8 }} />
                </View>

                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 bg-green-50 rounded-lg p-3">
                    <Text className="text-[10px] text-gray-700 mb-1">Approved Products</Text>
                    <Text className="text-xl font-bold text-gray-900">{products.filter((p: any) => p.status === 'APPROVED').length}</Text>
                  </View>
                  <View className="flex-1 bg-red-50 rounded-lg p-3">
                    <Text className="text-[10px] text-gray-700 mb-1">Rejected Products</Text>
                    <Text className="text-xl font-bold text-gray-900">{products.filter((p: any) => p.status === 'REJECTED').length}</Text>
                  </View>
                </View>
                
                <View className="bg-yellow-50 rounded-lg p-3">
                  <Text className="text-[10px] text-gray-700 mb-1">Pending Products</Text>
                  <Text className="text-xl font-bold text-gray-900">{products.filter((p: any) => p.status === 'PENDING').length}</Text>
                </View>
              </View>

              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-gray-900">Products</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => router.push("/(admin)/product/new")} className="bg-system-blue-light p-2 rounded-lg">
                    <Feather name="plus" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Feather name="filter" size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>
              </View>

              {isLoading ? (
                <ActivityIndicator size="large" color="#030482" />
              ) : (
                <View>
                  {filteredProducts.map((item: any) => (
                    <TouchableOpacity
                      key={item.slug}
                      style={styles.rowProduct}
                      onPress={() => router.push(`/(admin)/product/${item.slug}`)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-gray-900">{item.name}</Text>
                          <Text className="text-[10px] text-gray-600">{item.vendor?.store_name || 'N/A'}</Text>
                          <Text className="text-[10px] text-gray-600">{item.category}</Text>
                        </View>
                        <View className="items-end gap-2">
                          <View className={`px-2 py-1 rounded-full ${
                            item.status === 'APPROVED' ? 'bg-green-100' : 
                            item.status === 'REJECTED' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            <Text className={`text-[10px] font-medium ${
                              item.status === 'APPROVED' ? 'text-green-700' : 
                              item.status === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-bold text-gray-900">
                          ₦{parseFloat(item.price).toLocaleString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-gray-900">Categories</Text>
                <TouchableOpacity onPress={() => router.push("/(admin)/product/category/new/edit")} className="bg-system-blue-light p-2 rounded-lg">
                  <Feather name="plus" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <ActivityIndicator size="large" color="#030482" />
              ) : (
                <View>
                  {filteredCategories.map((item: any) => (
                    <TouchableOpacity
                      key={item.slug}
                      style={styles.rowProduct}
                      onPress={() => router.push(`/(admin)/product/category/${item.slug}/edit`)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-sm font-semibold text-gray-900">{item.name}</Text>
                          <Text className="text-[10px] text-gray-600">{item.product_count || 0} products</Text>
                        </View>
                        <View className="flex-row gap-2">
                           <TouchableOpacity onPress={() => router.push(`/(admin)/product/category/${item.slug}/edit`)}>
                              <Feather name="edit-2" size={18} color="#030482" />
                           </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  headerCentered: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  titleCentered: { fontSize: 18, fontWeight: "600", color: "#111827" },
  tabsUnderline: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tabUnderline: {
    paddingBottom: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActiveUnderline: {
    borderBottomColor: "#030482",
  },
  tabTextUnderline: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActiveUnderline: {
    color: "#030482",
  },
  rowProduct: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  tabActive: { backgroundColor: "#16a34a" },
  tabText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  tabTextActive: { color: "#ffffff" },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  search: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbPlaceholder: { backgroundColor: "#e5e7eb" },
  rowContent: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  rowSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  rowTag: {
    marginTop: 4,
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "500",
  },
  error: { textAlign: "center", color: "#ef4444", marginTop: 40 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40 },
});