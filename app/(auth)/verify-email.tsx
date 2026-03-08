import { Colors } from "@/constants/theme";
import { useVerifyEmailMutation } from "@/lib/api/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { uid, token } = useLocalSearchParams<{ uid: string; token: string }>();
  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (uid && token) {
      verifyEmail({ uid, token })
        .unwrap()
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [uid, token]);

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Verifying your email...</Text>
      </View>
    );
  }

  if (status === "success") {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.heading}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Your account is now active. You can log in.
        </Text>
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Continue to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>❌</Text>
      <Text style={styles.heading}>Verification Failed</Text>
      <Text style={styles.subtitle}>
        The verification link is invalid or has expired. Please request a new
        one.
      </Text>
      <Pressable
        onPress={() => router.replace("/(auth)/login")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 64, marginBottom: 24 },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  loadingText: { marginTop: 16, color: "#6B7280", fontSize: 15 },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
