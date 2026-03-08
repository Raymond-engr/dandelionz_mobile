import { customerApi } from "@/lib/api/customerApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { AppState } from "react-native";
import {
  addNotification,
  setConnected,
  setUnreadCount,
} from "./notificationSlice";

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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [triggerGetStats] =
    customerApi.useLazyCustomerGetNotificationStatsQuery();

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

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectWebSocket();
    } else {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      dispatch(setConnected(false));
      dispatch(setUnreadCount(0));
    }
    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isAuthenticated, accessToken]);

  // Handle app going to background (WebSocket dies on mobile)
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
