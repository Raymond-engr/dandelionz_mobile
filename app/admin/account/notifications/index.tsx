import { Divider } from "@/components/ui/divider";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Colors } from "@/constants/theme";
import { 
  useAdminGetAllNotificationsQuery, 
  useGetAdminSystemNotificationsQuery,
  useAdminMarkNotificationAsReadMutation, 
  useAdminMarkAllNotificationsAsReadMutation,
  useDeleteInboxNotificationMutation,
  useDeleteSystemNotificationMutation,
  usePublishNotificationMutation
} from "@/lib/api/adminApi";
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

export default function AdminNotificationManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [systemFilter, setSystemFilter] = useState<"all" | "sent" | "draft">("all");

  // Inbox Query
  const { 
    data: inboxResponse, 
    isLoading: isInboxLoading, 
    refetch: refetchInbox 
  } = useAdminGetAllNotificationsQuery(undefined, { skip: activeTab !== "inbox" });

  // System Notifications Query
  const systemQueryParams = useMemo(() => 
    systemFilter === "all" ? undefined : { is_draft: systemFilter === "draft" },
  [systemFilter]);

  const {
    data: systemResponse,
    isLoading: isSystemLoading,
    refetch: refetchSystem
  } = useGetAdminSystemNotificationsQuery(systemQueryParams, { skip: activeTab !== "sent" });

  const inboxNotifications = (inboxResponse as any)?.results || (inboxResponse as any)?.data || [];
  const systemNotifications = (systemResponse as any)?.results || (systemResponse as any)?.data || [];

  const [markAsRead] = useAdminMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useAdminMarkAllNotificationsAsReadMutation();
  const [deleteInbox] = useDeleteInboxNotificationMutation();
  const [deleteSystem] = useDeleteSystemNotificationMutation();
  const [publishNotif] = usePublishNotificationMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "inbox") await refetchInbox();
    else await refetchSystem();
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

  const handleDeleteInbox = (id: string) => {
    Alert.alert("Delete", "Delete this notification?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteInbox(id).unwrap();
            Toast.show({ type: "success", text1: "Notification deleted." });
          } catch (err) {
            Toast.show({ type: "error", text1: "Failed to delete notification." });
          }
        }
      }
    ]);
  };

  const handleDeleteSystem = (id: string) => {
    Alert.alert("Delete", "Delete this system notification?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteSystem(id).unwrap();
            Toast.show({ type: "success", text1: "System notification deleted." });
          } catch (err) {
            Toast.show({ type: "error", text1: "Failed to delete system notification." });
          }
        }
      }
    ]);
  };

  const handlePublish = (id: string) => {
    Alert.alert("Publish", "Publish this draft notification?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Publish", 
        onPress: async () => {
          try {
            await publishNotif(id).unwrap();
            Toast.show({ type: "success", text1: "Notification published successfully." });
          } catch (err) {
            Toast.show({ type: "error", text1: "Failed to publish notification." });
          }
        }
      }
    ]);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
      <Pressable onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </Pressable>
      <Text className="text-[20px] font-bold text-system-blue-dark text-center flex-1">
        Notifications
      </Text>
      {activeTab === "inbox" && inboxNotifications.length > 0 ? (
        <TouchableOpacity onPress={handleMarkAllRead} disabled={isMarkingAll}>
          <Text className="text-system-blue-light font-bold text-[13px]">Mark Read</Text>
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      
      {/* Main Tabs */}
      <View className="flex-row px-[21px] py-4 gap-4">
        <TouchableOpacity
          onPress={() => setActiveTab("inbox")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "inbox" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}
        >
          <Text className={`text-[14px] font-bold ${activeTab === "inbox" ? "text-system-blue-light" : "text-gray-500"}`}>
            Inbox
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("sent")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "sent" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}
        >
          <Text className={`text-[14px] font-bold ${activeTab === "sent" ? "text-system-blue-light" : "text-gray-500"}`}>
            Sent (System)
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "sent" && (
        <View className="flex-row px-[21px] pb-4 gap-2">
          {(["all", "sent", "draft"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setSystemFilter(f)}
              className={`px-4 py-1.5 rounded-full ${systemFilter === f ? "bg-gray-200" : "bg-white border border-gray-200"}`}
            >
              <Text className={`text-[11px] font-bold uppercase ${systemFilter === f ? "text-gray-800" : "text-gray-500"}`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Divider height={1} />

      <FlatList
        data={activeTab === "inbox" ? inboxNotifications : systemNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={() => (
          <View className="items-center justify-center pt-20 px-10">
            <MaterialIcons name="notifications-none" size={64} color="#D1D5DB" />
            <Text className="text-[18px] font-bold text-system-blue-dark mt-4">No notifications</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View className={`border-b border-gray-50 p-[21px] ${!item.is_read && activeTab === 'inbox' ? 'bg-blue-50/20' : 'bg-white'}`}>
            <View className="flex-row items-start">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${item.is_draft ? 'bg-yellow-50' : 'bg-gray-100'}`}>
                <MaterialIcons 
                  name={activeTab === 'sent' ? (item.is_draft ? 'edit' : 'send') : (item.notification_type_icon as any || 'notifications')} 
                  size={20} 
                  color={item.is_draft ? '#ca8a04' : '#6B7280'} 
                />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between mb-1">
                  <Text className={`text-[15px] flex-1 pr-2 font-bold text-system-blue-dark`}>
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-[13px] text-gray-600 leading-5">
                  {item.message}
                </Text>
                
                {activeTab === 'sent' && (
                  <View className="flex-row mt-3 gap-3">
                    {item.is_draft && (
                      <TouchableOpacity 
                        onPress={() => handlePublish(item.id)}
                        className="bg-green-50 px-3 py-1.5 rounded-md"
                      >
                        <Text className="text-green-600 text-[12px] font-bold">Publish</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={() => handleDeleteSystem(item.id)}
                      className="bg-red-50 px-3 py-1.5 rounded-md"
                    >
                      <Text className="text-red-600 text-[12px] font-bold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {activeTab === 'inbox' && !isSystemNotification(item) && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteInbox(item.id)}
                    className="mt-3"
                  >
                    <Text className="text-gray-400 text-[12px]">Delete from inbox</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button for Create */}
      <View className="absolute bottom-10 left-[21px] right-[21px]">
        <TouchableOpacity
          onPress={() => router.push("/(admin)/account/notifications/create" as any)}
          className="bg-system-blue-light h-[55px] rounded-[12px] flex-row items-center justify-center shadow-lg shadow-blue-900/40"
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text className="text-white font-bold ml-2 text-[16px]">Create Notification</Text>
        </TouchableOpacity>
      </View>
      
      {(isInboxLoading || isSystemLoading) && !refreshing && (
        <View className="absolute inset-0 bg-white/50 items-center justify-center">
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}
