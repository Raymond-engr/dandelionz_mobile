import { customerApi } from "@/lib/api/customerApi";
import { useRegisterPushTokenMutation, useUnregisterPushTokenMutation } from "@/lib/api/notificationApi";
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

// ─── CRITICAL FIX ─────────────────────────────────────────────────────────────
//
// The original file called Notifications.setNotificationHandler() at MODULE
// EVALUATION TIME (top-level code, outside any component or function). In a
// production / preview EAS build on Android, expo-notifications relies on
// Firebase Cloud Messaging (FCM). If FCM has not fully initialised by the time
// the JS bundle evaluates this module — which is common on first cold start
// with Hermes, where module evaluation order can differ from development — the
// call throws a native exception synchronously.
//
// Because this happens before React even begins rendering, neither an
// ErrorBoundary nor a try/catch inside a component can catch it. The JS thread
// crashes, React Native's canvas never paints, and the result is a permanent
// white screen.
//
// Fix: move setNotificationHandler inside a useEffect with a try/catch so it
// runs after the component mounts, inside the React lifecycle, and any failure
// is contained and logged rather than crashing the whole app.
// ─────────────────────────────────────────────────────────────────────────────

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

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const [triggerGetStats] = customerApi.useLazyCustomerGetNotificationStatsQuery();
  const [registerPushToken] = useRegisterPushTokenMutation();
  const [unregisterPushToken] = useUnregisterPushTokenMutation();

  // Track last registered token so we can unregister on logout
  const lastRegisteredTokenRef = useRef<string | null>(null);

  // ── Configure the notification handler inside an effect, never at module level
  useEffect(() => {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      // Non-fatal: notifications simply won't show while the app is foregrounded.
      console.warn("[NotificationProvider] setNotificationHandler failed:", e);
    }
  }, []);

  // ── WebSocket helper (unchanged logic, errors already handled inside)
  const connectWebSocket = () => {
    if (!accessToken || socketRef.current?.readyState === WebSocket.OPEN) return;
    if (socketRef.current) {
      try { socketRef.current.close(); } catch (_) {}
    }

    const wsUrl = `wss://api.dandelionz.com.ng/ws/notifications/?token=${accessToken}`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        dispatch(setConnected(true));
        triggerGetStats()
          .unwrap()
          .then((response) => {
            if (response.success) dispatch(setUnreadCount(response.data.unread_count));
          })
          .catch(() => {});
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "notification") {
            dispatch(addNotification(payload.data));
          }
        } catch (_) {}
      };

      socket.onclose = (event) => {
        dispatch(setConnected(false));
        socketRef.current = null;
        if (isAuthenticated && !event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        }
      };

      socket.onerror = () => {
        try { socketRef.current?.close(); } catch (_) {}
      };
    } catch (e) {
      console.warn("[NotificationProvider] WebSocket init failed:", e);
    }
  };

  // ── Push token registration — fully wrapped in try/catch
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) return;

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      const tokenResponse = await Promise.race([
        Notifications.getExpoPushTokenAsync({
          projectId: "95497ecd-0fd2-43d5-9078-c1a54f1f3aa4",
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Push token timeout")), 10000),
        ),
      ]) as Awaited<ReturnType<typeof Notifications.getExpoPushTokenAsync>>;

      if (tokenResponse?.data) {
        lastRegisteredTokenRef.current = tokenResponse.data;
        await registerPushToken({
          token: tokenResponse.data,
          platform: Platform.OS,
        }).unwrap();
      }
    } catch (e) {
      // Non-fatal: app works fine without push tokens.
      console.warn("[NotificationProvider] Push registration failed:", e);
    }
  }

  // ── Main effect: WebSocket + push listeners
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectWebSocket();
      registerForPushNotificationsAsync();
    } else {
      // Unregister push token on logout so stale sessions don't receive pushes
      if (lastRegisteredTokenRef.current) {
        unregisterPushToken({ token: lastRegisteredTokenRef.current }).catch(() => {});
        lastRegisteredTokenRef.current = null;
      }
      if (socketRef.current) {
        try { socketRef.current.close(); } catch (_) {}
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      dispatch(setConnected(false));
      dispatch(setUnreadCount(0));
    }

    // Attach listeners inside try/catch — on some Android configurations
    // (especially preview builds before FCM is fully ready) these can throw.
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          // Dispatch the incoming push notification into Redux so the
          // unread count badge and in-app notification list update immediately
          // even when the WebSocket is not connected.
          const { title, body, data } = notification.request.content;
          dispatch(addNotification({
            id: notification.request.identifier,
            title: title ?? "",
            message: body ?? "",
            is_read: false,
            created_at: new Date().toISOString(),
            category: (data?.category as string) ?? "general",
            action_url: (data?.url as string) ?? null,
            metadata: data ?? {},
          } as any));
          // Also refresh the unread count from the server
          triggerGetStats()
            .unwrap()
            .then((response) => {
              if (response.success) dispatch(setUnreadCount(response.data.unread_count));
            })
            .catch(() => {});
        },
      );
    } catch (e) {
      console.warn("[NotificationProvider] addNotificationReceivedListener failed:", e);
    }

    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const url = response.notification.request.content.data?.url as
            | string
            | undefined;
          if (url) {
            const path = url.replace("dandelionz://", "/");
            router.push(path as any);
          }
        },
      );
    } catch (e) {
      console.warn("[NotificationProvider] addNotificationResponseReceivedListener failed:", e);
    }

    return () => {
      try { socketRef.current?.close(); } catch (_) {}
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      try { notificationListener.current?.remove(); } catch (_) {}
      try { responseListener.current?.remove(); } catch (_) {}
      notificationListener.current = null;
      responseListener.current = null;
    };
  }, [isAuthenticated, accessToken]);

  // ── App-state handler to reconnect WebSocket on foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isAuthenticated) connectWebSocket();
      if (state === "background") {
        try { socketRef.current?.close(); } catch (_) {}
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