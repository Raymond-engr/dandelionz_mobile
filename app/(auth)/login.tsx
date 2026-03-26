import { Colors } from "@/constants/theme";
import { useLoginMutation } from "@/lib/api/authApi";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.access,
            refreshToken: res.data.refresh,
          }),
        );

        // After login, redirect to the intended protected screen (if any)
        const redirectTo = await AsyncStorage.getItem("redirect_after_login");
        if (redirectTo) {
          await AsyncStorage.removeItem("redirect_after_login");

          // Only navigate to known routes to prevent invalid redirects
          const allowedRedirects = [
            "/(tabs)/cart",
            "/(tabs)/orders",
            "/(tabs)/wishlist",
            "/(tabs)/account",
            "/(tabs)",
          ];

          if (allowedRedirects.includes(redirectTo)) {
            router.replace(redirectTo);
            return;
          }
        }

        const destination =
          result.user.role === "BUSINESS_ADMIN"
            ? "/(admin)/(tabs)/"
            : "/(tabs)/";

        router.replace(destination);
      }
    } catch (err: any) {
      setError(err?.data?.message || "Login failed. Please try again.");
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
          <Text style={styles.title}>Login</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                placeholder="Password"
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
          </View>

          <View style={styles.forgotRow}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </Link>
          </View>

          <Pressable
            onPress={handleLogin}
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Register</Text>
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
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 40,
  },
  error: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  field: { marginBottom: 28 },
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
  forgotRow: { alignItems: "flex-end", marginBottom: 32, marginTop: -16 },
  forgotText: { fontSize: 14, color: Colors.primary },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
});
