import { Colors } from "@/constants/theme";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const SORT_OPTIONS = [
  { value: "", label: "Newly Updated" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
  { value: "-name", label: "Name: Z-A" },
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home_appliances", label: "Home Appliances" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "automotive", label: "Automotive" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys & Games" },
  { value: "groceries", label: "Groceries" },
  { value: "computers", label: "Computers & Accessories" },
  { value: "phones", label: "Phones & Tablets" },
  { value: "jewelry", label: "Jewelry & Watches" },
  { value: "baby", label: "Baby Products" },
  { value: "pets", label: "Pet Supplies" },
  { value: "office", label: "Office Products" },
  { value: "gaming", label: "Video Games & Consoles" },
];

interface Filters {
  min_price?: number;
  max_price?: number;
  price?: number;
  ordering?: string;
  category?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (f: Filters) => void;
  initialFilters?: Filters;
}

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: Props) {
  const [minPrice, setMinPrice] = useState(
    String(initialFilters.min_price ?? ""),
  );
  const [maxPrice, setMaxPrice] = useState(
    String(initialFilters.max_price ?? ""),
  );
  const [price, setPrice] = useState(String(initialFilters.price ?? ""));
  const [ordering, setOrdering] = useState(initialFilters.ordering ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters.category ?? "",
  );
  const [searchCategory, setSearchCategory] = useState("");

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.label.toLowerCase().includes(searchCategory.toLowerCase()),
  );

  const apply = () => {
    onApply({
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      price: price ? Number(price) : undefined,
      ordering: ordering || undefined,
      category: selectedCategory || undefined,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min price"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.to}>to</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max price"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setOrdering(opt.value)}
                style={styles.radioRow}
              >
                <View
                  style={[
                    styles.radio,
                    ordering === opt.value && styles.radioActive,
                  ]}
                >
                  {ordering === opt.value && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable onPress={apply} style={styles.applyBtn}>
            <Text style={styles.applyText}>Apply Filter</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  closeBtn: { fontSize: 18, color: "#6B7280" },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  to: { color: "#6B7280", fontSize: 14 },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioLabel: { fontSize: 14, color: "#374151" },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    gap: 12,
  },
  applyBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
