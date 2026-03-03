'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { 
  setUnreadCount, 
  incrementUnreadCount, 
  setConnected,
  addNotification 
} from './notificationSlice';
import { toast } from 'react-hot-toast';
import { customerApi } from '@/lib/api/customerApi';

const NotificationContext = createContext<void | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, user } = useAppSelector((state) => state.auth);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the unified stats endpoint (via customerApi as a proxy since they share the URL)
  const [triggerGetStats] = customerApi.useLazyCustomerGetNotificationStatsQuery();

  const connectWebSocket = () => {
    if (!accessToken || socketRef.current?.readyState === WebSocket.OPEN) return;

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Using the domain from your backend configuration
    const wsUrl = `${wsProtocol}//dandelionz.net/ws/notifications/token=${accessToken}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Notification WebSocket connected');
      dispatch(setConnected(true));
      // Hydrate initial stats on connection
      triggerGetStats().unwrap().then((response) => {
        if (response.success) {
          dispatch(setUnreadCount(response.data.unread_count));
        }
      });
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'notification') {
          const notificationData = payload.data;
          dispatch(addNotification(notificationData));
          toast.success(notificationData.title || 'New notification', {
            icon: '🔔',
            duration: 4000,
          });
        }
      } catch (error) {
        console.error('Error parsing notification message:', error);
      }
    };

    socket.onclose = (event) => {
      console.log('Notification WebSocket closed:', event.reason);
      dispatch(setConnected(false));
      socketRef.current = null;

      // Reconnect if still authenticated
      if (isAuthenticated && !event.wasClean) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };

    socket.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
      socket.close();
    };
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectWebSocket();
    } else {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      dispatch(setConnected(false));
      dispatch(setUnreadCount(0));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, accessToken]);

  return (
    <NotificationContext.Provider value={undefined}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
