import { Colors } from "@/constants/theme";
import {
    useCreateDraftMutation,
    useUploadProductImageMutation,
} from "@/lib/api/vendorApi";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

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
    <View style={styles.stepRow}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <View
            style={[
              styles.stepDot,
              i < current && styles.stepDotDone,
              i === current - 1 && styles.stepDotActive,
            ]}
          >
            {i < current - 1 && (
              <Svg width={10} height={8} viewBox="0 0 10 8" fill="none">
                <Path
                  d="M1 4l3 3 5-6"
                  stroke="#fff"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
            {i === current - 1 && <View style={styles.stepDotInner} />}
          </View>
          {i < total - 1 && (
            <View
              style={[styles.stepLine, i < current - 1 && styles.stepLineDone]}
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
  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();

  const set = (key: keyof FormData, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const handleSaveDraft = async () => {
    try {
      await createDraft({
        name: form.name,
        description: form.description,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        price: parseFloat(form.price),
        discount_price: form.discount_price
          ? parseFloat(form.discount_price)
          : undefined,
        stock_quantity: parseInt(form.stock_quantity),
        is_in_store: form.is_in_store,
        images: form.images,
      }).unwrap();
      router.replace("/vendor/(tabs)/products");
    } catch (err: any) {
      setErrors({ submit: err?.data?.message ?? "Failed to save draft." });
    }
  };

  const isBusy = drafting || uploading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => (step === 1 ? router.back() : setStep(step - 1))}
            hitSlop={8}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 1
              ? "Add New Product"
              : step === 2
                ? "Inventory & Pricing"
                : "Preview"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <StepIndicator current={step} total={3} />
          <Text style={styles.stepLabel}>Step {step} of 3</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errors.submit ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.submit}</Text>
            </View>
          ) : null}

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <>
              <Text style={styles.fieldLabel}>Product Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={(v) => set("name", v)}
                placeholder="Enter product name"
              />
              {errors.name ? (
                <Text style={styles.fieldError}>{errors.name}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Description *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  errors.description && styles.inputError,
                ]}
                value={form.description}
                onChangeText={(v) => set("description", v)}
                placeholder="Describe your product"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description ? (
                <Text style={styles.fieldError}>{errors.description}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => set("category", cat)}
                    style={[
                      styles.categoryChip,
                      form.category === cat && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        form.category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {errors.category ? (
                <Text style={styles.fieldError}>{errors.category}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={form.tags}
                onChangeText={(v) => set("tags", v)}
                placeholder="e.g. summer, casual, new"
              />

              <Text style={styles.fieldLabel}>Product Images * (up to 5)</Text>
              <View style={styles.imageRow}>
                {form.images.map((uri, i) => (
                  <View key={i} style={styles.imageThumbWrapper}>
                    <Image source={{ uri }} style={styles.imageThumb} />
                    <Pressable
                      onPress={() => removeImage(i)}
                      style={styles.removeImg}
                    >
                      <Text style={styles.removeImgText}>✕</Text>
                    </Pressable>
                  </View>
                ))}
                {form.images.length < 5 && (
                  <Pressable onPress={pickImage} style={styles.imagePicker}>
                    <Text style={styles.imagePickerPlus}>+</Text>
                    <Text style={styles.imagePickerText}>Add Photo</Text>
                  </Pressable>
                )}
              </View>
              {errors.images ? (
                <Text style={styles.fieldError}>{errors.images}</Text>
              ) : null}
            </>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <>
              <Text style={styles.fieldLabel}>Price (₦) *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                value={form.price}
                onChangeText={(v) => set("price", v)}
                placeholder="0.00"
                keyboardType="numeric"
              />
              {errors.price ? (
                <Text style={styles.fieldError}>{errors.price}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Discount Price (₦)</Text>
              <TextInput
                style={styles.input}
                value={form.discount_price}
                onChangeText={(v) => set("discount_price", v)}
                placeholder="Optional — leave blank for no discount"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Stock Quantity *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.stock_quantity && styles.inputError,
                ]}
                value={form.stock_quantity}
                onChangeText={(v) => set("stock_quantity", v)}
                placeholder="e.g. 50"
                keyboardType="numeric"
              />
              {errors.stock_quantity ? (
                <Text style={styles.fieldError}>{errors.stock_quantity}</Text>
              ) : null}

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.fieldLabel}>Add to Store</Text>
                  <Text style={styles.switchSubtitle}>
                    Make this product visible in your store immediately
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

          {/* ─── STEP 3: PREVIEW ─── */}
          {step === 3 && (
            <>
              <View style={styles.previewCard}>
                {form.images[0] ? (
                  <Image
                    source={{ uri: form.images[0] }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.previewImagePlaceholder}>
                    <Text style={{ color: "#9CA3AF" }}>No image</Text>
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{form.name}</Text>
                  <Text style={styles.previewCategory}>{form.category}</Text>
                  <Text style={styles.previewPrice}>
                    ₦{parseFloat(form.price || "0").toLocaleString("en-NG")}
                    {form.discount_price ? (
                      <Text style={styles.previewDiscount}>
                        {"  "}₦
                        {parseFloat(form.discount_price).toLocaleString(
                          "en-NG",
                        )}
                      </Text>
                    ) : null}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDetail}>
                <Text style={styles.previewDetailTitle}>Description</Text>
                <Text style={styles.previewDetailText}>{form.description}</Text>
              </View>
              <View style={styles.previewDetail}>
                <Text style={styles.previewDetailTitle}>Stock</Text>
                <Text style={styles.previewDetailText}>
                  {form.stock_quantity} units
                </Text>
              </View>
              <View style={styles.previewDetail}>
                <Text style={styles.previewDetailTitle}>Visibility</Text>
                <Text style={styles.previewDetailText}>
                  {form.is_in_store ? "Visible in store" : "Saved as draft"}
                </Text>
              </View>
            </>
          )}

          {/* Footer Buttons */}
          <View style={styles.btnRow}>
            {step < 3 && (
              <Pressable onPress={handleNext} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </Pressable>
            )}
            {step === 3 && (
              <>
                <Pressable
                  onPress={handleSaveDraft}
                  disabled={isBusy}
                  style={[styles.secondaryBtn, isBusy && styles.btnDisabled]}
                >
                  {isBusy ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <Text style={styles.secondaryBtnText}>Save as Draft</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => {
                    set("is_in_store", true);
                    handleSaveDraft();
                  }}
                  disabled={isBusy}
                  style={[
                    styles.primaryBtn,
                    { flex: 1 },
                    isBusy && styles.btnDisabled,
                  ]}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Publish to Store</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40 },
  backArrow: { fontSize: 24, color: Colors.primary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  stepContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: "center",
    gap: 6,
  },
  stepRow: { flexDirection: "row", alignItems: "center", width: "70%" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotDone: { backgroundColor: Colors.primary },
  stepDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E5E7EB" },
  stepLineDone: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: 12, color: "#6B7280" },
  content: { padding: 20, paddingBottom: 40 },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  inputError: { borderColor: "#DC2626" },
  textarea: { height: 100, paddingTop: 12 },
  fieldError: { color: "#DC2626", fontSize: 12, marginTop: 4 },
  categoryScroll: { marginTop: 0 },
  categoryRow: { gap: 8, paddingVertical: 4 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: { fontSize: 13, color: "#374151" },
  categoryChipTextActive: { color: "#fff" },
  imageRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  imageThumbWrapper: { position: "relative" },
  imageThumb: { width: 80, height: 80, borderRadius: 8 },
  removeImg: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removeImgText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  imagePicker: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    gap: 2,
  },
  imagePickerPlus: { fontSize: 22, color: "#9CA3AF" },
  imagePickerText: { fontSize: 10, color: "#9CA3AF" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    maxWidth: "85%",
  },
  previewCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  previewImage: { width: 100, height: 100, borderRadius: 8 },
  previewImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  previewInfo: { flex: 1, justifyContent: "center", gap: 4 },
  previewName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  previewCategory: { fontSize: 12, color: "#6B7280" },
  previewPrice: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  previewDiscount: {
    fontSize: 13,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  previewDetail: { marginBottom: 14 },
  previewDetailTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  previewDetailText: { fontSize: 14, color: "#6B7280", lineHeight: 20 },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 28 },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 15, fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});
