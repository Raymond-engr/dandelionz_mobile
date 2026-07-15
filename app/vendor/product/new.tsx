import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetAllCategoriesQuery } from "@/lib/api/adminApi";
import {
  useCreateDraftMutation,
  useSubmitDraftMutation,
} from "@/lib/api/vendorApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
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

type Step = "basic" | "inventory" | "preview";

export default function VendorNewProduct() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: categories = [] } = useGetAllCategoriesQuery();
  const [createDraft, { isLoading: isSavingDraft }] = useCreateDraftMutation();
  const [submitDraft, { isLoading: isSubmitting }] = useSubmitDraftMutation();

  const [step, setStep] = React.useState<Step>("basic");
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    images: [] as string[],
    stock: "10",
    price: "",
    discount: "0",
    tags: "",
    variants: { colors: [] as string[], sizes: [] as string[] },
    variant_stock: { colors: {} as Record<string, number>, sizes: {} as Record<string, number> },
  });

  const COLORS = ['White', 'Black', 'Green', 'Blue', 'Red', 'Yellow'];
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  const toggleColor = (color: string) => {
    const isSelected = form.variants.colors.includes(color);
    const newColors = isSelected ? form.variants.colors.filter(c => c !== color) : [...form.variants.colors, color];
    const newColorStock = { ...form.variant_stock.colors };
    if (isSelected) delete newColorStock[color];
    setForm(f => ({ ...f, variants: { ...f.variants, colors: newColors }, variant_stock: { ...f.variant_stock, colors: newColorStock } }));
  };

  const toggleSize = (size: string) => {
    const isSelected = form.variants.sizes.includes(size);
    const newSizes = isSelected ? form.variants.sizes.filter(s => s !== size) : [...form.variants.sizes, size];
    const newSizeStock = { ...form.variant_stock.sizes };
    if (isSelected) delete newSizeStock[size];
    setForm(f => ({ ...f, variants: { ...f.variants, sizes: newSizes }, variant_stock: { ...f.variant_stock, sizes: newSizeStock } }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setForm((f) => ({ ...f, images: [...f.images, ...uris].slice(0, 5) }));
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleProceed = () => {
    if (step === "basic") {
      if (!form.name || !form.description || !form.category || form.images.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: !form.name
            ? "Please enter a product name"
            : !form.description
              ? "Please add a product description"
              : !form.category
                ? "Please select a category"
                : "Please add at least one image",
        });
        return;
      }
      setStep("inventory");
    } else if (step === "inventory") {
      if (!form.price || !form.stock) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill price and stock",
        });
        return;
      }
      setStep("preview");
    }
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("brand", form.brand);
    formData.append("tags", form.tags);
    formData.append("discount", String(parseInt(form.discount || "0", 10) || 0));

    form.images.forEach((uri, index) => {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

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

    formData.append("publish_status", "draft");

    if (form.variants.colors.length > 0 || form.variants.sizes.length > 0) {
      formData.append("variants", JSON.stringify(form.variants));
    }
    const hasVariantStock =
      Object.keys(form.variant_stock.colors).length > 0 ||
      Object.keys(form.variant_stock.sizes).length > 0;
    if (hasVariantStock) {
      formData.append("variant_stock", JSON.stringify(form.variant_stock));
    }

    return formData;
  };

  const handleSaveDraft = async () => {
    try {
      await createDraft(buildFormData()).unwrap();
      Toast.show({ type: "success", text1: "Product saved as draft" });
      router.replace("/vendor/(tabs)/products");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to save draft"),
      });
    }
  };

  const handlePublish = async () => {
    let draftSlug: string | null = null;
    try {
      const res = await createDraft(buildFormData()).unwrap();
      const slug = (res as any)?.data?.slug;
      if (!slug) throw new Error("Server did not return a product slug");
      draftSlug = slug;
      await submitDraft(slug).unwrap();
      Toast.show({ type: "success", text1: "Product published successfully" });
      router.replace("/vendor/(tabs)/products");
    } catch (err: any) {
      if (draftSlug) {
        Toast.show({
          type: "error",
          text1: "Saved as draft",
          text2: `Could not publish: ${apiError(err, "Please try again")}`,
        });
        router.replace("/vendor/(tabs)/products");
      } else {
        Toast.show({
          type: "error",
          text1: "Could not publish",
          text2: apiError(err, "Failed to publish product"),
        });
      }
    }
  };

  const handleDelete = () => {
    Alert.alert("Discard", "Are you sure you want to discard this product?", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-[21px] py-6">
          <TouchableOpacity
            onPress={() =>
              step === "basic"
                ? router.back()
                : setStep(step === "preview" ? "inventory" : "basic")
            }
          >
            <Feather name="chevron-left" size={32} color="#030482" />
          </TouchableOpacity>
          <Text className="text-[18px] font-semibold text-system-blue-light">
            {step === "basic"
              ? "Add New Product"
              : step === "inventory"
                ? "Inventory & Pricing"
                : "Preview"}
          </Text>
          <View className="w-6" />
        </View>

        <Divider />

        {/* Progress Bar */}
        <View className="flex-row h-1 bg-[#F5F7FA]">
          <View
            className="h-full bg-system-blue-light"
            style={{
              width:
                step === "basic"
                  ? "33%"
                  : step === "inventory"
                    ? "66%"
                    : "100%",
            }}
          />
        </View>

        <ScrollView
          className="flex-1 px-[21px]"
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {step === "basic" && (
            <View className="mt-6 gap-6">
              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                  Product Name
                </Text>
                <TextInput
                  className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
                  placeholder="Enter Product Name"
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                />
              </View>

              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                  Description
                </Text>
                <TextInput
                  className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6] h-32"
                  placeholder="Describe your product..."
                  multiline
                  textAlignVertical="top"
                  value={form.description}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, description: v }))
                  }
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                    Category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    {categories.map((cat: any) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() =>
                          setForm((f) => ({ ...f, category: cat.slug }))
                        }
                        className={`mr-2 px-4 py-2 rounded-full border ${form.category === cat.slug ? "bg-system-blue-light border-system-blue-light" : "bg-white border-gray-200"}`}
                      >
                        <Text
                          className={`text-[12px] ${form.category === cat.slug ? "text-white" : "text-gray-600"}`}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                  Images (Max 5)
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {form.images.map((uri, idx) => (
                    <View
                      key={idx}
                      className="w-20 h-20 rounded-lg overflow-hidden relative bg-gray-100"
                    >
                      <Image source={{ uri }} className="w-full h-full" />
                      <TouchableOpacity
                        onPress={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {form.images.length < 5 && (
                    <TouchableOpacity
                      onPress={pickImage}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                    >
                      <Ionicons
                        name="camera-outline"
                        size={24}
                        color="#9CA3AF"
                      />
                      <Text className="text-[10px] text-[#9CA3AF] mt-1">
                        Add
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Button onPress={handleProceed} className="mt-4">
                Proceed
              </Button>
            </View>
          )}

          {step === "inventory" && (
            <View className="mt-6 gap-6">
              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                  Price (₦)
                </Text>
                <TextInput
                  className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
                />
              </View>

              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                  Stock Quantity
                </Text>
                <TextInput
                  className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
                  placeholder="10"
                  keyboardType="numeric"
                  value={form.stock}
                  onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))}
                />
              </View>

              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-2">
                  Discount (%)
                </Text>
                <TextInput
                  className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]"
                  placeholder="0"
                  keyboardType="number-pad"
                  maxLength={3}
                  value={form.discount}
                  onChangeText={(v) => {
                    const digits = v.replace(/[^0-9]/g, "");
                    if (digits === "") return setForm((f) => ({ ...f, discount: "" }));
                    const n = Math.min(100, parseInt(digits, 10));
                    setForm((f) => ({ ...f, discount: String(n) }));
                  }}
                />
              </View>

              {/* Variants */}
              <View>
                <Text className="text-[14px] font-semibold text-system-blue-dark mb-3">
                  Variants (Optional)
                </Text>

                <Text className="text-[12px] text-gray-500 mb-2">Colors</Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => toggleColor(color)}
                      className={`px-4 py-2 rounded-full border ${form.variants.colors.includes(color) ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-[12px] ${form.variants.colors.includes(color) ? 'text-white' : 'text-gray-600'}`}>{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.variants.colors.length > 0 && (
                  <View className="mb-4 gap-2">
                    <Text className="text-[12px] text-gray-500">Stock per Color (Optional)</Text>
                    {form.variants.colors.map(color => (
                      <View key={color} className="flex-row items-center gap-3">
                        <Text className="text-[13px] text-gray-700 w-16">{color}</Text>
                        <TextInput
                          className="flex-1 bg-[#F9FAFB] px-3 py-2 rounded-xl border border-[#F3F4F6]"
                          keyboardType="numeric"
                          value={form.variant_stock.colors[color]?.toString() ?? ''}
                          onChangeText={(v) => {
                            const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                            setForm(f => ({ ...f, variant_stock: { ...f.variant_stock, colors: { ...f.variant_stock.colors, [color]: Number.isNaN(n) ? 0 : n } } }));
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
                      className={`px-4 py-2 rounded-lg border ${form.variants.sizes.includes(size) ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-[12px] ${form.variants.sizes.includes(size) ? 'text-white' : 'text-gray-600'}`}>{size}</Text>
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
                      className={`px-3 py-2 rounded-lg border ${form.variants.sizes.includes(size) ? 'bg-system-blue-light border-system-blue-light' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-[12px] ${form.variants.sizes.includes(size) ? 'text-white' : 'text-gray-600'}`}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {form.variants.sizes.some(s => CLOTHING_SIZES.includes(s)) && form.variants.sizes.some(s => SHOE_SIZES.includes(s)) && (
                  <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                    <Text className="text-[12px] text-amber-700">Tip: Most products use one size type. Select both only if your product genuinely comes in both clothing and shoe sizes.</Text>
                  </View>
                )}

                {form.variants.sizes.length > 0 && (
                  <View className="gap-2">
                    <Text className="text-[12px] text-gray-500">Stock per Size (Optional)</Text>
                    {form.variants.sizes.map(size => (
                      <View key={size} className="flex-row items-center gap-3">
                        <Text className="text-[13px] text-gray-700 w-16">{size}</Text>
                        <TextInput
                          className="flex-1 bg-[#F9FAFB] px-3 py-2 rounded-xl border border-[#F3F4F6]"
                          keyboardType="numeric"
                          value={form.variant_stock.sizes[size]?.toString() ?? ''}
                          onChangeText={(v) => {
                            const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                            setForm(f => ({ ...f, variant_stock: { ...f.variant_stock, sizes: { ...f.variant_stock.sizes, [size]: Number.isNaN(n) ? 0 : n } } }));
                          }}
                          placeholder="0"
                        />
                        <Text className="text-[12px] text-gray-400">units</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Button onPress={handleProceed} className="mt-4">
                Review Product
              </Button>
            </View>
          )}

          {step === "preview" && (
            <View className="mt-6 gap-6">
              <View className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                {form.images[0] ? (
                  <Image
                    source={{ uri: form.images[0] }}
                    className="w-full aspect-square"
                  />
                ) : (
                  <View className="w-full aspect-square bg-gray-200 items-center justify-center">
                    <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                  </View>
                )}
                <View className="p-4">
                  <Text className="text-[20px] font-bold text-system-blue-dark">
                    {form.name}
                  </Text>
                  <Text className="text-[14px] text-[#6B7280] mt-1">
                    {form.category}
                  </Text>
                  <View className="flex-row items-center mt-3 gap-3">
                    <Text className="text-[22px] font-bold text-system-blue-light">
                      {formatCurrency(form.price)}
                    </Text>
                    {parseFloat(form.discount || "0") > 0 && (
                      <View className="bg-red-50 px-2 py-1 rounded-lg">
                        <Text className="text-system-red text-[12px] font-bold">
                          -{form.discount}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View className="bg-white p-4 rounded-xl border border-gray-100">
                <Text className="text-[14px] font-bold text-system-blue-dark mb-2">
                  Description
                </Text>
                <Text className="text-[14px] text-[#6B7280] leading-[22px]">
                  {form.description}
                </Text>
              </View>

              <View className="flex-row gap-4 mt-4">
                <TouchableOpacity
                  onPress={handleDelete}
                  className="w-14 h-[55px] bg-red-50 rounded-[12px] items-center justify-center border border-red-100"
                >
                  <Ionicons name="trash-outline" size={24} color="#FF4D4D" />
                </TouchableOpacity>
                <View className="flex-1">
                  <Button
                    variant="outline"
                    onPress={handleSaveDraft}
                    isLoading={isSavingDraft}
                  >
                    Save Draft
                  </Button>
                </View>
              </View>

              <Button
                onPress={handlePublish}
                isLoading={isSubmitting || isSavingDraft}
              >
                Publish Product
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
