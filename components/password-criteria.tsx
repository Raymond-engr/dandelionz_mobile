import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const validatePassword = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  special: /[\d!@#$%^&*()_+={}\[\]|:;"'<>,.?/\-]/.test(password),
});

function CriteriaItem({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <View style={styles.item}>
      <View style={[styles.dot, isValid && styles.dotValid]} />
      <Text style={[styles.label, isValid && styles.labelValid]}>{label}</Text>
    </View>
  );
}

export function PasswordCriteria({ password }: { password: string }) {
  const c = validatePassword(password);
  return (
    <View style={styles.grid}>
      <CriteriaItem label="At least 8 characters" isValid={c.length} />
      <CriteriaItem label="One uppercase letter" isValid={c.uppercase} />
      <CriteriaItem label="One lowercase letter" isValid={c.lowercase} />
      <CriteriaItem label="Number or special character" isValid={c.special} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 6, width: "48%" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotValid: { backgroundColor: "#22C55E" },
  label: { fontSize: 12, color: "#6B7280" },
  labelValid: { color: "#16A34A" },
});
