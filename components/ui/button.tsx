import { Colors } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  View,
} from "react-native";

interface ButtonProps extends PressableProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center gap-2 rounded-[12px] font-semibold h-[55px]";
  
  const variants = {
    primary: "bg-system-blue-light text-white",
    secondary: "bg-[#F5F7FA] text-system-blue-dark",
    outline: "border border-system-blue-light bg-transparent text-system-blue-light",
    ghost: "bg-transparent text-system-blue-dark",
    destructive: "bg-system-red text-white",
  };

  const textStyles = {
    primary: "text-white font-semibold text-[16px]",
    secondary: "text-system-blue-dark font-semibold text-[16px]",
    outline: "text-system-blue-light font-semibold text-[16px]",
    ghost: "text-system-blue-dark font-semibold text-[16px]",
    destructive: "text-white font-semibold text-[16px]",
  };

  return (
    <Pressable
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${disabled || isLoading ? "opacity-50" : ""} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? Colors.primary : "#fff"} />
      ) : (
        <Text className={`${textStyles[variant]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
