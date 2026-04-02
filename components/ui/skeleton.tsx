import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ style, borderRadius = 6, className }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={[
        styles.base,
        { borderRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
});
