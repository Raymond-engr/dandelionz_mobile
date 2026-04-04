# Toast Implementation Plan for Dandelionz Mobile

## Overview
Currently, the Dandelionz Web App (`Dandelionz_App`) uses `react-hot-toast` to provide non-intrusive, auto-disappearing notifications for user actions (e.g., "Added to cart", "Profile updated"). 

In contrast, the Dandelionz Mobile App (`Dandelionz_Mobile`) either:
1.  Provides **no feedback** at all for successful actions (e.g., in `ProductCard`).
2.  Uses `Alert.alert`, which is **intrusive**, blocks the UI, and requires a manual tap to dismiss.

## Implementation Strategy
To achieve parity with the web app and improve UX, we should implement a toast system in the mobile app.

### Recommended Library
**`react-native-toast-message`**
- Industry standard for Expo/React Native.
- Easy to set up globally.
- Supports Success, Error, and Info types.
- Highly customizable to match the brand.

### Setup Steps
1.  **Install**: `npx expo install react-native-toast-message`
2.  **Global Provider**: Add `<Toast />` to the root layout (`app/_layout.tsx`).
3.  **Utility/Hook**: (Optional) Create a wrapper or just use the static `Toast` object.

---

## File Mapping & Action Plan

Based on the web app's usage of `toast`, here are the files in the mobile app that need updates:

| Feature Area | Web File (Reference) | Mobile File (Target) | Action Required |
| :--- | :--- | :--- | :--- |
| **Product Card** | `components/ProductCard.tsx` | `components/product-card.tsx` | Add Success toasts for "Added to Cart" and "Wishlist" toggles. |
| **Product Detail** | N/A (Web uses card logic) | `app/product/[slug].tsx` | Add Success toasts for Cart/Wishlist actions. |
| **Vendor Products** | `app/vendor/product/page.tsx` | `app/vendor/(tabs)/products.tsx` | Replace Success Alerts with Toasts (Submission/Deletion). |
| **Vendor Editing** | `app/vendor/product/[id]/edit/page.tsx` | `app/vendor/product/[id]/edit.tsx` | Replace Success Alerts with Toasts. |
| **Vendor New Product** | `app/vendor/product/new/page.tsx` | `app/vendor/product/new.tsx` | Replace Success Alerts with Toasts. |
| **User Profile** | `app/vendor/account/profile/page.tsx` | `app/vendor/account/profile.tsx` | Replace Success Alerts with Toasts. |
| **Notifications** | `app/vendor/account/notifications/page.tsx` | `app/vendor/account/notifications.tsx` | Replace Success Alerts with Toasts. |
| **Password/Security** | `app/vendor/account/change-password/page.tsx` | `app/vendor/account/change-password.tsx` | Replace Success Alerts with Toasts. |
| **Admin Actions** | `app/admin/...` | `app/(admin)/...` | Update various admin management screens (User status, Product approval, Category edits) to use Toasts for success. |

### Note on `Alert.alert` vs `Toast`
- **Use Toast for**: Brief confirmations (Success/Info) and minor errors.
- **Keep Alert for**: Critical confirmations (e.g., "Are you sure you want to delete your account?") and blocking errors that require user acknowledgment.

---

## Prompt for Implementation Session

Copy and paste the following prompt into a new session to execute this plan:

```markdown
I want to implement a non-intrusive toast notification system in the Dandelionz Mobile app to match the UX of the web app.

**Context:**
The web app uses `react-hot-toast`. The mobile app currently uses `Alert.alert` or provides no feedback for successful actions like "Add to Cart".

**Task:**
1. Install `react-native-toast-message`.
2. Wrap the root layout in `app/_layout.tsx` with the `Toast` provider.
3. Update `components/product-card.tsx` to show success toasts when adding/removing from cart or wishlist.
4. Update `app/product/[slug].tsx` to show success toasts for cart and wishlist actions.
5. Systematically go through the following files and replace `Alert.alert` "Success" messages with `Toast.show({ type: 'success', ... })`:
   - `app/vendor/(tabs)/products.tsx`
   - `app/vendor/product/[id]/edit.tsx`
   - `app/vendor/product/new.tsx`
   - `app/vendor/account/profile.tsx`
   - `app/vendor/account/notifications.tsx`
   - `app/vendor/account/change-password.tsx`
   - `app/(admin)/product/category/[id]/edit.tsx`
   - `app/(admin)/users/[id].tsx`
6. Ensure error alerts remain as `Alert.alert` if they are critical, or switch to `type: 'error'` toasts for minor errors.
```
