import {
    PasswordCriteria,
    validatePassword,
} from "@/components/password-criteria";
import { Colors } from "@/constants/theme";
import { useRegisterMutation } from "@/lib/api/authApi";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const ROLES = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    referral_code: "",
  });
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    setError("");
    const {
      first_name,
      last_name,
      email,
      phone_number,
      password,
      confirm_password,
      referral_code,
    } = form;
    if (!first_name || !last_name || !email || !password || !confirm_password) {
      setError("Please fill in all required fields");
      return;
    }
    if (password !== confirm_password) {
      setError("Passwords do not match");
      return;
    }
    const v = validatePassword(password);
    if (!v.length || !v.uppercase || !v.lowercase || !v.special) {
      setError("Password does not meet all requirements");
      return;
    }
    try {
      const res = await register({
        first_name,
        last_name,
        email,
        phone_number,
        password,
        confirm_password,
        role: role.toUpperCase(),
        ...(referral_code ? { referral_code } : {}),
      }).unwrap();
      if (res.success) router.replace("/(auth)/verify-notice");
    } catch (err: any) {
      setError(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Create Account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Role selector */}
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[
                  styles.roleBtn,
                  role === r.value && styles.roleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === r.value && styles.roleTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fields */}
          {[
            { key: "first_name", placeholder: "First Name" },
            { key: "last_name", placeholder: "Last Name" },
            {
              key: "email",
              placeholder: "Email Address",
              type: "email-address" as const,
            },
            {
              key: "phone_number",
              placeholder: "Phone Number (optional)",
              type: "phone-pad" as const,
            },
          ].map(({ key, placeholder, type }) => (
            <View key={key} style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                value={(form as any)[key]}
                onChangeText={set(key)}
                keyboardType={type}
                autoCapitalize={key === "email" ? "none" : "words"}
              />
            </View>
          ))}

          <View style={styles.field}>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={form.password}
                onChangeText={set("password")}
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
            {form.password.length > 0 && (
              <PasswordCriteria password={form.password} />
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={form.confirm_password}
                onChangeText={set("confirm_password")}
                secureTextEntry={!showConfirm}
              />
              <Pressable
                onPress={() => setShowConfirm(!showConfirm)}
                hitSlop={8}
              >
                <Text style={styles.eyeBtn}>{showConfirm ? "🙈" : "👁"}</Text>
              </Pressable>
            </View>
            <View style={styles.underline} />
          </View>

          {role === "customer" && (
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Referral Code (optional)"
                placeholderTextColor="#9CA3AF"
                value={form.referral_code}
                onChangeText={set("referral_code")}
                autoCapitalize="characters"
              />
            </View>
          )}

          <Pressable
            onPress={handleRegister}
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff" },
  inner: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
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
  roleRow: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  roleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
  roleTextActive: { color: Colors.primary, fontWeight: "700" },
  field: { marginBottom: 24 },
  input: {
    fontSize: 16,
    color: "#111827",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  passwordWrap: { flexDirection: "row", alignItems: "center" },
  underline: { borderBottomWidth: 1, borderBottomColor: "#D1D5DB" },
  eyeBtn: { fontSize: 18, paddingHorizontal: 4 },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
});
