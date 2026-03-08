import { Colors } from "@/constants/theme";
import { useGetCategoriesQuery } from "@/lib/api/publicApi";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export function CategorySlider() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  if (isLoading || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {categories.map((cat: any) => (
          <Pressable
            key={cat.id}
            onPress={() =>
              router.push(
                `/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
              )
            }
          >
            <View style={styles.card}>
              <View style={styles.imgWrap}>
                {cat.image ? (
                  <Image
                    source={{ uri: cat.image }}
                    style={styles.img}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.img, styles.imgPlaceholder]} />
                )}
              </View>
              <View style={styles.labelWrap}>
                <Text style={styles.label} numberOfLines={2}>
                  {cat.name}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scroll: { paddingHorizontal: 4, gap: 12 },
  card: {
    width: 112,
    height: 128,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imgWrap: { height: "70%", backgroundColor: "#fff" },
  img: { width: "100%", height: "100%" },
  imgPlaceholder: { backgroundColor: "#F9FAFB" },
  labelWrap: {
    height: "30%",
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
});
