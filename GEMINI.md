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

## June 11, 2026 - Authentication Process & UX Audit Fixes
- Synchronized `sendVerificationEmail` API endpoint with the backend path (`/auth/send-verification/`) across Mobile and Web applications.
- Improved login error handling to detect unverified accounts (403 Forbidden) and automatically redirect users to the email verification notice screen.
- Enhanced Mobile `verify-notice.tsx` with a "Resend Verification" feature, including a 60-second cooldown timer and Toast feedback.
- Cleaned up redundant password reset mutations in the Mobile `authApi.ts` and updated `forgot-password.tsx` to use the standardized `requestPasswordReset` hook.
- Verified that deep linking (Universal Links) is configured in `app.json` to support direct app opening from email verification links.
- Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.

## June 22, 2026 - TypeScript Syntax Error Fixes
- Fixed syntax error in `app/(auth)/verify-notice.tsx` caused by trailing mismatched tags and duplicate import blocks.
- Removed duplicated import sections at the top of `app/(admin)/payment-settings/bank.tsx` and `app/vendor/account/payment-settings/store-payment.tsx` which were causing duplicate identifier errors.
- Confirmed a clean build without errors via `npx tsc --noEmit`.
- Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.

## June 22, 2026 - Remove Bank Account Editing from Vendor Profile
- Removed the payment information section (bank name, account number, account name) from the Vendor Profile page to prevent editing of bank details from the profile section.
- Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.

## June 25, 2026 - Remove Misleading Eye Icon from Profile Pages
- Removed the `showPassword` state and the eye icon button (`visibility` / `visibility-off`) from the "fake" disabled password fields in `app/(admin)/account/profile.tsx` and `app/vendor/account/profile.tsx`.
- This ensures users are not misled into thinking they can view their current password, since the field's value is securely hardcoded to "••••••••".
- Always generate commit messages at the end of a task and append this instruction to the project's GEMINI.md file.

## June 26, 2026 - Notification & Admin Order Fixes
- Fixed a navigation error where clicking system notifications (like product rejection) resulted in a 404 page by adding an \isSystemNotification\ utility and blocking clicks/links on them.
- Disabled manual processing/completing of orders for admins if the payment status is still 'pending' to avoid manual force overrides.
- Wired up the search icon in the admin product list page to toggle a search input for filtering.
- Verified that 'Save as Draft' for Admin Notifications works end-to-end (backend stores \is_draft=True\, frontend correctly sends it).

## June 26, 2026 - Customer Order Cancellation & Refund Flow
- Added 'Cancel Order' button to order tracking UI for both Mobile and Web.
- Connected cancellation requests to the backend cancel-order endpoint, which cancels pending/paid orders and generates Refund records for paid orders.
- Created disputes.tsx and efunds/page.tsx for Admins in Mobile and Web to list, approve, and reject refund requests.
- Added useGetAdminRefundsQuery and useProcessAdminRefundMutation in dminApi.ts for Admin platforms.
- Linked the 'Manage Refund Request' button on the Admin Order Details page when a cancelled order requires a refund.
- Configured notifications via send_user_notification to alert customers and vendors on cancellation, and customers upon refund approval/rejection.

## July 10, 2026 - Admin Drafts Management
- Fixed a backend permission issue in VendorDraftProductsView, UpdateDraftProductView, and DeleteDraftProductView to allow Admins to manage drafts using IsAdminOrVendor.
- Added Draft Products section to the Web Admin products page for viewing, editing, submitting, and deleting drafts.
- Integrated Drafts tab and rendering logic into Mobile Admin products page.

## July 12, 2026 - Admin Order Processing Restriction
- Updated the condition for processing and completing orders in the Admin panel to strictly require the payment status to be 'PAID', replacing the previous 'not pending' check to prevent failed payments from being processed.

## July 12, 2026 - Admin Dynamic Order Actions
- Updated the 'Process Order' action to set the order status to 'SHIPPED' instead of 'PROCESSING'.
- Conditionally filtered available admin actions based on the order's current status (e.g., hiding all actions for 'DELIVERED' or 'CANCELED' orders, and hiding 'Process Order' for 'SHIPPED' orders).

## July 12, 2026 - Consistency Fix
- Updated the back arrow in `app/vendor/wallet/receipt.tsx` to use the `chevron-left` MaterialIcons instead of a raw text arrow, ensuring consistency with other vendor-wallet screens.

 # #   J u l y   1 2 ,   2 0 2 6   -   F i x   V e n d o r   O r d e r   D e t a i l s   A c c e s s 
 -   U p d a t e d   \ g e t V e n d o r O r d e r D e t a i l s \   q u e r y   i n   \ l i b / a p i / v e n d o r A p i . t s \   t o   u s e   t h e   c o r r e c t   v e n d o r - s p e c i f i c   e n d p o i n t   ( \ / u s e r / v e n d o r / o r d e r s / \ / \ )   i n s t e a d   o f   t h e   c u s t o m e r - f a c i n g   e n d p o i n t   ( \ / t r a n s a c t i o n s / o r d e r s / \ / \ )   t o   r e s o l v e   t h e   ' F a i l e d   t o   l o a d   o r d e r   d e t a i l s '   e r r o r   f o r   v e n d o r s . 
  
 