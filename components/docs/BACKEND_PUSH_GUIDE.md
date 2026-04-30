# 📱 Backend Integration Guide: Notifications & Push

This document outlines the requirements for the Dandelionz Backend to support both **Live Notifications (WebSockets)** and **Native Push Notifications (Expo/FCM)**. The frontend (Mobile & Web) has already implemented calls to these endpoints.

## 1. Notification Data Model
The frontend expects a standardized Notification object. Your database and API responses **MUST** match this structure:

```json
{
  "id": "uuid-string",
  "title": "New Order Received! 🛍️",
  "message": "Order #4432 has been placed. Tap to view details.",
  "priority": "high", 
  "category": "order",
  "action_url": "/orders/4432", 
  "action_text": "View Order",
  "is_read": false,
  "created_at": "2024-04-12T10:00:00Z",
  "read_at": null,
  "notification_type_display": "Order Update",
  "notification_type_icon": "shopping-cart",
  "notification_type_color": "#030482"
}
```
*Note: `action_url` can be a relative path (e.g., `/orders/UUID`). The app includes logic to map these to the correct mobile screens.*

---

## 2. API Endpoints

### A. Push Token Management
The app registers its unique device token to receive background notifications.
*   **Register Token:** `POST /user/notifications/register-token/`
    *   **Request:** `{ "token": "ExponentPushToken[xxx]", "platform": "android" | "ios" }`
    *   **Response:** `{ "success": true, "message": "Token registered" }`
*   **Unregister Token:** `POST /user/notifications/unregister-token/`
    *   **Request:** `{ "token": "ExponentPushToken[xxx]" }`

### B. Notification Management
*   **Get List:** `GET /user/notifications/`
    *   **Params:** `page`, `page_size`, `is_read` (boolean)
    *   **Response:** `{ "success": true, "data": [ ...NotificationObjects ] }`
*   **Mark as Read:** `POST /user/notifications/mark_as_read/`
    *   **Request:** `{ "notification_id": "uuid-string" }`
*   **Mark All as Read:** `POST /user/notifications/mark_all_as_read/`
    *   **Request:** `{}`
*   **Delete:** `DELETE /user/notifications/{id}/`
*   **Stats:** `GET /user/notifications/stats/`
    *   **Response:** 
    ```json
    { 
      "success": true, 
      "data": { 
        "unread_count": 5, 
        "total_notifications": 20,
        "last_notification_time": "2024-04-12T10:00:00Z"
      } 
    }
    ```

---

## 3. Real-Time Notifications (WebSockets)
Used for live updates while the app is in the foreground.
*   **URL:** `wss://dandelionz.net/ws/notifications/token=<access_token>`
*   **Message Format (from Server to Client):**
    ```json
    {
      "type": "notification",
      "data": { ...NotificationObject }
    }
    ```

---

## 4. Native Push Notifications (Background/Killed State)
When the app is closed, send a `POST` request to Expo's Push Service.

*   **URL:** `https://exp.host/--/api/v2/push/send`
*   **Payload:**
    ```json
    {
      "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      "title": "New Order Received! 🛍️",
      "body": "Order #4432 has been placed. Tap to view details.",
      "data": { 
        "url": "dandelionz://receipt/4432" 
      },
      "sound": "default",
      "priority": "high"
    }
    ```

### CRITICAL: The `data.url` Field
For Push Notifications, the `data.url` field **MUST** use the `dandelionz://` scheme. This triggers the app's deep-linking logic when the user taps the notification banner.

**Recommended URL Patterns:**
*   `dandelionz://receipt/:uuid` (View Order Receipt)
*   `dandelionz://orders/:uuid` (Track Order)
*   `dandelionz://account/notifications` (Open Inbox)

---

## 5. Trigger Events
1.  **Customer:** `order_shipped`, `order_delivered`, `payment_success`, `low_stock_alert`.
2.  **Vendor:** `new_order`, `settlement_completed`, `withdrawal_status_updated`.
3.  **Admin:** `new_vendor_request`, `large_withdrawal_pending`.

## 6. Testing
1.  **Local Test:** Use the **[Expo Push Tool](https://expo.dev/notifications)**.
2.  **Live Test:** Send a message to the WebSocket while the user is logged in.
3.  **Verification:** The app will automatically register its token on login. Check your `register-token` logs to find active tokens.
