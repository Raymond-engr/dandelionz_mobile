import {
    PasswordCriteria,
    validatePassword,
} from "@/components/password-criteria";
import { Colors } from "@/constants/theme";
import { useResetPasswordMutation } from "@/lib/api/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ForgotPasswordConfirmScreen() {
  const router = useRouter();
  const { uid, token } = useLocalSearchParams<{ uid: string; token: string }>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const v = validatePassword(password);
    if (!v.length || !v.uppercase || !v.lowercase || !v.special) {
      setError("Password does not meet all requirements");
      return;
    }
    try {
      const res = await resetPassword({
        uid,
        token,
        new_password: password,
        confirm_password: confirmPassword,
      }).unwrap();
      if (res.success) router.replace("/(auth)/login");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          "Failed to reset password. The link may have expired.",
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password below.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.field}>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <Text style={styles.eyeBtn}>{showPassword ? "🙈" : "👁"}</Text>
            </Pressable>
          </View>
          <View style={styles.underline} />
          {password.length > 0 && <PasswordCriteria password={password} />}
        </View>

        <View style={styles.field}>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
              placeholder="Confirm New Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
              <Text style={styles.eyeBtn}>{showConfirm ? "🙈" : "👁"}</Text>
            </Pressable>
          </View>
          <View style={styles.underline} />
        </View>

        <Pressable
          onPress={handleSubmit}
          style={[styles.button, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff" },
  inner: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  error: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  field: { marginBottom: 24 },
  input: { fontSize: 16, color: "#111827", paddingVertical: 10 },
  passwordWrap: { flexDirection: "row", alignItems: "center" },
  underline: { borderBottomWidth: 1, borderBottomColor: "#D1D5DB" },
  eyeBtn: { fontSize: 18, paddingHorizontal: 4 },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
