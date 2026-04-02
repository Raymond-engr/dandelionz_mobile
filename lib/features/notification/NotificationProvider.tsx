import { customerApi } from "@/lib/api/customerApi";
import { useRegisterPushTokenMutation } from "@/lib/api/notificationApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  addNotification,
  setConnected,
  setUnreadCount,
} from "./notificationSlice";

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationContext = createContext<void | undefined>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );
  
  // Refs for WebSocket
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Refs for Push Notifications
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const [triggerGetStats] =
    customerApi.useLazyCustomerGetNotificationStatsQuery();
  const [registerPushToken] = useRegisterPushTokenMutation();

  // --- WebSocket Logic (Foreground Live Updates) ---
  const connectWebSocket = () => {
    if (!accessToken || socketRef.current?.readyState === WebSocket.OPEN)
      return;
    if (socketRef.current) socketRef.current.close();

    const wsUrl = `wss://dandelionz.net/ws/notifications/?token=${accessToken}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      dispatch(setConnected(true));
      triggerGetStats()
        .unwrap()
        .then((response) => {
          if (response.success)
            dispatch(setUnreadCount(response.data.unread_count));
        })
        .catch(() => {});
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "notification") {
          dispatch(addNotification(payload.data));
        }
      } catch {}
    };

    socket.onclose = (event) => {
      dispatch(setConnected(false));
      socketRef.current = null;
      if (isAuthenticated && !event.wasClean) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    };

    socket.onerror = () => socket.close();
  };

  // --- Push Notification Logic (Background/Killed State Updates) ---
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '95497ecd-0fd2-43d5-9078-c1a54f1f3aa4',
      })).data;
      
      console.log("--- NATIVE PUSH TOKEN ---");
      console.log(token);
      console.log("--------------------------");
      
      try {
        await registerPushToken({ 
          token, 
          platform: Platform.OS 
        }).unwrap();
        console.log("--- PUSH TOKEN REGISTERED WITH BACKEND ---");
      } catch (err) {
        console.log("--- FAILED TO REGISTER PUSH TOKEN WITH BACKEND ---", err);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    // 1. WebSocket Management
    if (isAuthenticated && accessToken) {
      connectWebSocket();
      registerForPushNotificationsAsync();
    } else {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      dispatch(setConnected(false));
      dispatch(setUnreadCount(0));
    }

    // 2. Push Notification Listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // This runs when a notification is received while the app is foregrounded
      console.log("Notification Received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // This runs when the user TAPS the notification
      const url = response.notification.request.content.data?.url as string | undefined;
      if (url) {
        // Example: dandelionz://receipt/123 -> /receipt/123
        const path = url.replace('dandelionz://', '/');
        router.push(path as any);
      }
    });

    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, accessToken]);

  // Handle app state changes for WebSocket
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isAuthenticated) connectWebSocket();
      if (state === "background") {
        socketRef.current?.close();
        dispatch(setConnected(false));
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, accessToken]);

  return (
    <NotificationContext.Provider value={undefined}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
