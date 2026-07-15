import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Colors } from "@/constants/theme";
import {
    useGetCustomerWalletQuery,
    useRequestCustomerWithdrawalMutation,
} from "@/lib/api/customerApi";
import {
    useGetBanksQuery,
    useVerifyBankAccountMutation,
} from "@/lib/api/vendorApi";
import { apiError, formatCurrency } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const MIN_WITHDRAWAL = 500;

export default function CustomerWithdrawScreen() {
  const insets = useSafeAreaInsets();

  // Wallet
  const { data: walletData } = useGetCustomerWalletQuery();
  const balance = walletData?.data?.balance ?? 0;

  // Bank selection
  const { data: banksData } = useGetBanksQuery();
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const filteredBanks = useMemo(() => {
    const banks = banksData?.data ?? [];
    if (!bankSearch.trim()) return banks;
    return banks.filter((b: any) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()),
    );
  }, [banksData, bankSearch]);

  // Account verification
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifyAccount, { isLoading: isVerifying }] =
    useVerifyBankAccountMutation();

  const handleVerify = async () => {
    if (!selectedBank) {
      Toast.show({ type: "error", text1: "Please select a bank first." });
      return;
    }
    if (accountNumber.length !== 10) {
      Toast.show({ type: "error", text1: "Account number must be 10 digits." });
      return;
    }
    try {
      const res = await verifyAccount({
        account_number: accountNumber,
        bank_code: selectedBank.code,
      }).unwrap();
      setAccountName(res.data?.account_name || "");
      Toast.show({
        type: "success",
        text1: "Account verified ✓",
        text2: res.data?.account_name,
      });
    } catch (err: any) {
      setAccountName("");
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: apiError(err, "Could not verify account. Check your details."),
      });
    }
  };

  // Withdrawal
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [requestWithdrawal, { isLoading: isWithdrawing }] =
    useRequestCustomerWithdrawalMutation();

  const numericAmount = parseFloat(amount) || 0;
  const canWithdraw =
    accountName.length > 0 &&
    selectedBank !== null &&
    accountNumber.length === 10 &&
    numericAmount >= MIN_WITHDRAWAL &&
    numericAmount <= balance &&
    pin.length === 4;

  const handleWithdraw = () => {
    if (!canWithdraw) return;

    Alert.alert(
      "Confirm Withdrawal",
      `Send ${formatCurrency(numericAmount)} to ${accountName} (${selectedBank!.name} ···${accountNumber.slice(-4)})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          onPress: async () => {
            try {
              const res = await requestWithdrawal({
                amount: numericAmount,
                pin,
                bank_name: selectedBank!.name,
                bank_code: selectedBank!.code,
                account_number: accountNumber,
                account_name: accountName,
              }).unwrap();
              Toast.show({
                type: "success",
                text1: "Withdrawal requested",
                text2: res.message,
              });
              router.back();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Withdrawal failed",
                text2: apiError(err, "Please try again."),
              });
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F7FA]"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-system-blue-dark flex-1 text-center">
          Withdraw to Bank
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 21, paddingBottom: insets.bottom + 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Balance chip */}
        <View className="bg-white rounded-2xl p-4 mb-5 flex-row items-center justify-between border border-gray-100">
          <Text className="text-[14px] text-gray-500">Available balance</Text>
          <Text className="text-[18px] font-bold text-system-blue-dark">
            {formatCurrency(balance)}
          </Text>
        </View>

        {/* Amount */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Amount
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 mb-1">
          <Text className="text-[22px] font-bold text-system-blue-dark mr-2">
            ₦
          </Text>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-[22px] font-bold text-system-blue-dark py-4"
          />
        </View>
        <Text className="text-[12px] text-gray-400 mb-6">
          Minimum: {formatCurrency(MIN_WITHDRAWAL)} · Maximum:{" "}
          {formatCurrency(balance)}
        </Text>

        <Divider className="mb-6" />

        {/* Bank selection */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Bank Details
        </Text>

        <TouchableOpacity
          onPress={() => setBankModalOpen(true)}
          className="bg-white rounded-2xl border border-gray-100 px-4 py-4 mb-3 flex-row items-center justify-between"
        >
          <Text
            className={
              selectedBank
                ? "text-system-blue-dark font-semibold text-[15px]"
                : "text-gray-400 text-[15px]"
            }
          >
            {selectedBank?.name ?? "Select bank"}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Account number + verify */}
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 mb-3">
          <TextInput
            value={accountNumber}
            onChangeText={(v) => {
              setAccountNumber(v.replace(/\D/g, "").slice(0, 10));
              setAccountName("");
            }}
            keyboardType="number-pad"
            placeholder="10-digit account number"
            placeholderTextColor="#9CA3AF"
            maxLength={10}
            className="flex-1 text-[15px] text-system-blue-dark py-4"
          />
          <TouchableOpacity
            onPress={handleVerify}
            disabled={
              isVerifying || accountNumber.length !== 10 || !selectedBank
            }
            className={`px-3 py-1.5 rounded-lg ml-2 ${
              isVerifying || accountNumber.length !== 10 || !selectedBank
                ? "bg-gray-100"
                : "bg-system-blue-light/10"
            }`}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text
                className={`text-[13px] font-bold ${
                  accountNumber.length === 10 && selectedBank
                    ? "text-system-blue-light"
                    : "text-gray-400"
                }`}
              >
                Verify
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Verified account name */}
        {accountName ? (
          <View className="bg-green-50 rounded-xl px-4 py-3 mb-3 flex-row items-center gap-2 border border-green-100">
            <MaterialIcons name="check-circle" size={18} color="#059669" />
            <Text className="text-[14px] font-bold text-green-700">
              {accountName}
            </Text>
          </View>
        ) : (
          <Text className="text-[12px] text-gray-400 mb-3">
            Enter your account number and tap Verify to confirm account name.
          </Text>
        )}

        <Divider className="my-4" />

        {/* PIN */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Payment PIN
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center px-4 mb-1">
          <MaterialIcons name="lock-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="4-digit PIN"
            placeholderTextColor="#9CA3AF"
            maxLength={4}
            className="flex-1 text-[18px] text-system-blue-dark py-4 ml-3 tracking-widest"
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push("/account/wallet/set-pin" as any)}
        >
          <Text className="text-[12px] text-system-blue-light mb-6">
            Don't have a PIN? Set one here →
          </Text>
        </TouchableOpacity>

        {/* Withdraw button */}
        <Button
          onPress={handleWithdraw}
          disabled={!canWithdraw || isWithdrawing}
          className={`py-4 rounded-2xl items-center ${canWithdraw ? "bg-system-blue-light" : "bg-gray-200"}`}
        >
          {isWithdrawing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className={`text-[16px] font-bold ${canWithdraw ? "text-white" : "text-gray-400"}`}
            >
              Withdraw {amount ? formatCurrency(numericAmount) : ""}
            </Text>
          )}
        </Button>
      </ScrollView>

      {/* Bank selection modal */}
      <Modal
        visible={bankModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <Text className="text-[18px] font-bold text-system-blue-dark flex-1">
              Select Bank
            </Text>
            <TouchableOpacity
              onPress={() => {
                setBankModalOpen(false);
                setBankSearch("");
              }}
            >
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View className="px-4 py-3">
            <View className="bg-gray-50 rounded-xl flex-row items-center px-3">
              <MaterialIcons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={bankSearch}
                onChangeText={setBankSearch}
                placeholder="Search banks..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-3 ml-2 text-[15px] text-system-blue-dark"
                autoFocus
              />
            </View>
          </View>
          <FlatList
            data={filteredBanks}
            keyExtractor={(item: any) => item.code}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedBank({ name: item.name, code: item.code });
                  setAccountName("");
                  setBankModalOpen(false);
                  setBankSearch("");
                }}
                className="px-4 py-4 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-[15px] text-system-blue-dark">
                  {item.name}
                </Text>
                {selectedBank?.code === item.code && (
                  <MaterialIcons
                    name="check"
                    size={18}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
