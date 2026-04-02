import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import {
  useGetStoreProductDetailsQuery,
  useUpdateStoreProductMutation,
  useGetDraftDetailsQuery,
  useUpdateDraftMutation,
} from "@/lib/api/vendorApi";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Home & Garden",
  "Beauty",
  "Food & Beverages",
  "Other",
];

type FormData = {
  name: string;
  description: string;
  category: string;
  tags: string;
  images: string[];
  price: string;
  discounted_price: string;
  stock: string;
  is_in_store: boolean;
};

export default function EditProductScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDraft = type === "draft";
  
  // Queries for either store or draft
  const { data: storeResponse, isLoading: fetchingStore } = useGetStoreProductDetailsQuery(
    id ?? "", { skip: isDraft }
  );
  const { data: draftResponse, isLoading: fetchingDraft } = useGetDraftDetailsQuery(
    id ?? "", { skip: !isDraft }
  );

  // Mutations for either store or draft
  const [updateStoreProduct, { isLoading: savingStore }] = useUpdateStoreProductMutation();
  const [updateDraftProduct, { isLoading: savingDraft }] = useUpdateDraftMutation();

  const response = isDraft ? draftResponse : storeResponse;
  const fetching = isDraft ? fetchingDraft : fetchingStore;
  const saving = isDraft ? savingDraft : savingStore;

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    tags: "",
    images: [],
    price: "",
    discounted_price: "",
    stock: "",
    is_in_store: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = response?.data;
    if (p) {
      setForm({
        name: p.name ?? "",
        description: p.description ?? "",
        category: p.category ?? "",
        tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags ?? ""),
        images: p.images?.map((img: any) => img.image_url ?? img) ?? [],
        price: p.price?.toString() ?? "",
        discounted_price: p.discounted_price?.toString() ?? "",
        stock: p.stock?.toString() ?? "",
        is_in_store: p.publish_status === "PUBLISHED",
      });
    }
  }, [response]);

  const set = (key: keyof FormData, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      set("images", [...form.images, ...uris].slice(0, 5));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.price || isNaN(parseFloat(form.price)))
      e.price = "Enter a valid price.";
    if (!form.stock || isNaN(parseInt(form.stock)))
      e.stock = "Enter a valid stock quantity.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("category", form.category);
      payload.append("price", form.price);
      payload.append("stock", form.stock);
      
      if (form.discounted_price) {
        payload.append("discounted_price", form.discounted_price);
      }
      
      payload.append("publish_status", form.is_in_store ? "PUBLISHED" : "DRAFT");

      form.images.forEach((uri) => {
        if (uri.startsWith('http')) {
           payload.append("existing_images", uri);
        } else {
          const filename = uri.split("/").pop() || "product.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image";
          // @ts-ignore
          payload.append("images", { uri, name: filename, type });
        }
      });

      if (isDraft) {
        await updateDraftProduct({
          slug: id!,
          data: payload as any,
        }).unwrap();
      } else {
        await updateStoreProduct({
          slug: id!,
          data: payload as any,
        }).unwrap();
      }
      
      Alert.alert("Success", "Product updated successfully!");
      router.back();
    } catch (err: any) {
      setErrors({ submit: err?.data?.message ?? "Failed to save product." });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
        {isDraft ? 'Edit Draft' : 'Edit Product'}
      </Text>
      <View className="w-10" />
    </View>
  );

  if (fetching) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <Divider />

        <ScrollView
          className="flex-1 px-[21px]"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {errors.submit && (
            <View className="bg-red-50 p-4 rounded-[12px] mb-6 border border-red-100 mt-4">
              <Text className="text-red-600 text-[13px]">{errors.submit}</Text>
            </View>
          )}

          <View className="mt-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Product Name *</Text>
            <TextInput
              className={`border-b border-gray-200 py-3 text-[16px] text-system-blue-dark ${errors.name ? 'border-red-500' : ''}`}
              value={form.name}
              onChangeText={(v) => set("name", v)}
              placeholder="e.g. Premium Cotton T-Shirt"
            />
            {errors.name && <Text className="text-red-500 text-[11px] mt-1">{errors.name}</Text>}
          </View>

          <View className="mt-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Description</Text>
            <TextInput
              className="border border-gray-200 rounded-[12px] p-4 text-[16px] text-system-blue-dark h-32"
              value={form.description}
              onChangeText={(v) => set("description", v)}
              placeholder="Tell customers about your product..."
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mt-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-3">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => set("category", cat)}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    form.category === cat ? 'bg-system-blue-light border-system-blue-light' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`text-[13px] ${form.category === cat ? 'text-white font-bold' : 'text-gray-600'}`}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="mt-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Images (Max 5)</Text>
            <View className="flex-row flex-wrap gap-3 mt-2">
              {form.images.map((uri, i) => (
                <View key={i} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-[12px] bg-gray-100" />
                  <Pressable
                    onPress={() => set("images", form.images.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 items-center justify-center border-2 border-white"
                  >
                    <MaterialIcons name="close" size={14} color="white" />
                  </Pressable>
                </View>
              ))}
              {form.images.length < 5 && (
                <Pressable 
                  onPress={pickImage}
                  className="w-20 h-20 rounded-[12px] border-2 border-dashed border-gray-200 bg-gray-50 items-center justify-center"
                >
                  <MaterialIcons name="add-a-photo" size={24} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>

          <View className="flex-row gap-4 mt-6">
            <View className="flex-1">
              <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Price (₦) *</Text>
              <TextInput
                className={`border-b border-gray-200 py-3 text-[16px] font-bold text-system-blue-dark ${errors.price ? 'border-red-500' : ''}`}
                value={form.price}
                onChangeText={(v) => set("price", v)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">Stock *</Text>
              <TextInput
                className={`border-b border-gray-200 py-3 text-[16px] font-bold text-system-blue-dark ${errors.stock ? 'border-red-500' : ''}`}
                value={form.stock}
                onChangeText={(v) => set("stock", v)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View className="mt-8 flex-row items-center justify-between bg-blue-50/30 p-4 rounded-[16px] border border-blue-100">
            <View className="flex-1 pr-4">
              <Text className="text-[16px] font-bold text-system-blue-dark">Visible in Store</Text>
              <Text className="text-[12px] text-gray-500 mt-1">Publish this product to your live store immediately</Text>
            </View>
            <Switch
              value={form.is_in_store}
              onValueChange={(v) => set("is_in_store", v)}
              trackColor={{ false: "#D1D5DB", true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View className="mt-10">
            <Button onPress={handleSave} isLoading={saving}>
              Save Changes
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
