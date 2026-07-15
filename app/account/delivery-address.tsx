import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import {
  useGetCustomerProfileQuery,
  usePartialUpdateCustomerProfileMutation,
} from "@/lib/api/customerApi";
import { apiError } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: profileResponse,
    isLoading,
    refetch,
  } = useGetCustomerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    usePartialUpdateCustomerProfileMutation();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profile = profileResponse;

  useEffect(() => {
    if (profile) {
      setAddress(profile.shipping_address || "");
      setCity(profile.city || "");
      setPostalCode(profile.postal_code || "");
      setCountry(profile.country || "Nigeria");
    }
  }, [profile]);

  const searchAddress = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=ng`,
          { headers: { "User-Agent": "DandelionzApp/1.0" } },
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectSuggestion = (result: NominatimResult) => {
    setAddress(result.display_name);
    const addr = result.address;
    if (addr.city || addr.town || addr.village)
      setCity(addr.city || addr.town || addr.village || "");
    if (addr.postcode) setPostalCode(addr.postcode);
    setSuggestions([]);
  };

  const handleSave = async () => {
    if (!address.trim()) {
      Toast.show({
        type: "info",
        text1: "Validation",
        text2: "Please enter your delivery address.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("shipping_address", address);
      formData.append("city", city);
      formData.append("postal_code", postalCode);
      formData.append("country", country || "Nigeria");

      await updateProfile(formData).unwrap();
      Toast.show({
        type: "success",
        text1: "Delivery address updated successfully!",
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          apiError(err, "Failed to update address. Please try again."),
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#030482" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[18px] font-bold text-system-blue-light text-center flex-1">
          Delivery Address
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-[21px]"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[14px] text-gray-500 mb-6 leading-[20px]">
          Your delivery address is used for all orders. Make sure it&apos;s
          accurate.
        </Text>

        {/* Address */}
        <View className="mb-6">
          <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Street Address
          </Text>
          <View className="relative">
            <TextInput
              value={address}
              onChangeText={(val) => {
                setAddress(val);
                searchAddress(val);
              }}
              placeholder="e.g., 12 Adetokunbo Ademola Street"
              multiline
              numberOfLines={2}
              className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-system-blue-dark bg-[#F9FAFB]"
              textAlignVertical="top"
            />
            {isSearching && (
              <ActivityIndicator
                size="small"
                color="#030482"
                style={{ position: "absolute", right: 12, top: 12 }}
              />
            )}
          </View>
          {suggestions.length > 0 && (
            <View className="border border-gray-200 rounded-xl bg-white mt-1 shadow-sm max-h-60 overflow-hidden">
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={String(item.place_id)}
                  onPress={() => selectSuggestion(item)}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <Text
                    className="text-[13px] text-system-blue-dark"
                    numberOfLines={2}
                  >
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* City */}
        <View className="mb-6">
          <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            City
          </Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g., Lagos"
            className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-system-blue-dark bg-[#F9FAFB]"
          />
        </View>

        {/* Postal Code */}
        <View className="mb-6">
          <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Postal Code
          </Text>
          <TextInput
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="e.g., 100211"
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-system-blue-dark bg-[#F9FAFB]"
          />
        </View>

        {/* Country */}
        <View className="mb-10">
          <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Country
          </Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder="Nigeria"
            className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-system-blue-dark bg-[#F9FAFB]"
          />
        </View>

        <View className="gap-4">
          <Button onPress={handleSave} isLoading={isSaving}>
            Save Address
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
