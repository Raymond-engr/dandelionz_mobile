import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTACT_METHODS = [
  { label: "Call Us", value: "tel:+2340000000000", icon: "📞" },
  { label: "Email Us", value: "mailto:support@dandelionz.net", icon: "✉️" },
  { label: "WhatsApp", value: "https://wa.me/2340000000000", icon: "💬" },
];

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    // Simulate or connect to your contact API
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSuccess(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backBtn}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Contact methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionLabel}>Get in touch</Text>
          <View style={styles.methodsRow}>
            {CONTACT_METHODS.map((m) => (
              <Pressable
                key={m.label}
                onPress={() => Linking.openURL(m.value)}
                style={styles.methodBtn}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={styles.methodLabel}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Contact form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Send us a message</Text>

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                ✅ Message sent! We'll get back to you soon.
              </Text>
            </View>
          ) : (
            <>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.field}>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#9CA3AF"
                  value={form.name}
                  onChangeText={set("name")}
                />
              </View>

              <View style={styles.field}>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  value={form.email}
                  onChangeText={set("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Your message..."
                  placeholderTextColor="#9CA3AF"
                  value={form.message}
                  onChangeText={set("message")}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                onPress={handleSubmit}
                style={[
                  styles.submitBtn,
                  isLoading && styles.submitBtnDisabled,
                ]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Message</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { fontSize: 24, color: Colors.primary, width: 32 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  content: { paddingBottom: 40 },
  methodsSection: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 28 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  methodsRow: { flexDirection: "row", gap: 12 },
  methodBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  methodIcon: { fontSize: 20 },
  methodLabel: { fontSize: 13, fontWeight: "600", color: "#fff" },
  divider: { height: 41, backgroundColor: "#F5F7FA" },
  formSection: { paddingHorizontal: 24, paddingTop: 28 },
  error: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  successBox: { backgroundColor: "#F0FDF4", padding: 16, borderRadius: 8 },
  successText: { color: "#166534", fontSize: 14 },
  field: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textArea: { height: 120 },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
