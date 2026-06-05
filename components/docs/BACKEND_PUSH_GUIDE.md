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

_Note: `action_url` can be a relative path (e.g., `/orders/UUID`). The app includes logic to map these to the correct mobile screens._

---

## 2. API Endpoints

### A. Push Token Management

The app registers its unique device token to receive background notifications.

- **Register Token:** `POST /user/notifications/register-token/`
  - **Request:** `{ "token": "ExponentPushToken[xxx]", "platform": "android" | "ios" }`
  - **Response:** `{ "success": true, "message": "Token registered" }`
- **Unregister Token:** `POST /user/notifications/unregister-token/`
  - **Request:** `{ "token": "ExponentPushToken[xxx]" }`

### B. Notification Management

- **Get List:** `GET /user/notifications/`
  - **Params:** `page`, `page_size`, `is_read` (boolean)
  - **Response:** `{ "success": true, "data": [ ...NotificationObjects ] }`
- **Mark as Read:** `POST /user/notifications/mark_as_read/`
  - **Request:** `{ "notification_id": "uuid-string" }`
- **Mark All as Read:** `POST /user/notifications/mark_all_as_read/`
  - **Request:** `{}`
- **Delete:** `DELETE /user/notifications/{id}/`
- **Stats:** `GET /user/notifications/stats/`
  - **Response:**
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

- **URL:** `wss://api.dandelionz.com.ng/ws/notifications/token=<access_token>`
- **Message Format (from Server to Client):**
  ```json
  {
    "type": "notification",
    "data": { ...NotificationObject }
  }
  ```

---

## 4. Native Push Notifications (Background/Killed State)

When the app is closed, send a `POST` request to Expo's Push Service.

- **URL:** `https://exp.host/--/api/v2/push/send`
- **Payload:**
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

- `dandelionz://receipt/:uuid` (View Order Receipt)
- `dandelionz://orders/:uuid` (Track Order)
- `dandelionz://account/notifications` (Open Inbox)

---

## 5. Trigger Events

1.  **Customer:** `order_shipped`, `order_delivered`, `payment_success`, `low_stock_alert`.
2.  **Vendor:** `new_order`, `settlement_completed`, `withdrawal_status_updated`.
3.  **Admin:** `new_vendor_request`, `large_withdrawal_pending`.

## 6. Testing

1.  **Local Test:** Use the **[Expo Push Tool](https://expo.dev/notifications)**.
2.  **Live Test:** Send a message to the WebSocket while the user is logged in.
3.  **Verification:** The app will automatically register its token on login. Check your `register-token` logs to find active tokens.

Here is the "Ultimate Prompt" you can use if you get access to the Django repository. This prompt is designed to help
an AI agent (like me or another) understand exactly what to fix in the Django code to match your mobile app.

💡 The "Alignment" Prompt for your Django Backend:

> "I am working on a Django backend for the Dandelionz Mobile app. My goal is to ensure the backend correctly sends
> push notifications through the Expo Push Service and handles live updates via WebSockets.
>
> Please analyze the Django repository and check the following:
>
> 1. Token Storage: Do we have a model (e.g., PushToken) that stores the ExponentPushToken, platform (android/ios),
>    and maps them to a User?
> 2. Notification Logic: Look for where notifications are triggered (e.g., signals, services, or views for 'New Order' or 'Order Shipped').
> 3. The Payload: Ensure that when a push is sent to https://exp.host/--/api/v2/push/send, it includes a data object
>    with a url field using the dandelionz:// scheme (e.g., dandelionz://receipt/<uuid>).
> 4. WebSocket URL: Verify that the WebSocket endpoint follows the pattern ws/notifications/token=<access_token> to
>    match the mobile app's connection logic.
> 5. FCM Alignment: Check if we are using a library like django-push-notifications or a custom script. If it's custom, ensure it isn't using the 'Legacy FCM' server keys, as Google is deprecating them.
>
> Goal: Align the Django notification service with the BACKEND_PUSH_GUIDE.md found in the mobile repo to ensure background and foreground notifications work seamlessly."

Summary of what to tell the Backend dev:

1.  "The app is ready and waiting for notifications at the dandelionz:// scheme."
2.  "Please store the ExponentPushToken we send you when we log in."
3.  "When sending a push, make sure the data object has a url like dandelionz://orders/ID."
4.  "If you use the 'prompt' I gave you earlier, it will guide an AI to check your specific Django code for these
    exact things."Logic: Look for where notifications are triggered (e.g., signals, services, or views for 'New Order'  or 'Order Shipped').
  > 3. The Payload: Ensure that when a push is sent to <https://exp.host/--/api/v2/push/send>, it includes a data object
  with a url field using the dandelionz:// scheme (e.g., dandelionz://receipt/<uuid>).
  > 4. WebSocket URL: Verify that the WebSocket endpoint follows the pattern ws/notifications/token=<access_token> to
  match the mobile app's connection logic.
  > 5. FCM Alignment: Check if we are using a library like django-push-notifications or a custom script. If it's custom,  ensure it isn't using the 'Legacy FCM' server keys, as Google is deprecating them.
  >
  > Goal: Align the Django notification service with the BACKEND_PUSH_GUIDE.md found in the mobile repo to ensure background and foreground notifications work seamlessly."

  Summary of what to tell the Backend dev:

   1. "The app is ready and waiting for notifications at the dandelionz:// scheme."
   2. "Please store the ExponentPushToken we send you when we log in."
   3. "When sending a push, make sure the data object has a url like dandelionz://orders/ID."
   4. "If you use the 'prompt' I gave you earlier, it will guide an AI to check your specific Django code for these
      exact things."
