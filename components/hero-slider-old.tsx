import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const SLIDE_WIDTH = width * 0.85;

const slides = [
  require("@/assets/images/slider1.png"),
  require("@/assets/images/slider2.png"),
  require("@/assets/images/slider3.png"),
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * SLIDE_WIDTH, animated: true });
        return next;
      });
    }, 3000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    scrollRef.current?.scrollTo({ x: index * SLIDE_WIDTH, animated: true });
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {slides.map((src, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.imageWrap}>
              <Image source={src} style={styles.image} contentFit="cover" />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <Pressable key={i} onPress={() => goTo(i)}>
            <View style={[styles.dot, i === current && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  slide: { width: SLIDE_WIDTH, paddingRight: 8 },
  imageWrap: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  dotActive: { width: 24, backgroundColor: Colors.primary },
});
