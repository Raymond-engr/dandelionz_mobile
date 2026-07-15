import React from "react";
import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenProps extends ViewProps {
  top?: boolean;
  bottom?: boolean;
}

/**
 * Full-screen wrapper that applies top and bottom safe-area insets.
 *
 * Use this as the outermost View on any non-scrollable screen.
 * For scrollable screens, keep top=true (default) but pass bottom={false}
 * and apply `paddingBottom: insets.bottom` on the ScrollView's
 * contentContainerStyle instead, so content can scroll out from under
 * the system navigation bar.
 */
export function Screen({ children, style, top = true, bottom = true, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "#fff",
          paddingTop: top ? insets.top : 0,
          paddingBottom: bottom ? insets.bottom : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
