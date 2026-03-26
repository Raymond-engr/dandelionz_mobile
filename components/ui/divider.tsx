import React from "react";
import { View, ViewProps } from "react-native";

interface DividerProps extends ViewProps {
  height?: number;
  className?: string;
}

export function Divider({ height = 11, className = "", ...props }: DividerProps) {
  return (
    <View
      className={`bg-system-divider w-full ${className}`}
      style={[{ height }, props.style]}
      {...props}
    />
  );
}
