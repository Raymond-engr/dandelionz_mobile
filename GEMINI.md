Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.
Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.

## April 4, 2026 - Toast Notification System Implementation
- Implemented a non-intrusive toast notification system using `react-native-toast-message`.
- Configured custom 'floating pill' design in `app/_layout.tsx` to match web app aesthetic.
- Replaced `Alert.alert` with `Toast.show` for success and validation feedback across all main flows (User, Vendor, Admin), including:
    - `app/(tabs)/wishlist.tsx` (Added to cart/Removed from wishlist)
    - `app/customer-notifications.tsx` (Marked as read/Notification deleted)
    - `app/account/delivery-address.tsx` (Address updated)
- Implemented copy-to-clipboard for Order ID and Transaction Reference:
    - `app/order-receipt.tsx` (Order ID and Transaction Ref)
    - `app/order-tracking.tsx` (Order ID)
- Retained standard alerts for critical confirmations (Log out, Delete, Discard).

## April 8, 2026 - Checkout Flow Alignment (Web & Mobile)
- Synchronized checkout flow across web and mobile: Cart -> Frequency -> Shipping -> Payment/Installment.
- Ensured shipping address step is always included in the installment flow for both platforms.
- Replaced manual address input in mobile app with profile-based address display and management.
- Added address validation in the Shipping step for both apps.
- Aligned progress indicator steps, button labels, and frequency options to ensure a consistent experience.
- Fixed an issue where "View E-Receipt" failed on the success screen by ensuring the verified `order_id` (UUID) is used instead of the transaction `reference`.
- Fixed broken images in the Cart tab by implementing a `getImageUrl` utility to handle relative image paths from the API.
- Resolved a "frozen screen" issue on the Checkout Success page by implementing one-time lazy verification and using a `useRef` guard to prevent redundant API calls during back navigation.
- Added a 3-second auto-redirect fallback to all Success screens (Checkout, Withdrawal, Registration) to prevent users from getting stuck and improve UX.
- Enabled pull-to-refresh on the Cart screen to allow users to update their cart state even when it's empty.
## April 12, 2026 - Backend Push Guide Synchronization
- Synchronized `BACKEND_PUSH_GUIDE.md` with the current mobile and web app frontend implementations.
- Updated all endpoint paths to match `notificationApi.ts` and `customerApi.ts` (e.g., `/user/notifications/...`).
- Provided detailed JSON request/response schemas for all notification management endpoints (Register/Unregister token, Mark as Read, Delete, Stats).
- Clarified the distinction between `action_url` (relative paths for the inbox) and `data.url` (deep links for push banners).
- Added WebSocket connection details (`wss://api.dandelionz.com.ng/ws/notifications/token=<access_token>`) for live foreground notifications.
- Verified that all URL mapping logic (from `lib/utils.ts`) and notification models are accurately reflected in the guide.

## April 15, 2026 - Success Page Stack Navigation Alignment
- Synchronized all "Success" screens (`app/checkout/success.tsx`, `app/vendor/wallet/success.tsx`, `app/(auth)/registration-success.tsx`) with a robust navigation pattern.
- Implemented `StackActions.popToTop()` across all success flows to ensure multi-step stacks (e.g., Shipping -> Payment -> Success) are cleared upon completion. This prevents "back-button loops" into finished processes.
- Standardized the auto-redirect logic by separating the countdown timer from the navigation trigger into two independent `useEffect` hooks, eliminating race conditions and "frozen screen" issues during transitions.
- Verified that roles using standard `Toast` feedback (like Admin withdrawal) remain unaffected while ensuring architectural consistency for all dedicated success pages.
- Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.

