import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCreateNotificationMutation } from "@/lib/api/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDays, format, isFuture, nextMonday, setHours, setMinutes } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CreateNotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState<"Customers" | "Vendors" | "All">("Customers");
  
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [createNotification, { isLoading }] = useCreateNotificationMutation();

  const scheduleOptions = [
    { 
      id: 'tomorrow-morning', 
      label: 'Tomorrow morning', 
      timeLabel: '8:00 AM', 
      icon: '☀️',
      getDate: () => {
        const d = addDays(new Date(), 1);
        return setMinutes(setHours(d, 8), 0);
      }
    },
    { 
      id: 'tomorrow-afternoon', 
      label: 'Tomorrow afternoon', 
      timeLabel: '12:00 PM', 
      icon: '🌤️',
      getDate: () => {
        const d = addDays(new Date(), 1);
        return setMinutes(setHours(d, 12), 0);
      }
    },
    { 
      id: 'monday-morning', 
      label: 'Monday Morning', 
      timeLabel: '8:00 AM', 
      icon: '📅',
      getDate: () => {
        const d = nextMonday(new Date());
        return setMinutes(setHours(d, 8), 0);
      }
    },
    { id: 'custom', label: 'Pick date & time', timeLabel: '', icon: '⚙️', getDate: () => null },
  ];

  const handlePresetSelect = (option: typeof scheduleOptions[0]) => {
    if (option.id === 'custom') {
      setShowDatePicker(true);
    } else {
      const date = option.getDate();
      if (date) {
        setScheduledDate(date);
        setShowSchedule(false);
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && scheduledDate) {
      const finalDate = new Date(scheduledDate);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      setScheduledDate(finalDate);
      setShowSchedule(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!title || !description) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields." });
      return;
    }

    if (scheduledDate && !isFuture(scheduledDate)) {
      Toast.show({ type: "error", text1: "Error", text2: "Scheduled time must be in the future." });
      return;
    }

    try {
      const body = {
        title,
        message: description,
        priority: 'normal',
        is_draft: isDraft,
        scheduled_for: scheduledDate ? scheduledDate.toISOString() : null,
        recipient_type: (recipient === "All" ? "ALL" : (recipient === "Customers" ? "USERS" : "VENDORS")) as any,
        recipient_group: (recipient === "All" ? "all" : (recipient === "Customers" ? "customer" : "vendor")) as any,
      };

      await createNotification(body).unwrap();
      Toast.show({ 
        type: "success", 
        text1: "Success", 
        text2: isDraft ? "Draft saved successfully!" : "Notification created successfully!" 
      });
      router.back();
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to create notification." });
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="w-10">
        <MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
      </TouchableOpacity>
      <Text className="text-[20px] font-bold text-system-blue-dark text-center flex-1">
        Create Notification
      </Text>
      <View className="w-10" />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {renderHeader()}
      
      <ScrollView className="flex-1 p-[21px]" contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}>
        <View className="mb-6">
          <Text className="text-[14px] font-medium text-gray-700 mb-2">Notification Title</Text>
          <TextInput
            placeholder="e.g., System Updates, Flash Sales..."
            value={title}
            onChangeText={setTitle}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] text-system-blue-dark"
          />
        </View>

        <View className="mb-6">
          <Text className="text-[14px] font-medium text-gray-700 mb-2">Notification Description</Text>
          <TextInput
            placeholder="Description..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] text-system-blue-dark min-h-[120px]"
            textAlignVertical="top"
          />
        </View>

        <View className="mb-6">
          <Text className="text-[14px] font-medium text-gray-700 mb-2">Recipient</Text>
          <View className="flex-row gap-2">
            {(["Customers", "Vendors", "All"] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRecipient(r)}
                className={`flex-1 py-3 rounded-xl items-center border ${recipient === r ? "bg-blue-50 border-system-blue-light" : "bg-white border-gray-200"}`}
              >
                <Text className={`text-[13px] font-bold ${recipient === r ? "text-system-blue-light" : "text-gray-500"}`}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setShowSchedule(true)}
          className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-8"
        >
          <View className="flex-row items-center gap-3">
            <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
            <View>
              <Text className="text-[14px] font-bold text-system-blue-dark">
                {scheduledDate ? "Scheduled For" : "Schedule Notification"}
              </Text>
              {scheduledDate && (
                <Text className="text-[12px] text-gray-500 mt-0.5">
                  {format(scheduledDate, "PPPP p")}
                </Text>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {scheduledDate && (
          <TouchableOpacity 
            onPress={() => setScheduledDate(null)}
            className="mb-6 items-center"
          >
            <Text className="text-system-red text-[13px] font-medium">Clear Schedule</Text>
          </TouchableOpacity>
        )}

        <View className="gap-3">
          <Button 
            onPress={() => handleSave(false)}
            isLoading={isLoading}
          >
            <Text className="text-white font-bold">{scheduledDate ? 'Schedule Notification' : 'Send Notification'}</Text>
          </Button>

          <Button 
            variant="outline"
            onPress={() => handleSave(true)}
            isLoading={isLoading}
          >
            <Text className="text-system-blue-dark font-bold">Save as Draft</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Schedule Selection Modal / Overlay */}
      {showSchedule && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <TouchableOpacity 
            className="flex-1" 
            onPress={() => setShowSchedule(false)} 
          />
          <View className="bg-white rounded-t-[30px] p-6">
            <Text className="text-[18px] font-bold text-system-blue-dark text-center mb-6">
              Schedule Notification
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              {scheduleOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handlePresetSelect(option)}
                  className="w-[48%] p-4 border border-gray-100 rounded-2xl items-center mb-4 bg-gray-50"
                >
                  <Text className="text-[24px] mb-2">{option.icon}</Text>
                  <Text className="text-[13px] font-bold text-system-blue-dark text-center">{option.label}</Text>
                  {option.timeLabel && (
                    <Text className="text-[11px] text-gray-500 mt-1">{option.timeLabel}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => setShowSchedule(false)}
              className="mt-4 py-4"
            >
              <Text className="text-center text-gray-400 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={scheduledDate || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
