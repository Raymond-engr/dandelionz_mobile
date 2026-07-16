import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
    useGetAdminProductDetailsQuery,
    useGetAllCategoriesQuery,
} from "@/lib/api/adminApi";
import {
    usePatchProductMutation,
} from "@/lib/api/vendorApi";
import { apiError } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function AdminEditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: productResponse, isLoading } = useGetAdminProductDetailsQuery(
    id!,
  );
  const { data: categories = [] } = useGetAllCategoriesQuery();
  const [patchProduct, { isLoading: isSaving }] = usePatchProductMutation();

  const product = productResponse?.data;

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    discount: "0",
  });
  const [images, setImages] = useState<{ id?: number; uri: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [variants, setVariants] = useState<{ colors: string[]; sizes: string[] }>({ colors: [], sizes: [] });
  const [variantStock, setVariantStock] = useState<{ colors: Record<string, number>; sizes: Record<string, number> }>({ colors: {}, sizes: {} });

  const COLORS = ['White', 'Black', 'Green', 'Blue', 'Red', 'Yellow'];
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  const toggleColor = (color: string) => {
    const isSelected = variants.colors.includes(color);
    const newColors = isSelected ? variants.colors.filter(c => c !== color) : [...variants.colors, color];
    const newColorStock = { ...variantStock.colors };
    if (isSelected) delete newColorStock[color];
    setVariants(v => ({ ...v, colors: newColors }));
    setVariantStock(vs => ({ ...vs, colors: newColorStock }));
  };

  const toggleSize = (size: string) => {
    const isSelected = variants.sizes.includes(size);
    const newSizes = isSelected ? variants.sizes.filter(s => s !== size) : [...variants.sizes, size];
    const newSizeStock = { ...variantStock.sizes };
    if (isSelected) delete newSizeStock[size];
    setVariants(v => ({ ...v, sizes: newSizes }));
    setVariantStock(vs => ({ ...vs, sizes: newSizeStock }));
  };

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: (product as any).description || "",
        category: String((product as any).category_slug || (product as any).category || ""),
        price: product.price || "",
        stock: String((product as any).stock || "0"),
        discount: String(product.discount || "0"),
      });

      const imgs = (product as any).images;
      if (imgs && imgs.length > 0) {
        setImages(imgs.map((img: any) => ({
          id: img.id,
          uri: img.image_url || img.image || img,
        })));
      } else if ((product as any).image) {
        setImages([{ uri: (product as any).image }]);
      }
      setDeletedImageIds([]);

      const pv = (product as any).variants;
      if (pv && typeof pv === 'object') {
        setVariants({ colors: pv.colors || [], sizes: pv.sizes || [] });
      }
      const pvs = (product as any).variant_stock;
      if (pvs && typeof pvs === 'object') {
        setVariantStock({ colors: pvs.colors || {}, sizes: pvs.sizes || {} });
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
      const newItems = result.assets.map((a) => ({ uri: a.uri }));
      setImages((prev) => [...prev, ...newItems].slice(0, 5));
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in name and price." });
      return;
    }
    if (form.stock.trim() === "" || Number.isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter a valid stock quantity." });
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

      const newImages = images.filter(
        (item) => item.uri.startsWith("file://") || item.uri.startsWith("content://"),
      );
      newImages.forEach((item, index) => {
        const filename = item.uri.split("/").pop() ?? "image.jpg";
        const type = filename.endsWith(".png") ? "image/png" : "image/jpeg";
        formData.append(`images_data[${index}][image]`, {
          uri: item.uri,
          name: filename,
          type,
        } as any);
        formData.append(
          `images_data[${index}][is_main]`,
          (index === 0).toString(),
        );
      });

      deletedImageIds.forEach((imageId) => {
        formData.append("delete_images", String(imageId));
      });

      if (variants.colors.length > 0 || variants.sizes.length > 0) {
        formData.append("variants", JSON.stringify(variants));
      }
      const hasVariantStock =
        Object.keys(variantStock.colors).length > 0 ||
        Object.keys(variantStock.sizes).length > 0;
      if (hasVariantStock) {
        formData.append("variant_stock", JSON.stringify(variantStock));
      }

      await patchProduct({ slug: id!, data: formData }).unwrap();
      Toast.show({ type: "success", text1: "Product updated successfully." });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to update product."),
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
            Edit Product
          </Text>
          <View className="w-6" />
        </View>

        <Divider />

        <ScrollView
          className="flex-1 px-[21px]"
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 20 }}
        >
          {/* Images */}
          <View className="mb-6">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
              Images
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((item, idx) => (
                <View
                  key={idx}
                  className="w-20 h-20 rounded-lg overflow-hidden relative bg-gray-100"
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (item.id !== undefined) {
                        setDeletedImageIds((prev) => [...prev, item.id!]);
                      }
                      setImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
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
              onChangeText={(v) => {
                const digits = v.replace(/[^0-9]/g, "");
                if (digits === "") return setForm((f) => ({ ...f, discount: "" }));
                const n = Math.min(100, parseInt(digits, 10));
                setForm((f) => ({ ...f, discount: String(n) }));
              }}
              placeholder="0"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          {/* Variants */}
          <View className="mb-8">
            <Text className="text-[14px] font-semibold text-system-blue-dark mb-3">Variants (Optional)</Text>

            <Text className="text-[12px] text-gray-500 mb-2">Colors</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => toggleColor(color)}
                  className={`px-4 py-2 rounded-full border ${variants.colors.includes(color) ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[12px] ${variants.colors.includes(color) ? 'text-white' : 'text-gray-600'}`}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {variants.colors.length > 0 && (
              <View className="mb-4 gap-2">
                <Text className="text-[12px] text-gray-500">Stock per Color (Optional)</Text>
                {variants.colors.map(color => (
                  <View key={color} className="flex-row items-center gap-3">
                    <Text className="text-[13px] text-gray-700 w-16">{color}</Text>
                    <TextInput
                      className="flex-1 bg-[#F9FAFB] px-3 py-2 rounded-xl border border-[#F3F4F6]"
                      keyboardType="numeric"
                      value={variantStock.colors[color]?.toString() ?? ''}
                      onChangeText={(v) => {
                        const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                        setVariantStock(vs => ({ ...vs, colors: { ...vs.colors, [color]: Number.isNaN(n) ? 0 : n } }));
                      }}
                      placeholder="0"
                    />
                    <Text className="text-[12px] text-gray-400">units</Text>
                  </View>
                ))}
              </View>
            )}

            <Text className="text-[12px] text-gray-500 mb-0.5">Clothing Sizes</Text>
            <Text className="text-[11px] text-gray-400 mb-2">For apparel like shirts, dresses, trousers</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CLOTHING_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  onPress={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg border ${variants.sizes.includes(size) ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[12px] ${variants.sizes.includes(size) ? 'text-white' : 'text-gray-600'}`}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-[12px] text-gray-500 mb-0.5">Shoe Sizes (EU)</Text>
            <Text className="text-[11px] text-gray-400 mb-2">For footwear like sneakers, sandals, boots</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {SHOE_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  onPress={() => toggleSize(size)}
                  className={`px-3 py-2 rounded-lg border ${variants.sizes.includes(size) ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[12px] ${variants.sizes.includes(size) ? 'text-white' : 'text-gray-600'}`}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {variants.sizes.some(s => CLOTHING_SIZES.includes(s)) && variants.sizes.some(s => SHOE_SIZES.includes(s)) && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <Text className="text-[12px] text-amber-700">Tip: Most products use one size type. Select both only if your product genuinely comes in both clothing and shoe sizes.</Text>
              </View>
            )}

            {variants.sizes.length > 0 && (
              <View className="gap-2">
                <Text className="text-[12px] text-gray-500">Stock per Size (Optional)</Text>
                {variants.sizes.map(size => (
                  <View key={size} className="flex-row items-center gap-3">
                    <Text className="text-[13px] text-gray-700 w-16">{size}</Text>
                    <TextInput
                      className="flex-1 bg-[#F9FAFB] px-3 py-2 rounded-xl border border-[#F3F4F6]"
                      keyboardType="numeric"
                      value={variantStock.sizes[size]?.toString() ?? ''}
                      onChangeText={(v) => {
                        const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                        setVariantStock(vs => ({ ...vs, sizes: { ...vs.sizes, [size]: Number.isNaN(n) ? 0 : n } }));
                      }}
                      placeholder="0"
                    />
                    <Text className="text-[12px] text-gray-400">units</Text>
                  </View>
                ))}
              </View>
            )}
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
