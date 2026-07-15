import {
    useGetCategoryQuery,
    useUpdateCategoryMutation,
    useCreateCategoryMutation,
} from "@/lib/api/adminApi";
import { apiError } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function CategoryEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const isNew = id === "new";
  
  const { data: category, isLoading, isError } = useGetCategoryQuery(id!, {
    skip: isNew,
  });
  
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (category && !isNew) {
      setName(category.name ?? "");
      setDescription(category.description ?? "");
      setExistingImageUrl(category.image ?? null);
    }
  }, [category, isNew]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ 
        type: "error", 
        text1: "Permission required", 
        text2: "Please allow photo library access to upload a category image." 
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Validation", text2: "Category name is required." });
      return;
    }
    
    if (isNew && !imageUri) {
      Toast.show({ type: "error", text1: "Validation", text2: "Category image is required for new categories." });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      
      if (imageUri) {
        const filename = imageUri.split("/").pop() ?? "image.jpg";
        const type = filename.endsWith(".png") ? "image/png" : "image/jpeg";
        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      if (isNew) {
        await createCategory(formData).unwrap();
        Toast.show({ type: "success", text1: "Category created successfully." });
        router.back();
      } else {
        await updateCategory({ slug: id!, data: formData }).unwrap();
        Toast.show({ type: "success", text1: "Category updated successfully." });
        router.back();
      }
    } catch (err: any) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: apiError(err, `Failed to ${isNew ? "create" : "update"} category.`)
      });
    }
  }

  const saving = updating || creating;

  if (isLoading && !isNew) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  if (isError && !isNew) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Category not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayImage = imageUri ?? existingImageUrl;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.headerCentered}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Feather name="chevron-left" size={32} color="#030482" />
        </TouchableOpacity>
        <Text style={styles.titleCentered}>{isNew ? 'Add New Category' : 'Edit Category'}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Image picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={40} color="#9ca3af" />
                <Text style={styles.imagePlaceholderText}>
                  Tap to upload image
                </Text>
              </View>
            )}
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>{imageUri ? "Change Image" : "Upload Image"}</Text>
            </View>
          </TouchableOpacity>

          {/* Name field */}
          <View style={styles.field}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter category name"
              placeholderTextColor="#9ca3af"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter category description"
              placeholderTextColor="#9ca3af"
              autoCorrect={false}
              multiline
            />
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{isNew ? 'Add Category' : 'Save Changes'}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.discardBtn}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.discardBtnText}>Discard</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  headerCentered: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBack: { position: "absolute", left: 16 },
  titleCentered: { fontSize: 18, fontWeight: "600", color: "#030482" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBtn: { padding: 10, backgroundColor: "#030482", borderRadius: 8, marginTop: 12 },
  backBtnText: { color: "#fff", fontWeight: "600" },
  scroll: { padding: 16, paddingBottom: 40 },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 24,
    position: "relative",
    backgroundColor: "#f9fafb",
    alignSelf: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { fontSize: 10, color: "#9ca3af", marginTop: 4, textAlign: "center" },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 4,
    alignItems: "center",
  },
  imageOverlayText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  field: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  saveBtn: {
    backgroundColor: "#030482",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  discardBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  discardBtnText: { color: "#374151", fontSize: 16, fontWeight: "600" },
  error: { color: "#ef4444" },
});
