import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useGetAllCategoriesQuery } from "@/lib/api/adminApi";
import {
  useCreateDraftMutation,
  useSubmitDraftMutation,
} from "@/lib/api/vendorApi";
import { formatCurrency } from "@/lib/utils";
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
  });

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
      if (!form.name || !form.category || form.images.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill name, category and add at least one image",
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
    formData.append("discount", form.discount);

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
        text2: err?.data?.message || "Failed to save draft",
      });
    }
  };

  const handlePublish = async () => {
    try {
      const res = await createDraft(buildFormData()).unwrap();
      const slug = (res as any).data?.slug;
      if (slug) {
        await submitDraft(slug).unwrap();
        Toast.show({
          type: "success",
          text1: "Product published successfully",
        });
        router.replace("/vendor/(tabs)/products");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.data?.message || "Failed to publish product",
      });
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
          contentContainerStyle={{ paddingBottom: 100 }}
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
                  keyboardType="numeric"
                  value={form.discount}
                  onChangeText={(v) => setForm((f) => ({ ...f, discount: v }))}
                />
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
