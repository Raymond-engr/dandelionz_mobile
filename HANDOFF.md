# Dandelionz Mobile: Project Handoff & Session Context

## 🎯 Current Status: Replication Complete
As of March 31, 2026, the Web-to-Mobile replication for **Dandelionz** is functionally complete across all three primary roles (Customer, Admin, and Vendor). All screens follow the standardized Design System rules.

### ✅ Accomplishments in this Session:
1.  **Customer Role**:
    *   Implemented secure **WebView-based Checkout** for Paystack.
    *   Created **Order Tracking** (with live timeline) and **Order Receipt** screens.
    *   Refactored **Category Detail** with standardized headers and 21px padding.
2.  **Admin Role**:
    *   Built the **Settlements & Payouts** management system.
    *   Implemented **Withdrawal Processing** (Approve/Reject flow).
    *   Created **Payment Settings** (PIN & Bank) and admin personal withdrawal screens.
3.  **Vendor Role**:
    *   Complete **Product Management** overhaul (New, Edit, Drafts).
    *   Refactored **Wallet Dashboard** and **Transaction History**.
    *   Created **Profile Edit** (with Image Picker) and **Security** screens.
4.  **Foundation**:
    *   Standardized **24px centered headers**, **21px horizontal padding**, and **55px buttons**.
    *   Implemented **Skeleton Loaders** for all major data-heavy screens.
    *   Configured **Deep Linking** (`dandelionz://`) for all new routes in `app.json`.

---

## 🚀 Next Step: Native Features (Push Notifications & Biometrics)

The project is now ready to move from "Replication" to "Native Enhancement." 

**Technical Context for Notifications:**
*   **Current State**: Notifications use WebSockets (`NotificationProvider.tsx`) which only work while the app is in the foreground.
*   **Requirement**: Migrate to **Expo Notifications** and **Firebase Cloud Messaging (FCM)** to allow background/killed-state alerts for Orders, Withdrawals, and Vendor alerts.
*   **Deep Linking**: Most screens are already mapped in `app.json`. Notifications should utilize these routes to open specific orders or receipts.

---

## 🤖 Master Prompt for Next Session

> "I am continuing work on the **Dandelionz Mobile** project. We have successfully replicated the Web App's UI and functionality. The project uses **Expo**, **NativeWind v4**, and **RTK Query**. 
>
> **Your Task:** Implement **Native Push Notifications** and **Biometric Auth**.
> 1. Read `PROGRESS.md` and `HANDOFF.md` in the root for context.
> 2. Refer to `lib/features/notification/NotificationProvider.tsx` to see how foreground notifications currently work via WebSockets.
> 3. Refer to `app.json` for the existing deep-linking scheme.
> 4. Implementation Goal: 
>    - Setup `expo-notifications`.
>    - Create a logic to register the native device token with the backend (see `baseApi.ts` for headers).
>    - Handle notification taps using the existing deep-linking routes.
>    - Add `expo-local-authentication` for Biometric (FaceID/TouchID) protection on the 'Confirm PIN' screens in Admin and Vendor roles.
> 
> Start by analyzing the current `NotificationProvider.tsx` and proposing a plan for FCM integration."

---

## 📂 Key Files to Reference

### Dandelionz_Mobile (Current Repo)
- `app/_layout.tsx`: Main Stack and Route definitions.
- `app.json`: Scheme and Deep Linking configuration.
- `lib/api/`: `baseApi.ts`, `vendorApi.ts`, `adminApi.ts` (Endpoint definitions).
- `lib/features/notification/`: `NotificationProvider.tsx` and `notificationSlice.ts`.
- `components/ui/`: `button.tsx`, `divider.tsx`, `skeleton.tsx` (Core UI).

### Dandelionz_App (Web Context)
- `lib/features/notification/`: Original WebSocket implementation.
- `design/DESIGN_SYSTEM.md`: UI source of truth.
- `customer_docs.md`, `vendor_docs.md`: API flow documentation.
