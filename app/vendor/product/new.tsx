import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
  useCreateDraftMutation,
  useCreateStoreProductMutation,
} from "@/lib/api/vendorApi";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Home & Garden",
  "Beauty",
  "Food & Beverages",
  "Other",
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row items-center justify-center w-full px-10 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              i < current ? "bg-system-blue-light" : "bg-gray-200"
            }`}
          >
            {i < current - 1 ? (
              <MaterialIcons name="check" size={16} color="white" />
            ) : (
              <Text
                className={`text-[12px] font-bold ${i === current - 1 ? "text-white" : "text-gray-500"}`}
              >
                {i + 1}
              </Text>
            )}
          </View>
          {i < total - 1 && (
            <View
              className={`flex-1 h-[2px] ${i < current - 1 ? "bg-system-blue-light" : "bg-gray-200"}`}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

type FormData = {
  name: string;
  description: string;
  category: string;
  tags: string;
  images: string[];
  price: string;
  discount_price: string;
  stock_quantity: string;
  is_in_store: boolean;
};

const EMPTY: FormData = {
  name: "",
  description: "",
  category: "",
  tags: "",
  images: [],
  price: "",
  discount_price: "",
  stock_quantity: "",
  is_in_store: false,
};

export default function NewProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createDraft, { isLoading: drafting }] = useCreateDraftMutation();
  const [createProduct, { isLoading: publishing }] =
    useCreateStoreProductMutation();

  const set = (key: keyof FormData, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      set("images", [...form.images, ...uris].slice(0, 5));
    }
  };

  const removeImage = (i: number) =>
    set(
      "images",
      form.images.filter((_, idx) => idx !== i),
    );

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.category) e.category = "Select a category.";
    if (form.images.length === 0) e.images = "Add at least one image.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.price || isNaN(parseFloat(form.price)))
      e.price = "Enter a valid price.";
    if (!form.stock_quantity || isNaN(parseInt(form.stock_quantity)))
      e.stock_quantity = "Enter a valid quantity.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleSave = async (isPublish: boolean) => {
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("category", form.category);
      payload.append("price", form.price);
      payload.append("stock", form.stock_quantity);

      if (form.discount_price) {
        payload.append("discounted_price", form.discount_price);
      }

      form.images.forEach((uri) => {
        const filename = uri.split("/").pop() || "product.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";
        // @ts-ignore
        payload.append("images", { uri, name: filename, type });
      });

      if (isPublish) {
        await createProduct(payload).unwrap();
      } else {
        await createDraft(payload).unwrap();
      }

      Toast.show({
        type: "success",
        text1: isPublish ? "Product published!" : "Draft saved!",
      });
      router.replace("/vendor/(tabs)/products");
    } catch (err: any) {
      setErrors({ submit: err?.data?.message ?? "Failed to save product." });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable
        onPress={() => (step === 1 ? router.back() : setStep(step - 1))}
        className="w-10"
      >
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
        {step === 1 ? "Add Product" : step === 2 ? "Pricing" : "Preview"}
      </Text>
      <View className="w-10" />
    </View>
  );

  const isBusy = drafting || publishing;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <Divider />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-6">
            <StepIndicator current={step} total={3} />
          </View>

          <View className="px-[21px]">
            {errors.submit && (
              <View className="bg-red-50 p-4 rounded-[12px] mb-6 border border-red-100">
                <Text className="text-red-600 text-[13px]">
                  {errors.submit}
                </Text>
              </View>
            )}

            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <>
                <View className="mb-6">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">
                    Product Name *
                  </Text>
                  <TextInput
                    className={`border-b border-gray-200 py-3 text-[16px] text-system-blue-dark ${errors.name ? "border-red-500" : ""}`}
                    value={form.name}
                    onChangeText={(v) => set("name", v)}
                    placeholder="e.g. Summer Floral Dress"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">
                    Description *
                  </Text>
                  <TextInput
                    className={`border border-gray-200 rounded-[12px] p-4 text-[16px] text-system-blue-dark h-32 ${errors.description ? "border-red-500" : ""}`}
                    value={form.description}
                    onChangeText={(v) => set("description", v)}
                    placeholder="Describe your product in detail..."
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-3">
                    Category *
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    {CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => set("category", cat)}
                        className={`px-4 py-2 rounded-full mr-2 border ${
                          form.category === cat
                            ? "bg-system-blue-light border-system-blue-light"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-[13px] ${form.category === cat ? "text-white font-bold" : "text-gray-600"}`}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View className="mb-6">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">
                    Images * (Max 5)
                  </Text>
                  <View className="flex-row flex-wrap gap-3 mt-2">
                    {form.images.map((uri, i) => (
                      <View key={i} className="relative">
                        <Image
                          source={{ uri }}
                          className="w-20 h-20 rounded-[12px] bg-gray-100"
                        />
                        <Pressable
                          onPress={() => removeImage(i)}
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
                        <MaterialIcons
                          name="add-a-photo"
                          size={24}
                          color="#9CA3AF"
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              </>
            )}

            {/* STEP 2: Inventory */}
            {step === 2 && (
              <>
                <View className="mb-6">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">
                    Base Price (₦) *
                  </Text>
                  <TextInput
                    className={`border-b border-gray-200 py-3 text-[24px] font-bold text-system-blue-dark ${errors.price ? "border-red-500" : ""}`}
                    value={form.price}
                    onChangeText={(v) => set("price", v)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">
                    Discount Price (Optional)
                  </Text>
                  <TextInput
                    className="border-b border-gray-200 py-3 text-[18px] text-gray-500"
                    value={form.discount_price}
                    onChangeText={(v) => set("discount_price", v)}
                    placeholder="₦ 0.00"
                    keyboardType="numeric"
                  />
                </View>

                <View className="mb-10">
                  <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2">
                    Stock Quantity *
                  </Text>
                  <TextInput
                    className={`border-b border-gray-200 py-3 text-[18px] text-system-blue-dark ${errors.stock_quantity ? "border-red-500" : ""}`}
                    value={form.stock_quantity}
                    onChangeText={(v) => set("stock_quantity", v)}
                    placeholder="e.g. 100"
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-row items-center justify-between bg-blue-50/30 p-4 rounded-[16px] border border-blue-100">
                  <View className="flex-1 pr-4">
                    <Text className="text-[16px] font-bold text-system-blue-dark">
                      Visible in Store
                    </Text>
                    <Text className="text-[12px] text-gray-500 mt-1">
                      Add this product to your live store immediately
                    </Text>
                  </View>
                  <Switch
                    value={form.is_in_store}
                    onValueChange={(v) => set("is_in_store", v)}
                    trackColor={{ false: "#D1D5DB", true: Colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </>
            )}

            {/* STEP 3: Preview */}
            {step === 3 && (
              <View className="bg-gray-50/50 rounded-[20px] overflow-hidden border border-gray-100">
                {form.images[0] ? (
                  <Image
                    source={{ uri: form.images[0] }}
                    className="w-full h-64 bg-gray-200"
                  />
                ) : (
                  <View className="w-full h-64 bg-gray-200 items-center justify-center">
                    <MaterialIcons name="image" size={48} color="#9CA3AF" />
                  </View>
                )}

                <View className="p-6">
                  <Text className="text-[22px] font-bold text-system-blue-dark mb-1">
                    {form.name}
                  </Text>
                  <Text className="text-[14px] text-gray-500 mb-4">
                    {form.category}
                  </Text>

                  <View className="flex-row items-baseline gap-2 mb-6">
                    <Text className="text-[24px] font-bold text-system-blue-light">
                      {formatCurrency(form.price)}
                    </Text>
                    {form.discount_price && (
                      <Text className="text-[16px] text-gray-400 line-through">
                        {formatCurrency(form.discount_price)}
                      </Text>
                    )}
                  </View>

                  <Text className="text-[14px] font-bold text-gray-400 uppercase mb-2">
                    Description
                  </Text>
                  <Text className="text-[14px] text-gray-600 leading-5 mb-6">
                    {form.description}
                  </Text>

                  <View className="flex-row justify-between py-3 border-t border-gray-100">
                    <Text className="text-gray-500">Inventory Status</Text>
                    <Text className="font-bold text-system-blue-dark">
                      {form.stock_quantity} units
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-3 border-t border-gray-100">
                    <Text className="text-gray-500">Initial Visibility</Text>
                    <Text className="font-bold text-system-blue-dark">
                      {form.is_in_store ? "Live in Store" : "Saved as Draft"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="mt-10 gap-4">
              {step < 3 ? (
                <Button onPress={handleNext}>Next Step</Button>
              ) : (
                <>
                  <Button
                    onPress={() => handleSave(true)}
                    isLoading={publishing}
                  >
                    Publish to Store
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => handleSave(false)}
                    isLoading={drafting}
                  >
                    Save as Draft
                  </Button>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
