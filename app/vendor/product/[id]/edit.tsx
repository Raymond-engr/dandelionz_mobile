import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetAllCategoriesQuery } from "@/lib/api/adminApi";
import {
  useGetStoreProductDetailsQuery,
  useGetDraftDetailsQuery,
  useCreateDraftMutation,
} from "@/lib/api/vendorApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VendorEditProduct() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDraft = type === "draft";

  const { data: storeResponse, isLoading: fetchingStore } = useGetStoreProductDetailsQuery(
    id!, { skip: isDraft }
  );
  const { data: draftResponse, isLoading: fetchingDraft } = useGetDraftDetailsQuery(
    id!, { skip: !isDraft }
  );

  const { data: categories = [] } = useGetAllCategoriesQuery();
  const [createDraft, { isLoading: isSaving }] = useCreateDraftMutation();

  const product = isDraft ? draftResponse?.data : storeResponse?.data;
  const isLoading = isDraft ? fetchingDraft : fetchingStore;

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    discount: "0",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "0",
        discount: (product as any).discount?.toString() || "0",
      });
      
      if (product.images && product.images.length > 0) {
        setImages(product.images.map((img: any) => img.image_url || img.image || img));
      } else if (product.image) {
        setImages([product.image]);
      }
    }
  }, [product]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in name and price." });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("discount", form.discount);

      // Only append new local images
      const newImages = images.filter(
        (uri) => uri.startsWith("file://") || uri.startsWith("content://"),
      );
      
      newImages.forEach((uri, index) => {
        const filename = uri.split("/").pop() ?? "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        
        formData.append(`images_data[${index}][image]`, {
          uri,
          name: filename,
          type,
        } as any);
        formData.append(
          `images_data[${index}][is_main]`,
          (index === 0).toString(),
        );
      });

      // Also send existing images that weren't removed
      const existingImages = images.filter((uri) => uri.startsWith("http"));
      existingImages.forEach((uri) => {
        formData.append("existing_images", uri);
      });

      await createDraft(formData).unwrap();
      Toast.show({ type: "success", text1: "Product updated and saved as draft." });
      router.back();
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: err?.data?.message || "Failed to update product." 
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-red-500 mb-4">Product not found.</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-[21px] py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000011" />
          </TouchableOpacity>
          <Text className="text-[18px] font-semibold text-system-blue-dark">
            {isDraft ? "Edit Draft" : "Edit Product"}
          </Text>
          <View className="w-6" />
        </View>

        <Divider />

        <ScrollView
          className="flex-1 px-[21px]"
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        >
          {/* Images */}
          <View className="mb-6">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Images
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((uri, idx) => (
                <View
                  key={idx}
                  className="w-20 h-20 rounded-lg overflow-hidden relative bg-gray-100"
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImage}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                >
                  <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                  <Text className="text-[10px] text-[#9CA3AF] mt-1">Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Name */}
          <View className="mb-5">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Product Name
            </Text>
            <TextInput
              className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Product name"
            />
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Description
            </Text>
            <TextInput
              className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6] h-28"
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Product description"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View className="mb-5">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {(categories as any[]).map((cat: any) => (
                <TouchableOpacity
                  key={cat.id || cat.slug}
                  onPress={() => setForm((f) => ({ ...f, category: cat.slug }))}
                  className={`mr-2 px-4 py-2 rounded-full border ${
                    form.category === cat.slug
                      ? "bg-system-blue-light border-system-blue-light"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[12px] ${
                      form.category === cat.slug
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price */}
          <View className="mb-5">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Price (₦)
            </Text>
            <TextInput
              className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
              value={form.price}
              onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          {/* Stock */}
          <View className="mb-5">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Stock Quantity
            </Text>
            <TextInput
              className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
              value={form.stock}
              onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          {/* Discount */}
          <View className="mb-8">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Discount (%)
            </Text>
            <TextInput
              className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
              value={form.discount}
              onChangeText={(v) => setForm((f) => ({ ...f, discount: v }))}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View className="gap-4">
            <Button onPress={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
            <Button variant="outline" onPress={() => router.back()}>
              Discard
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
