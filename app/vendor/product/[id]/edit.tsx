import { Colors } from "@/constants/theme";
import {
    useGetProductDetailsQuery,
    useUpdateProductMutation,
} from "@/lib/api/vendorApi";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  discount_price: string;
  stock_quantity: string;
  is_in_store: boolean;
};

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: response, isLoading: fetching } = useGetProductDetailsQuery(
    id ?? "",
  );
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    tags: "",
    images: [],
    price: "",
    discount_price: "",
    stock_quantity: "",
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
        discount_price: p.discount_price?.toString() ?? "",
        stock_quantity: p.stock_quantity?.toString() ?? "",
        is_in_store: p.is_in_store ?? false,
      });
    }
  }, [response]);

  const set = (key: keyof FormData, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.price || isNaN(parseFloat(form.price)))
      e.price = "Enter a valid price.";
    if (!form.stock_quantity || isNaN(parseInt(form.stock_quantity)))
      e.stock_quantity = "Enter a valid stock quantity.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setErrors({});
    try {
      await updateProduct({
        id: id!,
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
      router.back();
    } catch (err: any) {
      setErrors({ submit: err?.data?.message ?? "Failed to save product." });
    }
  };

  if (fetching) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <Pressable onPress={handleSave} disabled={saving} hitSlop={8}>
            {saving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveLink}>Save</Text>
            )}
          </Pressable>
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

          <Text style={styles.fieldLabel}>Product Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={(v) => set("name", v)}
            placeholder="Product name"
          />
          {errors.name ? (
            <Text style={styles.fieldError}>{errors.name}</Text>
          ) : null}

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.description}
            onChangeText={(v) => set("description", v)}
            placeholder="Product description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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

          <Text style={styles.fieldLabel}>Tags</Text>
          <TextInput
            style={styles.input}
            value={form.tags}
            onChangeText={(v) => set("tags", v)}
            placeholder="comma, separated, tags"
          />

          <Text style={styles.fieldLabel}>Images (up to 5)</Text>
          <View style={styles.imageRow}>
            {form.images.map((uri, i) => (
              <View key={i} style={styles.imageThumbWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <Pressable
                  onPress={() =>
                    set(
                      "images",
                      form.images.filter((_, idx) => idx !== i),
                    )
                  }
                  style={styles.removeImg}
                >
                  <Text style={styles.removeImgText}>✕</Text>
                </Pressable>
              </View>
            ))}
            {form.images.length < 5 && (
              <Pressable onPress={pickImage} style={styles.imagePicker}>
                <Text style={styles.imagePickerPlus}>+</Text>
              </Pressable>
            )}
          </View>

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
            placeholder="Optional"
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Stock Quantity *</Text>
          <TextInput
            style={[styles.input, errors.stock_quantity && styles.inputError]}
            value={form.stock_quantity}
            onChangeText={(v) => set("stock_quantity", v)}
            placeholder="0"
            keyboardType="numeric"
          />
          {errors.stock_quantity ? (
            <Text style={styles.fieldError}>{errors.stock_quantity}</Text>
          ) : null}

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.fieldLabel}>Visible in Store</Text>
              <Text style={styles.switchSubtitle}>
                Toggle off to hide from your store
              </Text>
            </View>
            <Switch
              value={form.is_in_store}
              onValueChange={(v) => set("is_in_store", v)}
              trackColor={{ false: "#D1D5DB", true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.btnDisabled]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  saveLink: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
  content: { padding: 20, paddingBottom: 60 },
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
  },
  imagePickerPlus: { fontSize: 28, color: "#9CA3AF" },
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
  switchSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  saveBtn: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
