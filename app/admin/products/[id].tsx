import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
    useApproveProductAdminMutation,
    useGetAdminProductDetailsQuery,
    useRejectProductAdminMutation,
    useSetProductCommissionMutation,
} from "@/lib/api/adminApi";
import { captureApiError } from "@/lib/observability";
import { apiError, formatCurrency } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [action, setAction] = useState<"Approve Product" | "Reject Product">(
    "Approve Product",
  );
  const [reason, setReason] = useState("");

  const {
    data: productResponse,
    isLoading,
    error,
    refetch,
  } = useGetAdminProductDetailsQuery(id!);
  const product = productResponse?.data;

  const [approveProduct, { isLoading: isApproving }] =
    useApproveProductAdminMutation();
  const [rejectProduct, { isLoading: isRejecting }] =
    useRejectProductAdminMutation();
  const [setProductCommission, { isLoading: isSavingCommission }] =
    useSetProductCommissionMutation();
  const [commissionInput, setCommissionInput] = useState("");

  useEffect(() => {
    if (product?.commission_rate != null && product.commission_rate !== "") {
      setCommissionInput(String(Math.round(parseFloat(product.commission_rate) * 100 * 100) / 100));
    } else {
      setCommissionInput("");
    }
  }, [product?.commission_rate]);

  const handleSaveCommission = async (clear = false) => {
    if (!product) return;
    let value: number | null = null;
    if (!clear && commissionInput.trim() !== "") {
      const pct = parseFloat(commissionInput);
      if (isNaN(pct) || pct < 0 || pct > 10) {
        Toast.show({ type: "error", text1: "Enter a commission between 0 and 10%." });
        return;
      }
      value = Math.round(pct * 10) / 1000; // percent -> decimal, 3 dp
    }
    try {
      const res = await setProductCommission({ slug: id!, commission_rate: value }).unwrap();
      Toast.show({
        type: "success",
        text1: value === null ? "Override cleared" : "Commission updated",
        text2: `Now ${res.data.effective_rate_label}.`,
      });
      refetch();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: apiError(err, "Could not update commission.") });
    }
  };

  const handleConfirmAction = async () => {
    if (!product) return;

    try {
      if (action === "Approve Product") {
        await approveProduct(id!).unwrap();
        Toast.show({
          type: "success",
          text1: "Product approved successfully!",
        });
      } else {
        await rejectProduct({
          slug: id!,
          reason: reason || undefined,
        }).unwrap();
        Toast.show({
          type: "success",
          text1: "Product rejected successfully!",
        });
      }
      refetch();
    } catch (err: any) {
      captureApiError(err, {
        flow: "product",
        action: action === "Approve Product" ? "approve" : "reject",
        extra: { slug: id, reason: reason || undefined, role: "BUSINESS_ADMIN" },
      });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: apiError(err, "Failed to perform action"),
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

  if (error || !product) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-system-red text-center mb-4">
          Failed to load product details.
        </Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const isSubmitting = isApproving || isRejecting;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Feather name="chevron-left" size={32} color="#030482" />
        </TouchableOpacity>
        <Text className="text-[24px] font-semibold text-system-blue-light text-center flex-1">
          Product Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View className="p-[21px]">
          <View className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6 items-center justify-center border border-gray-100">
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <Feather name="image" size={64} color="#9ca3af" />
            )}
          </View>

          <Text className="text-[22px] font-bold text-system-blue-dark mb-2">
            {product.name}
          </Text>
          <Text className="text-[14px] text-[#6B7280] leading-[22px] mb-4">
            {product.description}
          </Text>

          <View className="flex-row items-center gap-3 mb-6">
            <Text className="text-[24px] font-bold text-system-blue-light">
              {formatCurrency(product.price)}
            </Text>
            {(product.discount ?? 0) > 0 && (
              <View className="bg-red-50 px-2 py-1 rounded-lg">
                <Text className="text-system-red text-[12px] font-bold">
                  -{product.discount}% OFF
                </Text>
              </View>
            )}
          </View>

          <View className="gap-4 bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]">
            <View className="flex-row justify-between">
              <Text className="text-[14px] text-[#6B7280]">Category</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">
                {product.category_name || product.category}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[14px] text-[#6B7280]">
                Stock Available
              </Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">
                {product.stock} Units
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[14px] text-[#6B7280]">Uploaded On</Text>
              <Text className="text-[14px] font-semibold text-system-blue-dark">
                {new Date(product.uploadDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        <View className="p-[21px]">
          <Text className="text-[16px] font-bold text-system-blue-dark mb-4">
            Vendor Info
          </Text>
          <View className="gap-2">
            <Text className="text-[14px] text-[#6B7280]">
              Store:{" "}
              <Text className="font-semibold text-system-blue-dark">
                {product.vendor.store_name}
              </Text>
            </Text>
            <Text className="text-[14px] text-[#6B7280]">
              Email:{" "}
              <Text className="font-semibold text-system-blue-dark">
                {product.vendor.email}
              </Text>
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-[14px] text-[#6B7280] mr-2">Status:</Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  product.status === "APPROVED"
                    ? "bg-green-100"
                    : product.status === "REJECTED"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    product.status === "APPROVED"
                      ? "text-green-700"
                      : product.status === "REJECTED"
                        ? "text-red-700"
                        : "text-yellow-700"
                  }`}
                >
                  {product.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Divider />

        {/* Commission */}
        <View className="p-[21px]">
          <Text className="text-[16px] font-bold text-system-blue-dark mb-2">Commission</Text>
          <Text className="text-[13px] text-[#6B7280] leading-[20px] mb-4">
            Override the platform commission for this product only. Currently{" "}
            <Text className="font-bold text-system-blue-dark">
              {product.commission_rate != null && product.commission_rate !== ""
                ? `${(parseFloat(product.commission_rate) * 100).toString()}% (override)`
                : "using the vendor/platform rate"}
            </Text>
            . Leave blank to inherit. Maximum 10%.
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center border border-gray-300 rounded-[12px] px-4 h-[55px]">
              <TextInput
                value={commissionInput}
                onChangeText={setCommissionInput}
                keyboardType="decimal-pad"
                placeholder="Inherit"
                placeholderTextColor="#9CA3AF"
                editable={!isSavingCommission}
                className="flex-1 text-[16px] text-system-blue-dark"
              />
              <Text className="text-[16px] text-gray-400 ml-1">%</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleSaveCommission(false)}
              disabled={isSavingCommission}
              className={`h-[55px] px-5 rounded-[12px] items-center justify-center ${isSavingCommission ? "bg-gray-300" : "bg-system-blue-light"}`}
            >
              {isSavingCommission ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[15px] font-bold">Save</Text>
              )}
            </TouchableOpacity>
          </View>
          {product.commission_rate != null && product.commission_rate !== "" && (
            <TouchableOpacity onPress={() => handleSaveCommission(true)} disabled={isSavingCommission} className="mt-3">
              <Text className="text-[14px] font-bold text-system-blue-light">Clear override</Text>
            </TouchableOpacity>
          )}
        </View>

        {product.status === "PENDING" && (
          <View className="p-[21px]">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Choose Action
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-6">
              {["Approve Product", "Reject Product"].map((act) => (
                <TouchableOpacity
                  key={act}
                  onPress={() => setAction(act as any)}
                  className={`px-4 py-2.5 rounded-lg border ${
                    action === act 
                      ? "bg-white border-system-blue-light" 
                      : "bg-[#F5F7FA] border-transparent"
                  }`}
                >
                  <Text className={`text-[13px] font-bold ${action === act ? "text-system-blue-light" : "text-[#00001180]"}`}>
                    {act}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {action === "Reject Product" && (
              <TextInput
                placeholder="Add a reason (optional)..."
                value={reason}
                onChangeText={setReason}
                className="bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6] min-h-[100px] mb-6"
                multiline
                textAlignVertical="top"
              />
            )}

            <Button onPress={handleConfirmAction} isLoading={isSubmitting}>
              Confirm Action
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
