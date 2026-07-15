import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { 
  useGetVendorNotificationsQuery, 
  useVendorMarkNotificationAsReadMutation, 
  useVendorMarkAllNotificationsAsReadMutation,
  useVendorDeleteNotificationMutation
} from "@/lib/api/vendorApi";
import { resolveNotificationUrl, isSystemNotification } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VendorNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const queryParams = useMemo(() => 
    filter === "unread" ? { is_read: false } : undefined,
  [filter]);
  const { data: response, isLoading, refetch } = useGetVendorNotificationsQuery(queryParams);
  
  // Handle different potential structures: results, data.results, or data
  const notifications = (response as any)?.results || (response?.data as any)?.results || response?.data || [];

  const filtered = filter === "unread" 
    ? notifications.filter((n: any) => !n.is_read)
    : notifications;

  const [markAsRead] = useVendorMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useVendorMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useVendorDeleteNotificationMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      Toast.show({ type: "success", text1: "All notifications marked as read." });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to mark all as read." });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification(id).unwrap();
              Toast.show({ type: "success", text1: "Notification deleted" });
              refetch();
            } catch (err) {
              Toast.show({ type: "error", text1: "Failed to delete notification." });
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/vendor/(tabs)/account");
    }
  };

  const renderHeader = () => {
    const hasUnread = notifications.some((n: any) => !n.is_read);
    
    return (
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Pressable onPress={handleBack} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[24px] font-semibold text-system-blue-dark text-center flex-1">
          Notifications
        </Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead} disabled={isMarkingAll}>
            <MaterialIcons name="done-all" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center pt-20 px-[21px]">
      <MaterialIcons name="notifications-none" size={64} color="#D1D5DB" />
      <Text className="text-[20px] font-bold text-system-blue-dark mt-4">
        {filter === "unread" ? "No unread notifications" : "No notifications yet"}
      </Text>
      <Text className="text-[14px] text-[#6B7280] text-center mt-2 px-6">
        We&apos;ll notify you when something important happens.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      
      {/* Filter Tabs */}
      <View className="flex-row px-[21px] py-4 gap-4">
        <TouchableOpacity
          onPress={() => setFilter("all")}
          className={`px-6 py-2 rounded-full items-center ${filter === "all" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${filter === "all" ? "text-white" : "text-[#6B7280]"}`}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("unread")}
          className={`px-6 py-2 rounded-full items-center ${filter === "unread" ? "bg-system-blue-light" : "bg-[#F5F7FA]"}`}
        >
          <Text className={`text-[14px] font-semibold ${filter === "unread" ? "text-white" : "text-[#6B7280]"}`}>
            Unread
          </Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <View>
            <Pressable 
              onPress={() => {
                if (!item.is_read) markAsRead(item.id);
                if (item.action_url && item.category !== 'product_rejection') {
                  const localPath = resolveNotificationUrl(item.action_url, "vendor");
                  if (localPath && localPath !== "#") {
                    router.push(localPath as any);
                  }
                }
              }}
              className={`p-[21px] flex-row items-start ${item.is_read ? 'bg-white' : 'bg-blue-50/30'}`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${item.is_read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                <MaterialIcons 
                  name={item.notification_type_icon as any || "notifications"} 
                  size={20} 
                  color={item.is_read ? "#9CA3AF" : Colors.primary} 
                />
              </View>
              
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`text-[15px] flex-1 pr-2 ${item.is_read ? 'text-gray-600' : 'font-bold text-system-blue-dark'}`}>
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text className={`text-[13px] leading-5 ${item.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                  {item.message}
                </Text>
              </View>

              {!isSystemNotification(item) && (
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id)}
                  className="ml-2 p-1"
                >
                  <MaterialIcons name="delete-outline" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              )}
            </Pressable>
            <Divider height={1} className="opacity-50" />
          </View>
        )}
      />
      
      {isLoading && !refreshing && (
        <View className="absolute inset-0 bg-white/50 items-center justify-center">
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}
