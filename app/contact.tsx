import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCall = () => {
    Linking.openURL('tel:08083817902');
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[20px] font-bold text-system-blue-dark text-center flex-1">
        Contact Us
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      <Divider height={1} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Support Icon & Intro */}
        <View className="px-[21px] py-10 items-center">
            <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6">
              <MaterialIcons name="support-agent" size={48} color={Colors.primary} />
            </View>
            <Text className="text-[22px] font-bold text-system-blue-dark text-center mb-2">
              How can we help you?
            </Text>
            <Text className="text-[14px] text-[#6B7280] leading-6 mb-8 px-4 text-center">
              We're here to help! Whether you have questions about your order or being a vendor, feel free to reach out to our team.
            </Text>
        </View>

        <Divider height={11} />

        {/* Phone Section */}
        <View className="px-[21px] py-8">
            <View className="flex-row items-start gap-4 mb-6">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                    <MaterialIcons name="phone" size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                    <Text className="text-[16px] font-bold text-system-blue-dark mb-1">Phone Numbers</Text>
                    <Text className="text-[15px] text-gray-600 font-medium">08083817902</Text>
                    <Text className="text-[15px] text-gray-600 font-medium">08141680059</Text>
                </View>
            </View>

            <Button onPress={handleCall} className="h-[50px] rounded-full">
                <Text className="text-white font-bold text-[15px]">Call Us Now</Text>
            </Button>
        </View>

        <Divider height={11} />

        {/* Address Section */}
        <View className="px-[21px] py-8">
            <View className="flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                    <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                    <Text className="text-[16px] font-bold text-system-blue-dark mb-2">Our Office</Text>
                    <Text className="text-[15px] text-gray-600 leading-6">
                        No 1 Agbani Crescent Akwuke Road{"\n"}
                        Opposite Everistus Catholic Church Gariki{"\n"}
                        Enugu State, Nigeria.
                    </Text>
                </View>
            </View>
        </View>

        <View className="mt-10 px-[21px]">
            <Text className="text-[12px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Dandelionz Customer Support
            </Text>
        </View>
      </ScrollView>
    </View>
  );
}
