import { Colors } from "@/constants/theme";
import {
  useCustomerDeleteNotificationMutation,
  useCustomerMarkAllNotificationsAsReadMutation,
  useCustomerMarkNotificationAsReadMutation,
  useGetCustomerNotificationsQuery,
} from "@/lib/api/customerApi";
import { resolveNotificationUrl, isSystemNotification } from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CustomerNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [refreshing, setRefreshing] = useState(false);

  const queryParams = useMemo(() => 
    filter === "unread" ? { is_read: false } : undefined,
  [filter]);

  const {
    data: notificationsResponse,
    isLoading,
    refetch,
  } = useGetCustomerNotificationsQuery(queryParams);

  const [markAsRead] = useCustomerMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useCustomerMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useCustomerDeleteNotificationMutation();

  // Handle various response shapes
  const notifications: any[] =
    (notificationsResponse as any)?.results ||
    (notificationsResponse as any)?.data?.results ||
    notificationsResponse?.data ||
    [];

  const filtered =
    filter === "unread"
      ? notifications.filter((n: any) => !n.is_read)
      : notifications;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      Toast.show({
        type: "success",
        text1: "All notifications marked as read.",
      });
      refetch();
    } catch {
      Toast.show({ type: "error", text1: "Failed to mark all as read." });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Remove this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNotification(id).unwrap();
            refetch();
            Toast.show({ type: "success", text1: "Notification deleted" });
          } catch {
            Toast.show({
              type: "error",
              text1: "Failed to delete notification.",
            });
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
        </Pressable>
        <Text className="text-[20px] font-bold text-system-blue-light text-center flex-1">
          Notifications
        </Text>
        {filtered.length > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={isMarkingAll}
            className="w-20 items-end"
          >
            <Text className="text-system-blue-light text-[12px] font-bold">
              Mark Read
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-20" />
        )}
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-[21px] py-3 gap-3 border-b border-gray-100">
        {(["all", "unread"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-5 py-2 rounded-full border ${
              filter === f
                ? "bg-system-blue-light border-system-blue-light"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                filter === f ? "text-white" : "text-gray-500"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#030482" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#030482"
            />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center pt-20 px-10">
              <MaterialIcons
                name="notifications-none"
                size={64}
                color="#D1D5DB"
              />
              <Text className="text-[18px] font-bold text-system-blue-dark mt-4">
                No notifications
              </Text>
              <Text className="text-[14px] text-gray-500 text-center mt-2">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "You have no notifications yet."}
              </Text>
            </View>
          )}
          renderItem={({ item }: { item: any }) => (
            <View>
              <Pressable
                onPress={async () => {
                  if (!item.is_read) {
                    await markAsRead(item.id)
                      .unwrap()
                      .catch(() => {});
                  }
                  if (item.action_url) {
                    const localPath = resolveNotificationUrl(
                      item.action_url,
                      "customer",
                    );
                    if (localPath && localPath !== "#") {
                      router.push(localPath as any);
                    }
                  }
                }}
                className={`px-[21px] py-4 flex-row items-start ${
                  !item.is_read ? "bg-blue-50/30" : "bg-white"
                }`}
              >
                {/* Unread dot */}
                {!item.is_read && (
                  <View className="w-2 h-2 rounded-full bg-system-blue-light mt-2 mr-3 shrink-0" />
                )}

                <View className="flex-1 min-w-0">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text
                      className={`text-[15px] flex-1 pr-4 ${
                        !item.is_read
                          ? "font-bold text-system-blue-dark"
                          : "font-semibold text-gray-800"
                      }`}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-[11px] text-gray-400 shrink-0">
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    className="text-[13px] text-gray-600 leading-5"
                    numberOfLines={3}
                  >
                    {item.message}
                  </Text>
                </View>

                {/* Delete button */}
                {!isSystemNotification(item) && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="ml-3 p-1 shrink-0"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </Pressable>
              <View className="h-[1px] bg-gray-100 mx-[21px]" />
            </View>
          )}
        />
      )}
    </View>
  );
}
