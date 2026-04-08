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
