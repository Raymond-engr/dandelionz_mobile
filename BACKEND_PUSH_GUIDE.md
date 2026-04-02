# 📱 Backend Integration Guide: Push Notifications

This document outlines the requirements for the Dandelionz Backend to support Native Push Notifications for the Mobile App (iOS & Android).

## 1. The Core Concept: The "Device Token"
Every mobile device generates a unique **Push Token** (or Registration Token). Think of this like a temporary phone number for notifications.
*   The Mobile App will send this token to the backend when a user logs in.
*   The Backend **MUST** store this token in the database, linked to the `User` ID.

## 2. Required API Changes

### A. Endpoint: Register/Update Token
The app needs an endpoint to "hand over" its token.
*   **Method:** `POST`
*   **Path:** (e.g., `/api/notifications/register-token/`)
*   **Payload:**
    ```json
    {
      "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      "platform": "android" | "ios"
    }
    ```
*   **Logic:**
    *   If the token exists for another user, move it to the current user (one device = one user).
    *   Store multiple tokens if a user logs in on an iPad and an Android phone.

### B. Endpoint: Unregister Token (Logout)
When a user logs out, the backend should delete that specific token so they stop receiving notifications on that device.

---

## 3. Sending Notifications (Server-Side)

Since we are using **Expo**, the backend doesn't need to talk directly to Google or Apple. You only need to send a simple `POST` request to Expo's server.

*   **URL:** `https://exp.host/--/api/v2/push/send`
*   **Headers:** `Content-Type: application/json`
*   **Example Payload:**
    ```json
    {
      "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      "title": "New Order Received! 🛍️",
      "body": "Order #4432 has been placed. Tap to view details.",
      "data": { 
        "url": "dandelionz://receipt/4432" 
      },
      "sound": "default"
    }
    ```

### Important Field: `data`
The `data` object is invisible to the user but critical for the app. 
*   Always include a `url` field using our **Deep Link** scheme (defined in `app.json`).
*   This allows the app to automatically "jump" to the correct screen when the user taps the notification.

---

## 4. When to Trigger Notifications
The backend should trigger a push notification for the following events:
1.  **Customer:** Order Status Change (Shipped/Delivered), New Promotion.
2.  **Vendor:** New Order Received, Withdrawal Approved/Rejected.
3.  **Admin:** New User Registration (Optional), Large Withdrawal Request.

## 5. Testing Tools
You can test your implementation without the mobile app using the **[Expo Push Tool](https://expo.dev/notifications)**. Just paste the token I send you from the app logs and hit "Send".
