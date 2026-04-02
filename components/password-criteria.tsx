import React from "react";
import { Text, View } from "react-native";

export const validatePassword = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  special: /[\d!@#$%^&*()_+={}\[\]|:;"'<>,.?/\-]/.test(password),
});

function CriteriaItem({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5 w-[48%] mb-2">
      <View className={`w-1.5 h-1.5 rounded-full ${isValid ? "bg-green-500" : "bg-gray-300"}`} />
      <Text className={`text-[12px] ${isValid ? "text-green-600" : "text-[#6B7280]"}`}>{label}</Text>
    </View>
  );
}

export function PasswordCriteria({ password }: { password: string }) {
  const c = validatePassword(password);
  return (
    <View className="flex-row flex-wrap mt-2">
      <CriteriaItem label="At least 8 characters" isValid={c.length} />
      <CriteriaItem label="One uppercase letter" isValid={c.uppercase} />
      <CriteriaItem label="One lowercase letter" isValid={c.lowercase} />
      <CriteriaItem label="Number or special character" isValid={c.special} />
    </View>
  );
}
