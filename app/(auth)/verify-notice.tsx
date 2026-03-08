import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function VerifyNoticeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Circle cx={40} cy={40} r={40} fill="#EFF6FF" />
          <Path
            d="M20 30l20 14 20-14M20 30v24h40V30"
            stroke={Colors.primary}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>

      <Text style={styles.heading}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a verification link to your email address. Please check your
        inbox and click the link to verify your account.
      </Text>
      <Text style={styles.note}>
        If you don't see the email, check your spam folder.
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
  iconWrap: { marginBottom: 32 },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  note: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 40,
  },
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
